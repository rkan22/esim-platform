const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "secret";

const users = [
  { email: "admin@demo.com", password: "123456", role: "admin" },
  { email: "reseller@demo.com", password: "123456", role: "reseller" },
  { email: "sub@demo.com", password: "123456", role: "sub" },
];

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET);
  res.json({ accessToken: token });
});

app.listen(3001, () => console.log("Server running on 3001"));
