"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const token = localStorage.getItem(TOKEN_KEY);
    const api = localStorage.getItem(API_BASE_KEY);

    const res = await fetch(`${api}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setOrders(data.orders || []);
  }

  return (
    <main className="p-6 text-white bg-[#060606] min-h-screen">
      <h1 className="text-4xl mb-6">Orders</h1>

      <div className="grid gap-4">
        {orders.map(o => (
          <div key={o.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="font-semibold">{o.plan}</div>
            <div className="text-sm text-white/50">{o.country}</div>
            <div className="mt-2">€{o.amount}</div>
          </div>
        ))}
      </div>
    </main>
  );
}