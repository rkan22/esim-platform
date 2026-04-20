"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function LoginPage() {
  const router = useRouter();

  const [apiBase, setApiBase] = useState("https://esim-platform-production.up.railway.app");
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setError("");
      setLoading(true);

      const base = apiBase.trim().replace(/\/+$/, "");

      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(API_BASE_KEY, base);

      router.push("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="w-full max-w-xl p-10 rounded-[30px] bg-white/5 border border-white/10 backdrop-blur-xl">

        <h1 className="text-4xl font-semibold mb-2">eSIM Platform</h1>
        <p className="text-white/50 mb-8">Premium SaaS Login</p>

        <input
          className="w-full mb-4 h-14 px-4 rounded-xl bg-black/40 border border-white/10"
          placeholder="Backend URL"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
        />

        <input
          className="w-full mb-4 h-14 px-4 rounded-xl bg-black/40 border border-white/10"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 h-14 px-4 rounded-xl bg-black/40 border border-white/10"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="mb-4 text-red-400 text-sm">{error}</div>
        )}

        <button
          onClick={handleLogin}
          className="w-full h-14 rounded-xl bg-emerald-400 text-black font-semibold"
        >
          {loading ? "Signing..." : "Login"}
        </button>
      </div>
    </main>
  );
}