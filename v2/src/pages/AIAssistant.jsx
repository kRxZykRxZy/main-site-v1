import React, { useState } from "react";

const AiAssistant = () => {
  const [projectIdeaInput, setProjectIdeaInput] = useState("");
  const [projectIdeaOutput, setProjectIdeaOutput] = useState(
    "Hello! I am an AI Assistant that can help you with SnapLabs. Type something here and the AI response will appear."
  );
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    const prompt = projectIdeaInput.trim();
    if (!prompt) {
      setProjectIdeaOutput(
        "Hello There! What do you need help with? Your response seems blank."
      );
      return;
    }

    setProjectIdeaOutput(
      "We are contacting the AI Assistant, and the AI Assistant will respond shortly..."
    );
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error("OpenAI API key not found. Make sure VITE_OPENAI_API_KEY is set.");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an AI Assistant designed to help people with coding in the SnapLabs Scratch Mod.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
<<<<<<< HEAD
        },
      ];

      const payload = { contents: chatHistory };
      const apiKey = "AIzaSyB-gswkWt6KvFr4HWRe9VmuCendWlbmeTY"; // injected at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
=======
          temperature: 0.7,
        }),
>>>>>>> ba606e09425aa3c667f3f01aa85b14f805808290
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      setProjectIdeaOutput(text || "Failed to get a response from the AI Assistant.");
    } catch (error) {
      console.error("OpenAI API error:", error);
      setProjectIdeaOutput(
        "Failed to contact the AI Assistant. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Header */}
      <header className="py-6">
        <h1 className="text-5xl font-extrabold text-indigo-600 text-center">
          SnapLabs AI Coding Assistant
        </h1>
        <p className="text-gray-700 mt-2 text-center">
          Need help? Ask the AI Bot to debug code and more!
        </p>
      </header>

      {/* AI Assistant Section */}
      <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mt-6">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">
          ✨ Coding Assistant (powered by AI) ✨
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Ask the AI Assistant for help with SnapLabs coding, debugging, or ideas.
        </p>
        <textarea
          value={projectIdeaInput}
          onChange={(e) => setProjectIdeaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="e.g., 'How do I code this: [enter coding problem]'"
          className="w-full p-4 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-4 h-32 resize-y"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className={`w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Send Message
          {loading && (
            <span className="ml-2 inline-block w-6 h-6 border-4 border-white border-t-blue-500 rounded-full animate-spin"></span>
          )}
        </button>
        <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md text-left whitespace-pre-wrap">
          {projectIdeaOutput}
        </div>
      </section>
    </div>
  );
};

export default AiAssistant;
