"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RSVPContent() {
  const searchParams = useSearchParams();
  const event_id = searchParams.get("event_id");
  const [user_id, setUserId] = useState("");
  const [status, setStatus] = useState("Yes");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, event_id, status }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Update submitted successfully!");
    } else {
      setMessage(data.error || "Error submitting Update");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-700 via-purple-800 to-indigo-900 flex items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-black mb-6 text-center">
          RSVP to Event
        </h1>
        <input
          type="text"
          placeholder="Your User ID"
          value={user_id}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Maybe">Maybe</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-bold shadow hover:scale-105 transition-transform"
        >
          {loading ? "Submitting..." : "Submit RSVP"}
        </button>
        {message && (
          <div className="mt-4 text-center text-black font-semibold">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default function RSVPPage() {
  return (
    <Suspense fallback={<div>Loading RSVP...</div>}>
      <RSVPContent />
    </Suspense>
  );
}
