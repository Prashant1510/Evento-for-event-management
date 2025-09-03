
"use client";
import React, { useEffect, useState } from 'react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 p-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Upcoming Events</h1>
      {loading ? (
        <div className="text-white text-center">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-2">{event.title}</h2>
              <p className="text-white/80 mb-2">{event.description}</p>
              <p className="text-white/60 mb-2">City: {event.city}</p>
              <p className="text-white/60 mb-2">Date: {new Date(event.date).toLocaleDateString()}</p>
              <a href={`/rsvp?event_id=${event.id}`} className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold shadow hover:scale-105 transition-transform">RSVP</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
