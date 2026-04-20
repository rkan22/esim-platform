"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "esim_platform_token";
const API_BASE_KEY = "esim_platform_api_base";

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "reseller",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    baseCost: "",
    sellPrice: "",
    region: "",
    validity: "",
  });

  const [priceForm, setPriceForm] = useState({
    resellerId: "",
    productId: "",
    price: "",
  });

  const [topupForm, setTopupForm] = useState({
    userId: "",
    amount: "",
  });

  useEffect(() => {
    boot();
  }, []);

  async function boot() {
    await Promise.all([loadUsers(), loadProducts()]);
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

  async function safeJson(res) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Backend JSON dönmüyor. Gelen cevap: ${text.slice(0, 120)}`);
    }
  }

  async function request(path, options = {}) {
    const { token, apiBase } = getAuth();

    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await safeJson(res);

    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  }

  async function loadUsers() {
    try {
      setError("");
      const data = await request("/api/admin/users");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message || "Users load failed");
    }
  }

  async function loadProducts() {
    try {
      setError("");
      const data = await request("/api/admin/products");
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err.message || "Products load failed");
    }
  }

  async function createUser() {
    try {
      setError("");
      setSuccess("");

      await request("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userForm),
      });

      setSuccess("User created");
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "reseller",
      });
      await loadUsers();
    } catch (err) {
      setError(err.message || "Create user failed");
    }
  }

  async function changeRole(id, role) {
    try {
      setError("");
      setSuccess("");

      await request(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      setSuccess("Role updated");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Role update failed");
    }
  }

  async function deleteUser(id) {
    try {
      setError("");
      setSuccess("");

      await request(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      setSuccess("User deleted");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  async function createProduct() {
    try {
      setError("");
      setSuccess("");

      await request("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productForm,
          baseCost: Number(productForm.baseCost),
          sellPrice: Number(productForm.sellPrice),
        }),
      });

      setSuccess("Product created");
      setProductForm({
        name: "",
        baseCost: "",
        sellPrice: "",
        region: "",
        validity: "",
      });
      await loadProducts();
    } catch (err) {
      setError(err.message || "Create product failed");
    }
  }

  async function saveResellerPrice() {
    try {
      setError("");
      setSuccess("");

      await request("/api/admin/reseller-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resellerId: priceForm.resellerId,
          productId: priceForm.productId,
          price: Number(priceForm.price),
        }),
      });

      setSuccess("Reseller price saved");
      setPriceForm({
        resellerId: "",
        productId: "",
        price: "",
      });
    } catch (err) {
      setError(err.message || "Save price failed");
    }
  }

  async function topupWallet() {
    try {
      setError("");
      setSuccess("");

      await request("/api/admin/wallet/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: topupForm.userId,
          amount: Number(topupForm.amount),
        }),
      });

      setSuccess("Wallet topped up");
      setTopupForm({
        userId: "",
        amount: "",
      });
    } catch (err) {
      setError(err.message || "Top-up failed");
    }
  }

  return (
    <main className="min-h-screen bg-[#060606] text-white">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <a href="/dashboard" className="text-white/70 hover:text-white">Dashboard</a>
          <a href="/orders" className="text-white/70 hover:text-white">Orders</a>
          <a href="/wallet" className="text-white/70 hover:text-white">Wallet</a>
          <a href="/support" className="text-white/70 hover:text-white">Support</a>
          <a href="/admin" className="font-semibold text-white">Admin</a>
        </div>

        <div className="mb-8">
          <h1 className="text-5xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="mt-2 text-white/50">
            User management, product pricing and wallet control
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Create User" subtitle="Add admin, reseller or sub-reseller">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
              <Input
                placeholder="Password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
              <Select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                options={[
                  { value: "admin", label: "admin" },
                  { value: "reseller", label: "reseller" },
                  { value: "sub_reseller", label: "sub_reseller" },
                ]}
              />
            </div>

            <button
              onClick={createUser}
              className="mt-4 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-black"
            >
              Create User
            </button>
          </SectionCard>

          <SectionCard title="Create Product" subtitle="Global product catalog">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
              <Input
                placeholder="Region"
                value={productForm.region}
                onChange={(e) => setProductForm({ ...productForm, region: e.target.value })}
              />
              <Input
                placeholder="Base Cost"
                value={productForm.baseCost}
                onChange={(e) => setProductForm({ ...productForm, baseCost: e.target.value })}
              />
              <Input
                placeholder="Sell Price"
                value={productForm.sellPrice}
                onChange={(e) => setProductForm({ ...productForm, sellPrice: e.target.value })}
              />
              <div className="md:col-span-2">
                <Input
                  placeholder="Validity (ex: 30 days)"
                  value={productForm.validity}
                  onChange={(e) => setProductForm({ ...productForm, validity: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={createProduct}
              className="mt-4 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-black"
            >
              Create Product
            </button>
          </SectionCard>

          <SectionCard title="Reseller Pricing" subtitle="Assign special price by reseller">
            <div className="grid gap-4 md:grid-cols-3">
              <Select
                value={priceForm.resellerId}
                onChange={(e) => setPriceForm({ ...priceForm, resellerId: e.target.value })}
                options={[
                  { value: "", label: "Select reseller" },
                  ...users
                    .filter((u) => u.role === "reseller" || u.role === "sub_reseller")
                    .map((u) => ({
                      value: u.id,
                      label: `${u.name} (${u.email})`,
                    })),
                ]}
              />

              <Select
                value={priceForm.productId}
                onChange={(e) => setPriceForm({ ...priceForm, productId: e.target.value })}
                options={[
                  { value: "", label: "Select product" },
                  ...products.map((p) => ({
                    value: p.id,
                    label: `${p.name} - €${p.sellPrice}`,
                  })),
                ]}
              />

              <Input
                placeholder="Special Price"
                value={priceForm.price}
                onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
              />
            </div>

            <button
              onClick={saveResellerPrice}
              className="mt-4 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-black"
            >
              Save Price
            </button>
          </SectionCard>

          <SectionCard title="Wallet Top-up" subtitle="Manual admin balance adjustment">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                value={topupForm.userId}
                onChange={(e) => setTopupForm({ ...topupForm, userId: e.target.value })}
                options={[
                  { value: "", label: "Select user" },
                  ...users.map((u) => ({
                    value: u.id,
                    label: `${u.name} (${u.email})`,
                  })),
                ]}
              />

              <Input
                placeholder="Amount"
                value={topupForm.amount}
                onChange={(e) => setTopupForm({ ...topupForm, amount: e.target.value })}
              />
            </div>

            <button
              onClick={topupWallet}
              className="mt-4 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-black"
            >
              Top Up Wallet
            </button>
          </SectionCard>
        </div>

        <SectionCard title="Users" subtitle="Manage roles and accounts" className="mt-6">
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xl font-semibold">{user.name}</div>
                    <div className="text-sm text-white/50">{user.email}</div>
                    <div className="mt-2 text-sm">
                      Role: <span className="font-medium text-white/80">{user.role}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <ActionButton onClick={() => changeRole(user.id, "reseller")}>
                      Make Reseller
                    </ActionButton>
                    <ActionButton onClick={() => changeRole(user.id, "sub_reseller")}>
                      Make Sub-Reseller
                    </ActionButton>
                    <ActionButton onClick={() => changeRole(user.id, "admin")}>
                      Make Admin
                    </ActionButton>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Products" subtitle="Catalog overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="text-xl font-semibold">{product.name}</div>
                <div className="mt-2 text-sm text-white/50">{product.region}</div>
                <div className="mt-2 text-sm text-white/70">Validity: {product.validity}</div>
                <div className="mt-3 text-sm">Base Cost: €{product.baseCost}</div>
                <div className="text-sm">Sell Price: €{product.sellPrice}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${className}`}>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-white/50">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white placeholder:text-white/30"
    />
  );
}

function Select({ options, ...props }) {
  return (
    <select
      {...props}
      className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-[#111]">
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ActionButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-white/90"
    >
      {children}
    </button>
  );
}