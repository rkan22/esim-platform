const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_production";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const users = [
  {
    id: "u_1",
    email: "admin@demo.com",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "admin",
    name: "Admin Demo",
  },
  {
    id: "u_2",
    email: "reseller@demo.com",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "reseller",
    name: "Reseller Demo",
  },
];

const orders = [
  { id: "ORD-1", plan: "Europe 200GB", status: "Completed", amount: 35, country: "Germany" },
  { id: "ORD-2", plan: "Global 300GB", status: "Pending", amount: 40, country: "France" },
  { id: "ORD-3", plan: "Europe 400GB", status: "Completed", amount: 45, country: "Italy" },
];

const walletTransactions = [
  { id: "TX-1", type: "Top-up", amount: 500, status: "Completed" },
  { id: "TX-2", type: "Order", amount: -35, status: "Completed" },
  { id: "TX-3", type: "Order", amount: -40, status: "Pending" },
];

const supportTickets = [];

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = signToken(user);

  return res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/dashboard/stats", auth, (req, res) => {
  res.json({
    walletBalance: req.user.role === "admin" ? 12000 : 1200,
    todayRevenue: req.user.role === "admin" ? 3200 : 320,
    orders: req.user.role === "admin" ? 245 : 45,
    activeResellers: req.user.role === "admin" ? 12 : 0,
  });
});

app.get("/api/orders", auth, (_req, res) => {
  res.json({ orders });
});

app.get("/api/wallet", auth, (_req, res) => {
  res.json({
    balance: 1200,
    transactions: walletTransactions,
  });
});

app.get("/api/support", auth, (_req, res) => {
  res.json({ tickets: supportTickets });
});

app.post("/api/support", auth, (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const ticket = {
    id: `TCK-${Date.now()}`,
    message,
    status: "Open",
    createdBy: req.user.email,
  };

  supportTickets.unshift(ticket);

  res.status(201).json({
    ok: true,
    ticket,
  });
});

app.listen(PORT, () => {
  console.log(`API running on ${PORT}`);
});