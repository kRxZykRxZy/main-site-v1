import fs from "fs";
import path from "path";
import { db } from "./firebaseConfig.js"; // make sure firebaseConfig exports 'db'
import { collection, getDocs } from "firebase/firestore";

const BASE_URL = "https://sl-api-v1.onrender.com/api/projects";
const DOMAIN = "https://snaplabs.js.org"; 

const STATIC_ROUTES = [
  "/",
  "/privacy-policy",
  "/leaderboard",
  "/account"
];

async function fetchProjectsForUser(userId) {
  const projects = [];
  let consecutive404 = 0;
  let id = 1;

  while (consecutive404 < 2) {
    const url = `${BASE_URL}/${id}/meta/guest?Admin=True&userId=${userId}`;
    try {
      const res = await fetch(url);
      if (res.status === 404) {
        consecutive404++;
      } else if (res.ok) {
        projects.push(id);
        consecutive404 = 0;
      } else {
        console.warn(`Unexpected response for ${url}: ${res.status}`);
        consecutive404++;
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      consecutive404++;
    }
    id++;
  }

  return projects;
}

async function generateSitemap() {
  const urls = [...STATIC_ROUTES];

  // Fetch all users from Firestore
  const usersCol = collection(db, "users");
  const usersSnapshot = await getDocs(usersCol);

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    console.log(`Fetching projects for user: ${userId}`);
    const projects = await fetchProjectsForUser(userId);
    projects.forEach((projId) => {
      urls.push(`/projects/${projId}/editor`);
    });
  }

  // Build sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `
  <url>
    <loc>${u.startsWith("http") ? u : `${DOMAIN}${u}`}</loc>
  </url>`
  )
  .join("")}
</urlset>`;

  // Write to public/sitemap.xml
  const outputPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(outputPath, sitemap, "utf-8");
  console.log(`Sitemap generated at ${outputPath}`);
}

// Run the script
generateSitemap().catch((err) => console.error(err));
