"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/navigation";

const sidePanelOptions = [
  { key: "create", label: "Create Event" },
  { key: "list", label: "Event List" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activePanel, setActivePanel] = useState("list");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) {
        router.push("/");
      } else {
        setUser(data.user);
        // Sync user to custom users table
        const { user } = data;
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();
        if (!existingUser) {
          await supabase.from("users").insert({
            id: user.id,
            name: user.user_metadata?.name || "",
            email: user.email,
            created_at: new Date().toISOString()
          });
        }
      }
    });
  }, [router]);

  return (
  <div className="min-h-screen flex flex-col md:flex-row bg-[#f7f8fa] relative overflow-hidden">
    {/* Background SVG */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{zIndex:0}} viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="1440" height="900" fill="#f7f8fa" />
      <circle cx="400" cy="200" r="80" fill="#e0e7ff" fillOpacity="0.4" />
      <circle cx="1200" cy="700" r="100" fill="#fbc2eb" fillOpacity="0.3" />
      <rect x="900" y="100" width="180" height="180" rx="40" fill="#c2e9fb" fillOpacity="0.18" />
      <rect x="200" y="700" width="120" height="120" rx="30" fill="#a1c4fd" fillOpacity="0.15" />
    </svg>
  {/* Side Panel */}
  <aside className="w-full lg:w-72 md:w-52 bg-white/60 shadow-xl border-r border-gray-200 flex flex-row md:flex-col py-4 md:py-8 px-2 md:px-6 items-center md:items-stretch relative z-10 rounded-2xl backdrop-blur-lg sm:flex-row  flex-nowrap sm:justify-between">
        <h2 className="text-2xl font-bold text-black  md:mb-8  text-center w-full sm:w-auto ">Evento</h2>
        <hr className="text-black pt-1 pb-3.5 sm:hidden" />
        <div className="flex flex-row md:flex-col gap-2 md:gap-0 w-full sm:w-auto">
          {sidePanelOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setActivePanel(opt.key)}
              className={`flex-1 md:w-full mb-0 md:mb-4 px-2 md:px-4 py-2 rounded-lg font-semibold text-lg transition-colors shadow flex items-center justify-center ${activePanel === opt.key ? "bg-gradient-to-r from-pink-500 to-purple-600 text-black" : "bg-white/20 text-black/80 hover:bg-white/30"}`}
            >
              {/* Icon only on sm screens */}
              <span className="block md:hidden">
                {opt.key === "create" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </span>
              {/* Text label hidden on sm screens */}
              <span className="hidden md:block">{opt.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
          className="w-full mt-0 md:mt-auto px-2 md:px-4 py-2 bg-white/20 text-black rounded-lg font-semibold hover:bg-pink-500 transition-colors  shadow sm:w-auto "
        >
          Logout
        </button>
      </aside>
  {/* Main Content */}
  <main className="flex-1 p-2 md:p-8 relative z-10">
        {activePanel === "create" ? <CreateEvent user={user} /> : <EventList user={user} />}
      </main>
    </div>
  );
}

function CreateEvent({ user }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.from("events").insert([
      { title, description, date, city, created_by: user.id }
    ]);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Event created successfully!");
      setTitle(""); setDescription(""); setDate(""); setCity("");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form onSubmit={handleSubmit} className="max-w-lg w-full bg-white rounded-xl shadow-xl p-4 md:p-8 border border-gray-200">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center">Create Event</h2>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full mb-2 md:mb-4 px-2 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full mb-2 md:mb-4 px-2 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} min={today} required className="w-full mb-2 md:mb-4 px-2 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="w-full mb-2 md:mb-4 px-2 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={loading} className="w-full px-2 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform">
          {loading ? "Creating..." : "Create Event"}
        </button>
        {message && <div className="mt-4 text-center text-blue-700 font-semibold">{message}</div>}
      </form>
    </div>
  );
}

function EventList({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [message, setMessage] = useState("");

  // ...existing code...

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("events").select("*").gte("date", today).order("date", { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  const handleRSVP = async (eventId) => {
    setMessage("");
    const status = rsvpStatus[eventId] || "Yes";
    const { error } = await supabase.from("rsvps").insert([
      { user_id: user.id, event_id: eventId, status }
    ]);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Response saved!");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (!error) {
      setEvents(events.filter(e => e.id !== eventId));
      setMessage("Event deleted successfully.");
    } else {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-black mb-6 text-center">Upcoming Events</h2>
      {loading ? (
        <div className="text-white text-center">Loading events...</div>
      ) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-xl p-4 md:p-6 border border-gray-200 flex flex-col justify-between">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">{event.title}</h3>
              <p className="text-gray-700 mb-1 md:mb-2">{event.description}</p>
              <p className="text-gray-500 mb-1 md:mb-2">City: {event.city}</p>
              <p className="text-gray-500 mb-1 md:mb-2">Date: {new Date(event.date).toLocaleDateString()}</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 mt-2 md:mt-4">
                <label className="text-black/80 mr-2 font-semibold">Availability:</label>
                <select
                  value={rsvpStatus[event.id] || "Select"}
                  onChange={e => setRsvpStatus({ ...rsvpStatus, [event.id]: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Select" disabled className="text-gray-400 bg-white">Select</option>
                  <option value="Yes" className="text-gray-900 bg-white">Yes</option>
                  <option value="No" className="text-gray-900 bg-white">No</option>
                  <option value="Maybe" className="text-gray-900 bg-white">Maybe</option>
                </select>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                  <button
                    onClick={() => handleRSVP(event.id)}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform w-full sm:w-auto"
                  >
                    Save
                  </button>
                  {event.created_by === user?.id && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold shadow-lg hover:bg-red-600 transition w-full sm:w-auto"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {message && <div className="mt-4 text-center text-black font-semibold">{message}</div>}
    </div>
  );
}
