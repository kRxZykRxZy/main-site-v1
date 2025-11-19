import { db, auth } from "../firebaseConfig";
import { 
  collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
 * Firestore-based API functions
 */
export const API = {

  // Fetch all projects
  getProjects: async () => {
    const snapshot = await getDocs(collection(db, "projects"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Fetch a single project by its Firestore ID
  getProjectById: async (projectId) => {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Project not found");
    return { id: docSnap.id, ...docSnap.data() };
  },

  // Create a new project
  createProject: async (username) => {
    const newDoc = await addDoc(collection(db, "projects"), {
      title: "Untitled Project",
      author: username,
      date: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    });
    return { id: newDoc.id };
  },

  // Update a project by Firestore document ID
  updateProject: async (projectId, data) => {
    const docRef = doc(db, "projects", projectId);
    await updateDoc(docRef, data);
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  },

  // Delete a project by Firestore document ID
  deleteProjectById: async (projectId) => {
    await updateDoc(doc(db, "projects", projectId), { deleted: true }); // optional soft delete
    return true;
  },

  // ----------------------------
  // Comments stored per project
  // ----------------------------

  // Add a comment to a project
  addComment: async (projectId, text, username) => {
    const commentsRef = collection(db, "projects", projectId, "comments");
    const newDoc = await addDoc(commentsRef, {
      text,
      user: { username },
      createdAt: serverTimestamp(),
    });
    return { id: newDoc.id };
  },

  // Fetch comments for a project
  fetchComments: async (projectId) => {
    const commentsRef = collection(db, "projects", projectId, "comments");
    const snapshot = await getDocs(commentsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Delete a comment by ID under a project
  deleteComment: async (projectId, commentId) => {
    const commentRef = doc(db, "projects", projectId, "comments", commentId);
    await updateDoc(commentRef, { deleted: true }); // optional soft delete
    return true;
  },

  // Update a comment (or add reply)
  updateComment: async (projectId, commentId, data) => {
    const commentRef = doc(db, "projects", projectId, "comments", commentId);
    await updateDoc(commentRef, data);
    const updatedDoc = await getDoc(commentRef);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  },

  // ----------------------------
  // Keep meta/view/love/favourite/share/unshare routes as-is
  // ----------------------------
  getProjectMeta: async (projectId, username = "guest") => {
    const uid = await getCurrentUid();
    return fetch(`${BASE_URL}/api/projects/${projectId}/meta/${username}`, { headers: uid ? { Authorization: `Bearer ${uid}` } : {} })
      .then(res => res.json());
  },

  updateProjectMeta: async (projectId, body) => {
    const uid = await getCurrentUid();
    return fetch(`${BASE_URL}/api/projects/${projectId}/meta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(uid && { Authorization: `Bearer ${uid}` }) },
      body: JSON.stringify(body),
    }).then(res => res.json());
  },

  postView: async (projectId, username) => {
    const uid = await getCurrentUid();
    return fetch(`${BASE_URL}/api/${projectId}/views/${username}`, { method: "POST", headers: uid ? { Authorization: `Bearer ${uid}` } : {} })
      .then(res => res.json());
  },

  postLove: async (projectId, username) => {
    const uid = await getCurrentUid();
    return fetch(`${BASE_URL}/api/projects/${projectId}/love/${username}`, { method: "POST", headers: uid ? { Authorization: `Bearer ${uid}` } : {} })
      .then(res => res.json());
  },

  postFavourite: async (projectId, username) => {
    const uid = await getCurrentUid();
    return fetch(`${BASE_URL}/api/projects/${projectId}/favourite/${username}`, { method: "POST", headers: uid ? { Authorization: `Bearer ${uid}` } : {} })
      .then(res => res.json());
  },

  shareProject: async (projectId) => {
    const uid = await getCurrentUid();
    return fetch(`${BASE_URL}/api/share/${projectId}`, { method: "PUT", headers: uid ? { Authorization: `Bearer ${uid}` } : {} })
      .then(res => res.json());
  },

  unshareProject: async (projectId) => {
    const uid = await getCurrentUid();
    return fetch(`${BASE_URL}/api/unshare/${projectId}`, { method: "PUT", headers: uid ? { Authorization: `Bearer ${uid}` } : {} })
      .then(res => res.json());
  },
};
