import fs from "fs";
import path from "path";
import { db } from "./firebaseConfig.js"; // Make sure firebaseConfig exports 'db'
import { collection, getDocs } from "firebase/firestore";

const BASE_URL = "https://sl-api-v1.onrender.com/api/projects";
const DOMAIN = "https://snaplabs.js.org"; // Keep domain as a variable

const STATIC_ROUTES = [
  "/",
  "/privacy-policy",
  "/leaderboard",
  "/account", 
  "/admin/dashboard", 
  "/AI-Assistant", 
  "/search", 
  "/dashboard", 
  "/community-projects",
  "/editor-frame"
];

/**
 * Fetch all projects with Admin=True and guest access.
 * Stops after 2 consecutive 404s.
 */
async function fetchAllProjects() {
  const projects = [];
  let consecutive404 = 0;
  let id = 1;

  while (consecutive404 < 2) {
    const url = `${BASE_URL}/${id}/meta/guest?Admin=True`;
    try {
      const res = await fetch(url);
      if (res.status === 404) {
        consecutive404++;
      } else if (res.ok) {
        projects.push(id);
        consecutive404 = 0; // reset on success
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

/**
 * Fetch all users from Firestore and return their usernames.
 */
async function fetchAllUsers() {
  const usernames = [];
  const usersCol = collection(db, "users");
  const usersSnapshot = await getDocs(usersCol);

  usersSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.username) {
      usernames.push(data.username);
    }
  });

  return usernames;
}

async function generateSitemap() {
  const urls = [...STATIC_ROUTES];

  // 1️⃣ Add all projects
  console.log("Fetching all projects with Admin=True and guest access...");
  const projects = await fetchAllProjects();
  console.log(`Found ${projects.length} projects`);

  projects.forEach((projId) => {
    urls.push(`/projects/${projId}`);
    urls.push(`/projects/${projId}/editor`);
  });

  // 2️⃣ Add all users
  console.log("Fetching all users from Firestore...");
  const usernames = await fetchAllUsers();
  console.log(`Found ${usernames.length} users`);

  usernames.forEach((username) => {
    urls.push(`/users/${username}`);
  });

  // 3️⃣ Build sitemap XML
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

  // 4️⃣ Write sitemap to public folder
  const outputPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(outputPath, sitemap, "utf-8");
  console.log(`Sitemap generated at ${outputPath}`);
}

// Run the script
generateSitemap().catch((err) => console.error(err));
