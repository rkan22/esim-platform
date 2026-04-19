"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      const api = localStorage.getItem("esim_platform_api_base");
      const token = localStorage.getItem("esim_platform_token");

      const res = await fetch(`${api}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setOrders(data.orders || []);
    }

    load();
  }, []);

  return (
    <main style={{ padding: 24, color: "#fff", background: "#000", minHeight: "100vh" }}>
      <h1>Orders</h1>

      {orders.map((o) => (
        <div key={o.id} style={{ marginTop: 12, padding: 12, border: "1px solid #222" }}>
          <div>Plan: {o.plan}</div>
          <div>Status: {o.status}</div>
        </div>
      ))}
    </main>
  );
}
