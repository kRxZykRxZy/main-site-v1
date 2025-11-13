export const BASE_URL = "https://sl-api-v1.onrender.com";

/**
 * Fetch JSON helper
 */
export async function fetchJSON(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
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
 * API functions
 */
export const API = {
  getProjects: () =>
    fetchJSON(`/api/projects`),
  
  getProjectMeta: (projectId, username = "guest") =>
    fetchJSON(`/api/projects/${projectId}/meta/${username}`),

  updateProjectMeta: (projectId, body) =>
    fetchJSON(`/api/projects/${projectId}/meta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  postView: (projectId, username) =>
    fetchJSON(`/api/${projectId}/views/${username}`, { method: "POST" }),

  postLove: (projectId, username) =>
    fetchJSON(`/api/projects/${projectId}/love/${username}`, { method: "POST" }),

  postFavourite: (projectId, username) =>
    fetchJSON(`/api/projects/${projectId}/favourite/${username}`, { method: "POST" }),

  postComment: (projectId, text, username) =>
    fetchJSON(`/${projectId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user: { username } }),
    }),

  postReply: (projectId, commentId, text, username) =>
    fetchJSON(`/${projectId}/comments/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user: { username } }),
    }),

  fetchComments: (projectId) => fetchJSON(`/${projectId}/comments`),

  uploadThumbnail: (projectId, file) =>
    fetch(`${BASE_URL}/api/upload/${projectId}`, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    }).then((res) => res.json()),

  shareProject: (projectId) =>
    fetchJSON(`/api/share/${projectId}`, { method: "PUT" }),

  unshareProject: (projectId) =>
    fetchJSON(`/api/unshare/${projectId}`, { method: "PUT" }),
};
