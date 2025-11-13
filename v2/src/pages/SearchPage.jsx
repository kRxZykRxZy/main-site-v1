import React, { useEffect, useState } from "react";
import { API } from "../utils/api_base";

const SearchPage = () => {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setQuery(q);

    const fetchData = async () => {
      try {
        const data = await API.getProjects();
        const filtered = data.projects.filter((p) =>
          p.name.toLowerCase().includes(q.toLowerCase())
        );
        setProjects(filtered);
      } catch (err) {
        console.error("Search page error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for "<span className="text-indigo-600">{query}</span>"
      </h1>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <a
              key={proj.id}
              href={`/projects/${proj.id}`}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition duration-200 overflow-hidden"
            >
              <img
                src={proj.image}
                alt={proj.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{proj.name}</h2>
                <p className="text-sm text-gray-500">by {proj.author}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Popularity: {proj.popularity}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
