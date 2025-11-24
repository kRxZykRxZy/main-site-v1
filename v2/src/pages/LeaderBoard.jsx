import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [topThree, setTopThree] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const followersCount = Array.isArray(data.followers) ? data.followers.length : 0;
          userList.push({
            username: data.username,
            handle: data.handle || `@${data.username}`,
            followersCount,
            profilePic: `https://sl-api-v1.onrender.com/users/${data.username}/image`,
          });
        });

        userList.sort((a, b) => b.followersCount - a.followersCount);
        setTopThree(userList.slice(0, 3));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleUserClick = (username) => {
    window.location.href = `/users/${username}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-10">SnapLabs Global Leaderboard</h1>

        {/* Top 3 Users */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {topThree.map((user, index) => (
            <div
              key={user.username}
              className="bg-white rounded-xl shadow p-6 text-center transform transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleUserClick(user.username)}
            >
              <img
                src={user.profilePic}
                alt={user.username}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-indigo-500 object-cover"
              />
              <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
              <p className="text-sm text-gray-500">{user.handle}</p>
              <p className="mt-2 text-indigo-600 font-bold">{user.followersCount} Followers</p>
              <div className="mt-2 text-sm text-gray-400">#{index + 1}</div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Full Leaderboard</h2>
          <div className="space-y-4">
            {users.slice(3, visibleCount).map((user, index) => (
              <div
                key={user.username}
                className="flex items-center justify-between bg-gray-100 rounded-md p-4 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleUserClick(user.username)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-600">#{index + 4}</span>
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.handle}</p>
                  </div>
                </div>
                <p className="text-indigo-600 font-semibold">{user.followersCount} Followers</p>
              </div>
            ))}
          </div>

          {visibleCount < users.length && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
