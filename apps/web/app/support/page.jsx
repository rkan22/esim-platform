"use client";

import { useState } from "react";

export default function SupportPage() {
  const [message, setMessage] = useState("");

  async function send() {
    const api = localStorage.getItem("esim_platform_api_base");
    const token = localStorage.getItem("esim_platform_token");

    await fetch(`${api}/api/support`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    alert("Sent");
    setMessage("");
  }

  return (
    <main style={{ padding: 24, color: "#fff", background: "#000", minHeight: "100vh" }}>
      <h1>Support</h1>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your issue..."
        style={{ width: "100%", height: 120 }}
      />

      <br /><br />
      <button onClick={send}>Send</button>
    </main>
  );
}
