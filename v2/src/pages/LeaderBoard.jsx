import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs
} from "firebase/firestore";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10); // initial load
  const [topThree, setTopThree] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const followersCount = data.followers ? data.followers.length : 0;
          userList.push({
            username: data.username,
            followersCount,
            profilePic: `https://sl-api-v1.onrender.com/users/${data.username}/image`
          });
        });

        // Sort by followers count (descending)
        userList.sort((a, b) => b.followersCount - a.followersCount);

        // Top 3
        setTopThree(userList.slice(0, 3));

        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <div className="leaderboard">
      <h1>🏆 SnapLabs Leaderboard</h1>

      <h2>Top 3 Users</h2>
      <div className="top-three">
        {topThree.map((user, index) => (
          <div key={user.username} className="top-user">
            <img
              src={user.profilePic}
              alt={`${user.username}'s profile`}
              width={60}
              height={60}
            />
            <p>
              {index + 1}. {user.username} — {user.followersCount} followers
            </p>
          </div>
        ))}
      </div>

      <h2>All Users</h2>
      <div className="all-users">
        {users.slice(0, visibleCount).map((user) => (
          <div key={user.username} className="user-card">
            <img
              src={user.profilePic}
              alt={`${user.username}'s profile`}
              width={40}
              height={40}
            />
            <p>
              {user.username} — {user.followersCount} followers
            </p>
          </div>
        ))}
      </div>

      {visibleCount < users.length && (
        <button onClick={handleLoadMore}>Load More</button>
      )}
    </div>
  );
};

export default Leaderboard;
