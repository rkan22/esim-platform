"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

async function loginRequest(apiBase, email, password) {
  const base = apiBase.trim().replace(/\/$/, "");
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || "Login failed");
  }

  if (!data?.accessToken) {
    throw new Error("Token missing");
  }

  return data;
}

export default function LoginPage() {
  const router = useRouter();
  const [apiBase, setApiBase] = useState("");
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginRequest(apiBase, email, password);
      localStorage.setItem("esim_platform_token", data.accessToken);
      localStorage.setItem(TOKEN_KEY, result.accessToken);
      localStorage.setItem(API_BASE_KEY, apiBase.trim().replace(/\/$/, ""));

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#111",
          border: "1px solid #222",
          borderRadius: 20,
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Login</h1>
        <p style={{ color: "#aaa", marginBottom: 20 }}>
          Backend URL + demo kullanıcı ile giriş yap
        </p>

        <label style={{ display: "block", marginBottom: 8 }}>Backend API URL</label>
        <input
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          placeholder="https://your-backend.railway.app"
          style={inputStyle}
        />

        <label style={{ display: "block", marginBottom: 8 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: "block", marginBottom: 8 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 14,
            border: "none",
            background: "#22c55e",
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  height: 46,
  marginBottom: 14,
  borderRadius: 12,
  border: "1px solid #333",
  background: "#000",
  color: "#fff",
  padding: "0 14px",
  outline: "none",
};