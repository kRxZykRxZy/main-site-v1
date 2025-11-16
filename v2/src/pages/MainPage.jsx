import React, { Component } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig.js";

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      uid: null,
      featuredProjects: [],
      loadingProjects: true,
      projectsError: null,
    };
  }

  componentDidMount() {
    // Listen for auth changes
    this.unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        this.setState({ uid, username: `user-${uid}` }); // temporary, backend may resolve real displayName
        await this.fetchFeaturedProjects(uid);
      } else {
        this.setState({ uid: null, username: null, featuredProjects: [], loadingProjects: false });
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async fetchFeaturedProjects(uid) {
    const PROJECTS_API_URL =
      "https://corsproxy.io/?url=https://sl-api-v1.onrender.com/api/projects";

    this.setState({ loadingProjects: true, projectsError: null });

    try {
      const response = await fetch(PROJECTS_API_URL, {
        headers: {
          Authorization: `Bearer ${uid}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      // If backend returns a resolved username, update it
      if (data.username) this.setState({ username: data.username });

      const projects = data.projects?.slice(0, 6) || [];
      this.setState({ featuredProjects: projects, loadingProjects: false });
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      this.setState({ projectsError: error.message, loadingProjects: false });
    }
  }

  renderFeaturedProjects() {
    const { featuredProjects, loadingProjects, projectsError } = this.state;

    if (loadingProjects) return <p className="text-center text-gray-600 col-span-full">Loading featured projects...</p>;
    if (projectsError) return <p className="text-center text-red-500 col-span-full">Failed to load projects: {projectsError}</p>;
    if (featuredProjects.length === 0) return <p className="text-center text-gray-600 col-span-full">No featured projects available.</p>;

    return featuredProjects.map((project, index) => {
      const id = project.id;
      const author = project.author;
      const pLink = "/projects/" + id;

      return (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
          <img
            src={`https://sl-api-v1.onrender.com${project.image || "/static/No%20Cover%20Available.svg"}`}
            alt={`${project.name} thumbnail`}
            className="w-full h-40 object-cover rounded-md mb-4"
            onError={(e) => { e.target.onerror = null; e.target.src = "/static/No%20Cover%20Available.svg"; }}
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{this.escapeHTML(project.name)}</h3>
          <p className="text-gray-600 text-sm mb-4">Author: {author}</p>
          <a href={pLink} className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center">
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
    const { username } = this.state;
    window.username = username;

    return (
      <div className="antialiased font-inter bg-gray-50 text-gray-800">
        <section id="homepage-intro" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 px-4 text-center rounded-b-lg shadow-lg">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              The New And Enhanced Project Sharing Platform
            </h1>
            <p className="text-lg sm:text-xl mb-8 opacity-90">
              Dive into a world of creativity with innovative projects built using SnapLabs.
            </p>
            <a href="/projects/0/editor/" className="bg-white text-indigo-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 inline-block">
              Start Your Own Project
            </a>
          </div>
        </section>

        <section id="featured-projects" className="py-16 px-4 bg-gray-100">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800">Featured Projects</h2>
            <p className="text-lg text-gray-600 mb-8">Discover top projects hand-picked by the SnapLabs community admins.</p>
            <div id="projects-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {this.renderFeaturedProjects()}
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default MainPage;
