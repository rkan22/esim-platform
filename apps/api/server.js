const express = require("express");

const app = express();

app.use(express.json());

app.post("/api/auth/login", (req, res) => {

  const { email, password } = req.body;

  if (email === "admin@demo.com" && password === "123456") {

    return res.json({

      accessToken: "demo-token-123"

    });

  }

  res.status(401).json({ error: "Invalid credentials" });

});

app.get("/api/dashboard/stats", (req, res) => {

  res.json({

    walletBalance: 1200,

    todayRevenue: 320,

    orders: 45,

    activeResellers: 12

  });

});

app.get("/health", (req, res) => {

  res.send("OK");

});

app.listen(3000, () => {

  console.log("API running on 3000");

});
