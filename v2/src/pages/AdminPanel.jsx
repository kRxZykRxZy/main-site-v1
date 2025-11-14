import React, { Component } from "react";
import { auth } from "../firebaseConfig.js";
import { onAuthStateChanged, updateEmail, updatePassword } from "firebase/auth";

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
      newEmail: "",
      newPassword: "",
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
        fetchedProjects.push({ id, ...data });
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

  getFilteredAndSortedProjects() {
    const { projects, search, sort } = this.state;

    let filtered = projects.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") filtered.sort((a, b) => b.name.localeCompare(a.name));

    return filtered;
  }

  async handleEmailUpdate() {
    try {
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, this.state.newEmail);
        alert("Email updated successfully");
      }
    } catch (err) {
      alert("Error updating email: " + err.message);
    }
  }

  async handlePasswordUpdate() {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, this.state.newPassword);
        alert("Password updated successfully");
      }
    } catch (err) {
      alert("Error updating password: " + err.message);
    }
  }

  render() {
    if (!this.state.authorized) return null;

    const { loading, error, search, sort, projects } = this.state;
    const filteredProjects = this.getFilteredAndSortedProjects();

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-4xl font-bold mb-6 text-center">Admin Panel</h1>

        <p className="mb-4 text-center font-semibold">Total Projects: {projects.length}</p>

        <div className="flex gap-4 mb-6 justify-center">
          <input
            className="px-4 py-2 rounded-md border"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => this.setState({ search: e.target.value })}
          />

          <select
            className="px-4 py-2 rounded-md border"
            value={sort}
            onChange={(e) => this.setState({ sort: e.target.value })}
          >
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>

        {loading && <p className="text-center">Loading projects...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg cursor-pointer"
              onClick={() => (window.location.href = `/projects/${project.id}`)}
            >
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              <p className="text-gray-600">Project ID: {project.id}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Update Your Account</h2>
          <input
            className="w-full mb-2 px-4 py-2 border rounded"
            placeholder="New Email"
            value={this.state.newEmail}
            onChange={(e) => this.setState({ newEmail: e.target.value })}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
            onClick={() => this.handleEmailUpdate()}
          >
            Update Email
          </button>

          <input
            className="w-full mb-2 px-4 py-2 border rounded"
            placeholder="New Password"
            type="password"
            value={this.state.newPassword}
            onChange={(e) => this.setState({ newPassword: e.target.value })}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => this.handlePasswordUpdate()}
          >
            Update Password
          </button>
        </div>
      </div>
    );
  }
}

export default AdminPanel;
