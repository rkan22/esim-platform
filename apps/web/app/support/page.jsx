"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const token = localStorage.getItem(TOKEN_KEY);
    const api = localStorage.getItem(API_BASE_KEY);

    const res = await fetch(`${api}/api/support`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setTickets(data.tickets || []);
  }

  async function send() {
    const token = localStorage.getItem(TOKEN_KEY);
    const api = localStorage.getItem(API_BASE_KEY);

    await fetch(`${api}/api/support`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: msg }),
    });

    setMsg("");
    load();
  }

  return (
    <main className="p-6 text-white bg-[#060606] min-h-screen">
      <h1 className="text-4xl mb-6">Support</h1>

      <textarea
        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />

      <button onClick={send} className="mb-6 px-6 py-3 bg-emerald-400 text-black rounded-xl">
        Send
      </button>

      {tickets.map(t => (
        <div key={t.id} className="p-4 mb-3 rounded-xl bg-white/5 border border-white/10">
          {t.message}
        </div>
      ))}
    </main>
  );
}