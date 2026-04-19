"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function SupportPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  async function safeJson(res) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Backend JSON dönmüyor. Gelen cevap: ${text.slice(0, 80)}`);
    }
  }

  async function loadTickets() {
    try {
      setError("");

      const token = localStorage.getItem(TOKEN_KEY) || "";
      const apiBase = (localStorage.getItem(API_BASE_KEY) || "").replace(/\/$/, "");

      if (!token || !apiBase) {
        router.push("/");
        return;
      }

      const res = await fetch(`${apiBase}/api/support`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Support yüklenemedi");
      }

      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  async function send() {
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem(TOKEN_KEY) || "";
      const apiBase = (localStorage.getItem(API_BASE_KEY) || "").replace(/\/$/, "");

      if (!token || !apiBase) {
        router.push("/");
        return;
      }

      const res = await fetch(`${apiBase}/api/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Support gönderilemedi");
      }

      setSuccess("Support request sent");
      setMessage("");
      loadTickets();
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <a href="/dashboard" style={{ color: "#fff", marginRight: 12 }}>Dashboard</a>
        <a href="/orders" style={{ color: "#fff", marginRight: 12 }}>Orders</a>
        <a href="/wallet" style={{ color: "#fff", marginRight: 12 }}>Wallet</a>
        <a href="/support" style={{ color: "#fff", marginRight: 12 }}>Support</a>
      </div>

      <h1>Support</h1>

      {error ? (
        <div
          style={{
            background: "#2a1111",
            border: "1px solid #5a2222",
            color: "#ffb3b3",
            padding: 12,
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            background: "#112a19",
            border: "1px solid #225a33",
            color: "#b7ffca",
            padding: 12,
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          {success}
        </div>
      ) : null}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your issue..."
        style={{
          width: "100%",
          height: 120,
          borderRadius: 12,
          border: "1px solid #333",
          background: "#111",
          color: "#fff",
          padding: 12,
        }}
      />

      <br />
      <br />

      <button
        onClick={send}
        style={{
          height: 42,
          padding: "0 16px",
          borderRadius: 12,
          border: "1px solid #333",
          background: "#22c55e",
          color: "#000",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Send
      </button>

      <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              background: "#111",
              border: "1px solid #222",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div><b>ID:</b> {ticket.id}</div>
            <div><b>Status:</b> {ticket.status}</div>
            <div><b>Message:</b> {ticket.message}</div>
            <div><b>User:</b> {ticket.createdBy}</div>
          </div>
        ))}
      </div>
    </main>
  );
}