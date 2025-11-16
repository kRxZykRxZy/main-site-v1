import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export const BASE_URL = "https://sl-api-v1.onrender.com";

/**
 * Fetch JSON helper
 */
export async function fetchJSON(endpoint, options = {}, uid = null) {
  try {
    const headers = options.headers || {};
    if (uid) {
      headers["Authorization"] = `Bearer ${uid}`;
    }

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
}

/**
 * Get current Firebase UID helper
 */
export async function getCurrentUid() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      const id = await user?.getIdToken();
      resolve(id || null);
    });
  });
}

/**
 * API functions
 */
export const API = {
  getProjects: async () => {
    const uid = await getCurrentUid();
    return fetchJSON(`/api/projects`, {}, uid);
  },

  getProjectMeta: async (projectId, username = "guest") => {
    const uid = await getCurrentUid();
    return fetchJSON(`/api/projects/${projectId}/meta/${username}`, {}, uid);
  },

  updateProjectMeta: async (projectId, body) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/api/projects/${projectId}/meta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }, uid);
  },

  postView: async (projectId, username) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/api/${projectId}/views/${username}`, { method: "POST" }, uid);
  },

  postLove: async (projectId, username) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/api/projects/${projectId}/love/${username}`, { method: "POST" }, uid);
  },

  postFavourite: async (projectId, username) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/api/projects/${projectId}/favourite/${username}`, { method: "POST" }, uid);
  },

  postComment: async (projectId, text, username) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/${projectId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user: { username } }),
    }, uid);
  },

  postReply: async (projectId, commentId, text, username) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/${projectId}/comments/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user: { username } }),
    }, uid);
  },

  fetchComments: async (projectId) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/${projectId}/comments`, {}, uid);
  },

  uploadThumbnail: async (projectId, file) => {
    const uid = await getCurrentUid();
    const headers = { "Content-Type": file.type };
    if (uid) headers["Authorization"] = `Bearer ${uid}`;
    const res = await fetch(`${BASE_URL}/api/upload/${projectId}`, {
      method: "POST",
      headers,
      body: file,
    });
    return res.json();
  },

  shareProject: async (projectId) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/api/share/${projectId}`, { method: "PUT" }, uid);
  },

  unshareProject: async (projectId) => {
    const uid = await getCurrentUid();
    return fetchJSON(`/api/unshare/${projectId}`, { method: "PUT" }, uid);
  },
};
