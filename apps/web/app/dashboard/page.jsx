"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function safeJson(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Backend JSON dönmüyor. Gelen cevap: ${text.slice(0, 80)}`);
    }
  }

  async function loadStats() {
    try {
      setError("");

      const token = localStorage.getItem(TOKEN_KEY) || "";
      const apiBase = (localStorage.getItem(API_BASE_KEY) || "").trim().replace(/\/+$/, "");

      if (!token || !apiBase) {
        router.push("/");
        return;
      }

      const res = await fetch(`${apiBase}/api/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Load failed");
      }

      setStats(data);
    } catch (err) {
      setError(err.message || "Load failed");
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(API_BASE_KEY);
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#060606] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl lg:block">
          <div className="flex h-full flex-col p-6">
            <div className="mb-10">
              <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                eSIM Platform
              </div>
              <p className="text-sm text-white/50">Stripe-style SaaS dashboard</p>
            </div>

            <nav className="space-y-2">
              <a href="/admin" className="mr-4">Admin</a>
              <NavLink href="/dashboard" label="Dashboard" active />
              <NavLink href="/orders" label="Orders" />
              <NavLink href="/wallet" label="Wallet" />
              <NavLink href="/support" label="Support" />
            </nav>

            <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Workspace</p>
              <h3 className="mt-2 text-lg font-semibold">Admin Panel</h3>
              <p className="mt-2 text-sm text-white/50">
                Premium dashboard shell hazır.
              </p>
              <button
                onClick={logout}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                <p className="mt-1 text-sm text-white/50">
                  Revenue, orders and reseller activity overview
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
                  Live
                </div>
                <button
                  onClick={loadStats}
                  className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300"
                >
                  Refresh
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-6">
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {!stats ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60 backdrop-blur-xl">
                Loading...
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Wallet Balance" value={`€${stats.walletBalance}`} hint="Available balance" />
                  <MetricCard title="Today Revenue" value={`€${stats.todayRevenue}`} hint="Current sales performance" />
                  <MetricCard title="Orders" value={String(stats.orders)} hint="Tracked orders" />
                  <MetricCard title="Active Resellers" value={String(stats.activeResellers)} hint="Reseller network" />
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-2 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Revenue Overview</h2>
                        <p className="mt-1 text-sm text-white/50">Premium glass panel placeholder</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/60">
                        Last 7 days
                      </div>
                    </div>

                    <div className="mt-8 h-72 rounded-[24px] border border-dashed border-white/10 bg-black/20" />
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                    <p className="mt-1 text-sm text-white/50">Frequently used workflows</p>

                    <div className="mt-6 space-y-3">
                      <QuickButton href="/orders" label="View Orders" />
                      <QuickButton href="/wallet" label="Open Wallet" />
                      <QuickButton href="/support" label="Support Center" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <h2 className="text-xl font-semibold">Platform Notes</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                    Bu shell artık premium SaaS görünümünün temeli. Sonraki adımda
                    orders, wallet ve support sayfalarını aynı glassmorphism stiline
                    taşıyacağız.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function NavLink({ href, label, active = false }) {
  return (
    <a
      href={href}
      className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-white text-black"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}

function MetricCard({ title, value, hint }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <p className="text-sm text-white/50">{title}</p>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <p className="mt-2 text-sm text-white/40">{hint}</p>
    </div>
  );
}

function QuickButton({ href, label }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80 transition hover:bg-white/10"
    >
      <span>{label}</span>
      <span className="text-white/40">→</span>
    </a>
  );
}