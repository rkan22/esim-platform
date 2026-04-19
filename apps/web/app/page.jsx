"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [api, setApi] = useState("https://esim-platform-production.up.railway.app");
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  async function login() {
    try {
      setError("");

      const res = await fetch(`${api}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Login failed");
      }

      localStorage.setItem("esim_platform_token", json.accessToken);
      localStorage.setItem("esim_platform_api_base", api);

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>

      <input value={api} onChange={(e) => setApi(e.target.value)} />
      <br /><br />

      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <br /><br />

      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <br /><br />

      {error && <div style={{ color: "red" }}>{error}</div>}

      <button onClick={login}>Login</button>
    </main>
  );
}