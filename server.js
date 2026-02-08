const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

/* Home */
app.get("/", (req, res) => {
  res.redirect("/customer.html");
});

/* Simple menu */
app.get("/api/menu", (req, res) => {
  res.json([
    { id: "1", name: "Burger", price: 120 },
    { id: "2", name: "Pizza", price: 250 },
    { id: "3", name: "Pasta", price: 180 },
    { id: "4", name: "Coke", price: 40 },
  ]);
});

/* Orders */
let orders = [];
let nextId = 1;

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { tableNumber, items } = req.body;

  const order = {
    id: nextId++,
    tableNumber,
    items,
    status: "NEW",
    time: new Date().toLocaleTimeString(),
  };

  orders.unshift(order);

  // send to kitchen live
  io.emit("new-order", order);

  res.json(order);
});

app.patch("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    io.emit("update-order", order);
  }

  res.json(order);
});

server.listen(3000, () => {
  console.log("🔥 Running on http://localhost:3000");
});