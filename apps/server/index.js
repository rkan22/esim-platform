const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-production-key";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const accessToken = signToken(user);

  res.json({
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

app.get("/api/dashboard/stats", auth, async (req, res) => {
  const orderWhere = req.user.role === "admin" ? {} : { userId: req.user.sub };

  const ordersCount = await prisma.order.count({ where: orderWhere });

  const revenueAgg = await prisma.order.aggregate({
    where: {
      ...orderWhere,
      status: "Completed",
    },
    _sum: { amount: true },
  });

  const txWhere = req.user.role === "admin" ? {} : { userId: req.user.sub };

  const walletAgg = await prisma.walletTransaction.aggregate({
    where: txWhere,
    _sum: { amount: true },
  });

  const activeResellers =
    req.user.role === "admin"
      ? await prisma.user.count({ where: { role: "reseller" } })
      : 0;

  res.json({
    walletBalance: walletAgg._sum.amount || 0,
    todayRevenue: revenueAgg._sum.amount || 0,
    orders: ordersCount,
    activeResellers,
  });
});

app.get("/api/orders", auth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: req.user.role === "admin" ? {} : { userId: req.user.sub },
    orderBy: { createdAt: "desc" },
  });

  res.json({ orders });
});

app.get("/api/wallet", auth, async (req, res) => {
  const transactions = await prisma.walletTransaction.findMany({
    where: req.user.role === "admin" ? {} : { userId: req.user.sub },
    orderBy: { createdAt: "desc" },
  });

  const balance = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  res.json({ balance, transactions });
});

app.get("/api/support", auth, async (req, res) => {
  const tickets = await prisma.supportTicket.findMany({
    where: req.user.role === "admin" ? {} : { userId: req.user.sub },
    orderBy: { createdAt: "desc" },
  });

  res.json({ tickets });
});

app.post("/api/support", auth, async (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      message,
      status: "Open",
      userId: req.user.sub,
    },
  });

  res.status(201).json({ ok: true, ticket });
});

app.get("/api/admin/users", auth, adminOnly, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
    })),
  });
});

app.post("/api/admin/users", auth, adminOnly, async (req, res) => {
  const { email, password, role, name } = req.body || {};

  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const exists = await prisma.user.findUnique({
    where: { email },
  });

  if (exists) {
    return res.status(400).json({ error: "User exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      name,
    },
  });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

app.put("/api/admin/users/:id/role", auth, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};

  if (!role) {
    return res.status(400).json({ error: "role is required" });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

app.delete("/api/admin/users/:id", auth, adminOnly, async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.delete({
    where: { id },
  });

  res.json({
    ok: true,
    deletedUser: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.listen(PORT, () => {
  console.log(`API running on ${PORT}`);
});