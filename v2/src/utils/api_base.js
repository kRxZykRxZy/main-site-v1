import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export const BASE_URL = "https://sl-api-v1.onrender.com";

const API = {
  /**
   * Fetch JSON helper
   */
  fetch: async function (endpoint, options = {}, uid = null) {
    try {
      const headers = options.headers || {};
      if (uid) headers["Authorization"] = `Bearer ${uid}`;

      const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.error("API fetch error:", err);
      throw err;
    }
  },

  /**
   * Get current Firebase UID
   */
  getCurrentUid: async function () {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        const token = await user?.getIdToken();
        resolve(token || null);
      });
    });
  },

  getProjects: async function () {
    const uid = await this.getCurrentUid();
    return this.fetch(`/api/projects`, {}, uid);
  },

  getProjectMeta: async function (projectId, username = "guest") {
    const uid = await this.getCurrentUid();
    return this.fetch(`/api/projects/${projectId}/meta/${username}`, {}, uid);
  },

  updateProjectMeta: async function (projectId, body) {
    const uid = await this.getCurrentUid();
    return this.fetch(
      `/api/projects/${projectId}/meta`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      uid
    );
  },

  postView: async function (projectId, username) {
    const uid = await this.getCurrentUid();
    return this.fetch(`/api/${projectId}/views/${username}`, { method: "POST" }, uid);
  },

  postLove: async function (projectId, username) {
    const uid = await this.getCurrentUid();
    return this.fetch(`/api/projects/${projectId}/love/${username}`, { method: "POST" }, uid);
  },

  postFavourite: async function (projectId, username) {
    const uid = await this.getCurrentUid();
    return this.fetch(`/api/projects/${projectId}/favourite/${username}`, { method: "POST" }, uid);
  },

  postComment: async function (projectId, text, username) {
    const uid = await this.getCurrentUid();
    return this.fetch(
      `/${projectId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, user: { username } }),
      },
      uid
    );
  },

  deleteComment: async function (projectId, commentId) {
    const uid = await this.getCurrentUid();
    return this.fetch(
      `/${projectId}/comments/${commentId}`,
      { method: "DELETE" },
      uid
    );
  },

  postReply: async function (projectId, commentId, text, username) {
    const uid = await this.getCurrentUid();
    return this.fetch(
      `/${projectId}/comments/${commentId}/reply`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, user: { username } }),
      },
      uid
    );
  },

  fetchComments: async function (projectId) {
    const uid = await this.getCurrentUid();
    return this.fetch(`/${projectId}/comments`, {}, uid);
  },

  uploadThumbnail: async function (projectId, file) {
    const uid = await this.getCurrentUid();
    const headers = { "Content-Type": file.type };
    if (uid) headers["Authorization"] = `Bearer ${uid}`;

    const res = await fetch(`${BASE_URL}/api/upload/${projectId}`, {
      method: "POST",
      headers,
      body: file,
    });

    return res.json();
  },

  shareProject: async function (projectId) {
    const uid = await this.getCurrentUid();
    return this.fetch(`/api/share/${projectId}`, { method: "PUT" }, uid);
  },

  unshareProject: async function (projectId) {
    const uid = await this.getCurrentUid();
    return this.fetch(`/api/unshare/${projectId}`, { method: "PUT" }, uid);
  },
};

// Attach globally
window.API = API;

// And export for module usage
export default API;
export { API };
