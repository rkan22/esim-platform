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
];

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ accessToken });
});

app.get("/api/dashboard/stats", (_req, res) => {
  res.json({
    walletBalance: 12000,
    todayRevenue: 3200,
    orders: 245,
    activeResellers: 12,
  });
});

app.listen(PORT, () => {
  console.log(`API running on ${PORT}`);
});
const supportTickets = [];

app.get("/api/support", (req, res) => {
  res.json({ tickets: supportTickets });
});

app.post("/api/support", (req, res) => {
  const { message } = req.body;

  const ticket = {
    id: Date.now().toString(),
    message,
    status: "Open",
    createdBy: "admin@demo.com",
  };

  supportTickets.unshift(ticket);

  res.json({ success: true, ticket });
});