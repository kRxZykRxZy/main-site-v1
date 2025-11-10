import React, { useEffect, useState } from "react";

export default function SnapLabs() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFeaturedProjects() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          "https://corsproxy.io/?url=https://sl-api-v1.onrender.com/api/projects"
        );
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch (err) {
        console.error("Error fetching featured projects:", err);
        setError(`Failed to load projects. Please try again later. (${err.message})`);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProjects();
  }, []);

  function escapeHTML(str = "") {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  return (
    <div className="font-inter bg-gray-50 text-slate-700 min-h-screen antialiased">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 px-4 text-center rounded-b-lg shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Unleash Your Creativity with <br className="hidden sm:inline" /> SnapLabs
          </h1>
        </div>
      </section>

      {/* Projects Section */}
      <section id="featured-projects" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Uploaded Projects</h2>

          {loading && (
            <div className="flex justify-center mb-6">
              <span className="loading-spinner border-4 border-gray-200 border-t-blue-500 rounded-full w-6 h-6 animate-spin inline-block"></span>
            </div>
          )}

          {error && <div className="text-center text-red-500 mb-6">{error}</div>}

          {!loading && !error && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {projects.length === 0 ? (
                <p className="col-span-full text-gray-600">
                  No featured projects available at the moment.
                </p>
              ) : (
                projects.map((project, i) => {
                  const link = '/projects/' + project.id;
                  const imageSrc = `https://sl-api-v1.onrender.com${project.image || "/static/No%20Cover%20Available.png"}`;
                  return (
                    <div
                      key={i}
                      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
                    >
                      <img
                        src={imageSrc}
                        alt={`${escapeHTML(project.name)} thumbnail`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/No%20Cover%20Available.png";
                        }}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Author: {project.author}
                      </p>
                      <a
                        href={link}
                        className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
                      >
                        View Project
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
