"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "reseller",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function safeJson(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Backend JSON dönmüyor. Gelen cevap: ${text.slice(0, 80)}`);
    }
  }

  function getAuth() {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const apiBase = (localStorage.getItem(API_BASE_KEY) || "").trim().replace(/\/+$/, "");

    if (!token || !apiBase) {
      router.push("/");
      throw new Error("Missing auth");
    }

    return { token, apiBase };
  }

  async function loadUsers() {
    try {
      setError("");
      const { token, apiBase } = getAuth();

      const res = await fetch(`${apiBase}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Users yüklenemedi");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  async function createUser() {
    try {
      setError("");
      setSuccess("");

      const { token, apiBase } = getAuth();

      const res = await fetch(`${apiBase}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "User oluşturulamadı");
      }

      setSuccess("User created");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "reseller",
      });
      loadUsers();
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  async function changeRole(id, role) {
    try {
      setError("");
      const { token, apiBase } = getAuth();

      const res = await fetch(`${apiBase}/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Role güncellenemedi");
      }

      loadUsers();
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  async function deleteUser(id) {
    try {
      setError("");
      const { token, apiBase } = getAuth();

      const res = await fetch(`${apiBase}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "User silinemedi");
      }

      loadUsers();
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  return (
    <main className="min-h-screen bg-[#060606] p-6 text-white">
      <div className="mb-8 text-lg">
        <a href="/dashboard" className="mr-4">Dashboard</a>
        <a href="/orders" className="mr-4">Orders</a>
        <a href="/wallet" className="mr-4">Wallet</a>
        <a href="/support" className="mr-4">Support</a>
        <a href="/admin">Admin</a>
      </div>

      <h1 className="mb-6 text-5xl font-semibold">Admin Panel</h1>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-200">
          {success}
        </div>
      ) : null}

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-2xl font-semibold">Create User</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="h-12 rounded-xl border border-white/10 bg-black/30 px-4"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="h-12 rounded-xl border border-white/10 bg-black/30 px-4"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="h-12 rounded-xl border border-white/10 bg-black/30 px-4"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="h-12 rounded-xl border border-white/10 bg-black/30 px-4"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="reseller">reseller</option>
            <option value="sub_reseller">sub_reseller</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <button
          onClick={createUser}
          className="mt-4 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-black"
        >
          Create User
        </button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="mb-2 text-xl font-semibold">{user.name}</div>
            <div className="text-sm text-white/50">{user.email}</div>
            <div className="mt-2 text-sm">Role: {user.role}</div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => changeRole(user.id, "reseller")}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2"
              >
                Make Reseller
              </button>

              <button
                onClick={() => changeRole(user.id, "sub_reseller")}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2"
              >
                Make Sub-Reseller
              </button>

              <button
                onClick={() => changeRole(user.id, "admin")}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2"
              >
                Make Admin
              </button>

              <button
                onClick={() => deleteUser(user.id)}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}