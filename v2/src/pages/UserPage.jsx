import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Spinner from "../components/spinner/workspace";

const API_BASE = "https://sl-api-v1.onrender.com";

const UserProfilePage = () => {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [profileDocId, setProfileDocId] = useState(null); // Firestore doc ID
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [editDescription, setEditDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  // Fetch profile user by username
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setProfileUser(null);
          setProfileDocId(null);
        } else {
          const docSnap = querySnapshot.docs[0];
          setProfileUser(docSnap.data());
          setProfileDocId(docSnap.id);
          setNewDescription(docSnap.data().description || "");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  const isOwner = currentUser && profileUser && currentUser.uid === profileUser.uid;
  const isFollowing =
    currentUser && profileUser && profileUser.followers?.includes(currentUser.username || currentUser.displayName);

  // Follow/unfollow toggle
  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser || !profileDocId) return;

    // Get current user's Firestore doc
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", currentUser.uid));
    const querySnap = await getDocs(q);
    if (querySnap.empty) return;
    const currentDoc = querySnap.docs[0];
    const currentDocId = currentDoc.id;

    try {
      const profileRef = doc(db, "users", profileDocId);
      const currentRef = doc(db, "users", currentDocId);

      if (isFollowing) {
        await updateDoc(profileRef, { followers: arrayRemove(currentUser.username || currentUser.displayName) });
        await updateDoc(currentRef, { followings: arrayRemove(profileUser.username) });
        setProfileUser((prev) => ({
          ...prev,
          followers: prev.followers.filter((f) => f !== (currentUser.username || currentUser.displayName))
        }));
      } else {
        await updateDoc(profileRef, { followers: arrayUnion(currentUser.username || currentUser.displayName) });
        await updateDoc(currentRef, { followings: arrayUnion(profileUser.username) });
        setProfileUser((prev) => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser.username || currentUser.displayName]
        }));
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  // Update description
  const handleSaveDescription = async () => {
    if (!profileDocId) return;
    try {
      const userRef = doc(db, "users", profileDocId);
      await updateDoc(userRef, { description: newDescription });
      setProfileUser((prev) => ({ ...prev, description: newDescription }));
      setEditDescription(false);
    } catch (err) {
      console.error("Failed to update description:", err);
    }
  };

  // Profile picture upload
  const handleProfileImageChange = async (event) => {
    if (!profileUser || !event.target.files[0]) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);

    try {
      const res = await fetch(`${API_BASE}/users/${profileUser.username}/image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload profile picture");
      alert("Profile picture updated successfully!");
      setProfileUser((prev) => ({ ...prev })); // refresh
    } catch (err) {
      console.error(err);
      alert("Error uploading profile picture: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch multiple users by username
  const fetchUsersData = async (usernames, setter) => {
    try {
      const usersData = await Promise.all(
        usernames.map(async (uname) => {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("username", "==", uname));
          const snap = await getDocs(q);
          if (!snap.empty) return snap.docs[0].data();
          return { username: uname };
        })
      );
      setter(usersData);
    } catch (err) {
      console.error(err);
    }
  };

  const openFollowersModal = () => {
    fetchUsersData(profileUser.followers || [], setFollowersData);
    setShowFollowersModal(true);
  };

  const openFollowingModal = () => {
    fetchUsersData(profileUser.followings || [], setFollowingData);
    setShowFollowingModal(true);
  };

  if (loading) return <Spinner text="Loading profile..." />;
  if (!profileUser) return <p className="text-center mt-10 text-red-600">User not found</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        {/* Profile Picture */}
        <div className="flex items-center mb-4 space-x-4">
          <div className="relative">
            <img
              src={`https://sl-api-v1.onrender.com/users/${profileUser.username}/image?ts=${Date.now()}`}
              alt={profileUser.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-600"
            />
            {isOwner && (
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 cursor-pointer hover:bg-indigo-700">
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                {uploadingImage ? "..." : "✎"}
              </label>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profileUser.username}</h2>
            {!isOwner && currentUser && (
              <button
                onClick={handleFollowToggle}
                className={`mt-1 py-1 px-4 rounded text-white ${
                  isFollowing ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-1">About</h3>
          {isOwner && editDescription ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="flex-1 border rounded px-2 py-1"
              />
              <button
                onClick={handleSaveDescription}
                className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditDescription(false)}
                className="bg-gray-300 px-3 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="bg-gray-100 p-2 rounded">{profileUser.description || "No description yet."}</p>
          )}
          {isOwner && !editDescription && (
            <button
              onClick={() => setEditDescription(true)}
              className="mt-1 text-indigo-600 hover:underline text-sm"
            >
              Edit
            </button>
          )}
        </div>

        {/* Followers / Following */}
        <div className="mt-4 flex space-x-6">
          <div className="cursor-pointer" onClick={openFollowersModal}>
            <span className="font-semibold">{profileUser.followers?.length || 0}</span> Followers
          </div>
          <div className="cursor-pointer" onClick={openFollowingModal}>
            <span className="font-semibold">{profileUser.followings?.length || 0}</span> Following
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-4">
          <h3 className="font-semibold text-lg mb-2">Achievements</h3>
          <ul>
            {profileUser.achievements?.map((ach, idx) => (
              <li key={idx} className="bg-gray-100 p-2 rounded mb-1">{ach}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={() => setShowFollowersModal(false)}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">Followers ({profileUser.followers?.length || 0})</h3>
            <ul>
              {followersData.map((f, idx) => (
                <li key={idx} className="flex items-center mb-3 space-x-3">
                  <img
                    src={`https://sl-api-v1.onrender.com/users/${f.username}/image`}
                    alt={f.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{f.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={() => setShowFollowingModal(false)}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">Following ({profileUser.followings?.length || 0})</h3>
            <ul>
              {followingData.map((f, idx) => (
                <li key={idx} className="flex items-center mb-3 space-x-3">
                  <img
                    src={`https://sl-api-v1.onrender.com/users/${f.username}/image`}
                    alt={f.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{f.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
