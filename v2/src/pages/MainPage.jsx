import React, { Component } from "react";
import MenuBar from "../components/menu-bar/menu-bar";

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username || null,
      featuredProjects: [],
      loadingProjects: true,
      projectsError: null,
    };
  }

  componentDidMount() {
    this.fetchFeaturedProjects();
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async fetchFeaturedProjects() {
    const PROJECTS_API_URL =
      "https://corsproxy.io/?url=https://sl-api-v1.onrender.com/api/projects";

    try {
      const response = await fetch(PROJECTS_API_URL);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const projects = data.projects.slice(0, 6);
      this.setState({ featuredProjects: projects, loadingProjects: false });
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      this.setState({ projectsError: error.message, loadingProjects: false });
    }
  }

  renderFeaturedProjects() {
    const { featuredProjects, loadingProjects, projectsError } = this.state;

    if (loadingProjects) {
      return (
        <p className="text-center text-gray-600 col-span-full">
          Loading featured projects...
          <span className="loading-spinner"></span>
        </p>
      );
    }

    if (projectsError) {
      return (
        <p className="text-center text-red-500 col-span-full">
          Failed to load projects. Please try again later. (Error: {projectsError})
        </p>
      );
    }

    if (featuredProjects.length === 0) {
      return (
        <p className="text-center text-gray-600 col-span-full">
          No featured projects available at the moment.
        </p>
      );
    }

    return featuredProjects.map((project, index) => {
      const id = project.id;
      const author = project.author;
      const pLink = '/projects/' + id;

      return (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
        >
          <img
            src={`https://sl-api-v1.onrender.com${project.image || "/static/No%20Cover%20Available.png"}`}
            alt={`${project.name} thumbnail`}
            className="w-full h-40 object-cover rounded-md mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/No%20Cover%20Available.png";
            }}
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {this.escapeHTML(project.name)}
          </h3>
          <p className="text-gray-600 text-sm mb-4">Author: {author}</p>
          <a
            href={pLink}
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
              />
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

        {/* Homepage Intro */}
        <section
          id="homepage-intro"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 px-4 text-center rounded-b-lg shadow-lg"
        >
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              The New And Enhanced Project Sharing Platform
            </h1>
            <p className="text-lg sm:text-xl mb-8 opacity-90">
              Dive into a world of creativity with innovative projects built using SnapLabs. SnapLabs is a mod of Scratch and TurboWarp — but better.
            </p>
            <a
              href="/projects/0/editor/"
              className="bg-white text-indigo-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Start Your Own Project
            </a>
          </div>
        </section>

        {/* Featured Projects */}
        <section id="featured-projects" className="py-16 px-4 bg-gray-100">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Discover top projects hand-picked by the SnapLabs community admins.
            </p>
            <div
              id="projects-container"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {this.renderFeaturedProjects()}
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default MainPage;
