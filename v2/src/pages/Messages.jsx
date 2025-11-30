import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const MessagesPage = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resetTimeout;

    const init = async () => {
      onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) return;
        setUser(currentUser);

        try {
          const token = await currentUser.getIdToken();

          // Fetch messages
          const res = await fetch("https://sl-api-v1.onrender.com/users/me/messages", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setMessages(data.messages.reverse() || []);

          // Fetch message count
          const countRes = await fetch("https://sl-api-v1.onrender.com/users/me/messages/count", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const countData = await countRes.json();
          setMessageCount(countData.count || 0);

          // Reset unread count after 1 second
          resetTimeout = setTimeout(async () => {
            try {
              await fetch("https://sl-api-v1.onrender.com/users/me/messages/reset", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
              // Update local messages as read
              setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
              setMessageCount(0);
            } catch (err) {
              console.error("Failed to reset message count", err);
            }
          }, 1000);
        } catch (err) {
          console.error("Failed to fetch messages", err);
        } finally {
          setLoading(false);
        }
      });
    };

    init();
    return () => {
      if (resetTimeout) clearTimeout(resetTimeout);
    };
  }, []);

  const handleMarkAsRead = async (msgIndex) => {
    if (!user) return;
    const currentMessage = messages[msgIndex];

    try {
      const token = await user.getIdToken();
      await fetch("https://sl-api-v1.onrender.com/users/me/messages/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ index: msgIndex }),
      });

      // Update local state
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[msgIndex].read = true;
        return newMsgs;
      });

      setMessageCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark message as read", err);
    }
  };

  if (!user) {
    return <p className="text-center mt-10 text-gray-600">You must be signed in to view messages.</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">Messages</h1>

        <div className="text-center mb-8">
          <div className="inline-block bg-red-600 text-white text-3xl font-bold px-6 py-4 rounded-xl shadow-lg">
            {messageCount} {messageCount === 1 ? "Message" : "Messages"}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow p-4 flex flex-col ${
                  msg.read ? "opacity-70" : ""
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800"><a href={`/users/${msg.sender}`}>{msg.sender}</a></span>
                  <span className="text-sm text-gray-400">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p 
                  className="text-gray-700 mb-2"
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                ></p>
                {!msg.read && (
                  <button
                    onClick={() => handleMarkAsRead(index)}
                    className="self-end bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
