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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          {/* #2 Left */}
          <div
            className="bg-white rounded-xl shadow p-4 text-center transform transition-transform duration-300 hover:scale-105 cursor-pointer w-64"
            onClick={() => handleUserClick(topThree[1]?.username)}
          >
            <img
              src={topThree[1]?.profilePic}
              alt={topThree[1]?.username}
              className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
            />
            <h2 className="text-lg font-semibold text-gray-800">{topThree[1]?.username}</h2>
            <p className="text-sm text-gray-500">{topThree[1]?.handle}</p>
            <p className="text-indigo-600 font-bold">{topThree[1]?.followersCount} Followers</p>
            <div className="text-sm text-gray-400 mt-1">#2</div>
          </div>

          {/* #1 Center */}
          <div
            className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-transform duration-300 hover:scale-105 cursor-pointer w-72"
            onClick={() => handleUserClick(topThree[0]?.username)}
          >
            <img
              src={topThree[0]?.profilePic}
              alt={topThree[0]?.username}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-500 object-cover"
            />
            <h2 className="text-xl font-bold text-gray-800">{topThree[0]?.username}</h2>
            <p className="text-sm text-gray-500">{topThree[0]?.handle}</p>
            <p className="text-indigo-600 font-bold text-lg">{topThree[0]?.followersCount} Followers</p>
            <div className="text-sm text-gray-400 mt-1">#1</div>
          </div>

          {/* #3 Right */}
          <div
            className="bg-white rounded-xl shadow p-4 text-center transform transition-transform duration-300 hover:scale-105 cursor-pointer w-64"
            onClick={() => handleUserClick(topThree[2]?.username)}
          >
            <img
              src={topThree[2]?.profilePic}
              alt={topThree[2]?.username}
              className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
            />
            <h2 className="text-lg font-semibold text-gray-800">{topThree[2]?.username}</h2>
            <p className="text-sm text-gray-500">{topThree[2]?.handle}</p>
            <p className="text-indigo-600 font-bold">{topThree[2]?.followersCount} Followers</p>
            <div className="text-sm text-gray-400 mt-1">#3</div>
          </div>
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
