import React, { Component } from "react";
import { auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      loading: false,
      error: null,
      search: "",
      sort: "az",
      authorized: false,
    };
  }

  componentDidMount() {
    onAuthStateChanged(auth, (user) => {
      if (!user || user.displayName !== "Admin") {
        window.location.href = "/404";
        return;
      }
      this.setState({ authorized: true });
      this.fetchAllProjects();
    });
  }

  async fetchAllProjects() {
    this.setState({ loading: true, error: null });

    const fetchedProjects = [];
    let consecutiveErrors = 0;
    let id = 1;

    while (consecutiveErrors < 2) {
      try {
        const url = `https://corsproxy.io/?url=https://sl-api-v1.onrender.com/api/projects/${id}/meta/guest?Admin=True`;
        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 500) {
            consecutiveErrors++;
            id++;
            continue;
          }
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        fetchedProjects.push({
          id: data.id,
          name: data.title,
          author: data.author.username,
          image: data.image || "/static/No%20Cover%20Available.svg",
          stats: data.stats,
          description: data.description
        });

        consecutiveErrors = 0;
        id++;
      } catch (err) {
        console.error(err);
        this.setState({ error: err.message, loading: false });
        return;
      }
    }

    this.setState({ projects: fetchedProjects, loading: false });
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  getFilteredAndSortedProjects() {
    const { projects, search, sort } = this.state;

    let filtered = projects.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

    if (sort === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") filtered.sort((a, b) => b.name.localeCompare(a.name));

    return filtered;
  }

  renderProjects() {
    const projects = this.getFilteredAndSortedProjects();

    if (this.state.loading) {
      return <p className="text-center text-gray-600 col-span-full">Loading projects...</p>;
    }

    if (this.state.error) {
      return <p className="text-center text-red-500 col-span-full">{this.state.error}</p>;
    }

    if (projects.length === 0) {
      return <p className="text-center text-gray-600 col-span-full">No projects available.</p>;
    }

    return projects.map((project, index) => {
      const pLink = `/projects/${project.id}`;
      return (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
        >
          <img
            src={`https://sl-api-v1.onrender.com${project.image}`}
            alt={`${project.name} thumbnail`}
            className="w-full h-40 object-cover rounded-md mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/static/No%20Cover%20Available.svg";
            }}
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{this.escapeHTML(project.name)}</h3>
          <p className="text-gray-600 text-sm mb-2">Author: {project.author}</p>
          <p className="text-gray-600 text-sm mb-4">Views: {project.stats.views} | Loves: {project.stats.loves} | Favorites: {project.stats.favorites} | Remixes: {project.stats.remixes}</p>
          <p className="text-gray-500 text-sm mb-4">{this.escapeHTML(project.description)}</p>
          <a
            href={pLink}
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
          >
            View Project
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      );
    });
  }

  render() {
    if (!this.state.authorized) return null;

    return (
      <div className="antialiased font-inter bg-gray-50 text-gray-800">
        <section className="py-16 px-4 bg-gray-100">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-800">Admin Projects</h2>
            <p className="text-lg text-gray-600 mb-6">Total Projects: {this.state.projects.length}</p>

            <div className="flex gap-4 mb-6 justify-center">
              <input
                className="px-4 py-2 rounded-md border"
                placeholder="Search projects..."
                value={this.state.search}
                onChange={(e) => this.setState({ search: e.target.value })}
              />

              <select
                className="px-4 py-2 rounded-md border"
                value={this.state.sort}
                onChange={(e) => this.setState({ sort: e.target.value })}
              >
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {this.renderProjects()}
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default AdminPanel;
