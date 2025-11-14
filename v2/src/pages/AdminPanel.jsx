import React, { Component } from "react";
import { auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      users: [],
      loadingProjects: false,
      loadingUsers: false,
      errorProjects: null,
      errorUsers: null,
      search: "",
      sort: "az",
      authorized: false,
      showUsers: true,
      showProjects: true,
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
      this.fetchAllUsers();
    });
  }

  escapeHTML(str) {
    return str
      ?.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;") || "";
  }

  async fetchAllProjects() {
    this.setState({ loadingProjects: true, errorProjects: null });
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
          author: data.author?.username,
          image: data.image || "/static/No%20Cover%20Available.svg",
          stats: data.stats,
          description: data.description,
        });

        consecutiveErrors = 0;
        id++;
      } catch (err) {
        console.error(err);
        this.setState({ errorProjects: err.message, loadingProjects: false });
        return;
      }
    }

    this.setState({ projects: fetchedProjects, loadingProjects: false });
  }

  async fetchAllUsers() {
    this.setState({ loadingUsers: true, errorUsers: null });
    try {
      const response = await fetch("https://sl-api-v1.onrender.com/users/");
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      this.setState({ users: data, loadingUsers: false });
    } catch (err) {
      console.error(err);
      this.setState({ errorUsers: err.message, loadingUsers: false });
    }
  }

  async deleteUser(uid) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`https://sl-api-v1.onrender.com/users/${uid}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.setState((prev) => ({ users: prev.users.filter((u) => u.uid !== uid) }));
      alert("User deleted successfully");
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  }

  async resetPassword(uid) {
    const newPassword = prompt("Enter new password for the user:");
    if (!newPassword) return;
    try {
      const response = await fetch(`https://sl-api-v1.onrender.com/users/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      alert("Password reset successfully");
    } catch (err) {
      alert("Error resetting password: " + err.message);
    }
  }

  async updateEmail(uid) {
    const newEmail = prompt("Enter new email for the user:");
    if (!newEmail) return;
    try {
      const response = await fetch(`https://sl-api-v1.onrender.com/users/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.setState((prev) => ({
        users: prev.users.map((u) => (u.uid === uid ? { ...u, email: newEmail } : u)),
      }));
      alert("Email updated successfully");
    } catch (err) {
      alert("Error updating email: " + err.message);
    }
  }

  async deleteProject(id, author) {
    if (!window.confirm(`Delete project "${id}" by ${author}?`)) return;
    try {
      const url = `https://sl-api-v1.onrender.com/api/delete/${id}/${author}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.setState((prev) => ({ projects: prev.projects.filter((p) => p.id !== id) }));
      alert("Project deleted successfully");
    } catch (err) {
      alert("Error deleting project: " + err.message);
    }
  }

  async deleteAllProjects() {
    if (!window.confirm("Are you sure you want to delete ALL projects?")) return;
    for (let project of [...this.state.projects]) {
      await this.deleteProject(project.id, project.author);
    }
    alert("All projects deleted!");
  }

  getFilteredAndSortedProjects() {
    const { projects, search, sort } = this.state;
    let filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") filtered.sort((a, b) => b.name.localeCompare(a.name));
    return filtered;
  }

  getFilteredAndSortedUsers() {
    const { users, search, sort } = this.state;
    let filtered = users.filter((u) => u.displayName.toLowerCase().includes(search.toLowerCase()));
    if (sort === "az") filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));
    if (sort === "za") filtered.sort((a, b) => b.displayName.localeCompare(a.displayName));
    return filtered;
  }

  renderProjects() {
    const projects = this.getFilteredAndSortedProjects();
    if (this.state.loadingProjects) return <p>Loading projects...</p>;
    if (this.state.errorProjects) return <p className="text-red-500">{this.state.errorProjects}</p>;
    if (projects.length === 0) return <p>No projects available.</p>;

    return projects.map((project, index) => (
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
        <p className="text-gray-600 text-sm mb-4">
          Views: {project.stats.views} | Loves: {project.stats.loves} | Favorites: {project.stats.favorites} | Remixes: {project.stats.remixes}
        </p>
        <p className="text-gray-500 text-sm mb-4">{this.escapeHTML(project.description)}</p>
        <div className="flex gap-2 mt-2">
          <a href={`/projects/${project.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center">
            View Project
          </a>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => this.deleteProject(project.id, project.author)}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  }

  renderUsers() {
    const users = this.getFilteredAndSortedUsers();
    if (this.state.loadingUsers) return <p>Loading users...</p>;
    if (this.state.errorUsers) return <p className="text-red-500">{this.state.errorUsers}</p>;
    if (users.length === 0) return <p>No users available.</p>;

    return users.map((user, index) => (
      <div
        key={index}
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{this.escapeHTML(user.displayName)}</h3>
        <p className="text-gray-600 text-sm mb-2">UID: {user.uid}</p>
        <p className="text-gray-600 text-sm mb-2">Email: {user.email || "N/A"}</p>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => this.deleteUser(user.uid)}
          >
            Delete User
          </button>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            onClick={() => this.resetPassword(user.uid)}
          >
            Reset Password
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => this.updateEmail(user.uid)}
          >
            Update Email
          </button>
        </div>
      </div>
    ));
  }

  render() {
    if (!this.state.authorized) return null;

    return (
      <div className="antialiased font-inter bg-gray-50 text-gray-800">
        <section className="py-16 px-4 bg-gray-100">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Admin Projects</h2>
              <div className="flex gap-2">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => this.deleteAllProjects()}
                >
                  Delete All Projects
                </button>
                <button
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  onClick={() => this.setState((prev) => ({ showProjects: !prev.showProjects }))}
                >
                  {this.state.showProjects ? "Hide Projects" : "Show Projects"}
                </button>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-6">Total Projects: {this.state.projects.length}</p>

            {this.state.showProjects && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">{this.renderProjects()}</div>}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Users</h2>
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => this.setState((prev) => ({ showUsers: !prev.showUsers }))}
              >
                {this.state.showUsers ? "Hide Users" : "Show Users"}
              </button>
            </div>
            <p className="text-lg text-gray-600 mb-6">Total Users: {this.state.users.length}</p>

            {this.state.showUsers && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{this.renderUsers()}</div>}
          </div>
        </section>
      </div>
    );
  }
}

export default AdminPanel;
