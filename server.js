const express = require("express");
const { createClient } = require("redis");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const client = createClient({
  url: "redis://redis-db:6379",
});

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await client.connect();
  const users = await client.get("users");
  if (!users) {
    await client.set(
      "users",
      JSON.stringify([{ id: 1, username: "Test_User", role: "employee" }]),
    );
    await client.set("tickets", JSON.stringify([]));
    await client.set("ticketIdCounter", "1");
  }
})();

app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = JSON.parse((await client.get("tickets")) || "[]");
    const users = JSON.parse((await client.get("users")) || "[]");

    const results = tickets.map((t) => {
      const user = users.find((u) => u.id === t.created_by);
      return { ...t, creator: user ? user.username : "Unknown" };
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tickets", async (req, res) => {
  try {
    const { title, description } = req.body;
    const id = parseInt((await client.get("ticketIdCounter")) || "1");
    const newTicket = { id, title, description, status: "Open", created_by: 1 };

    const tickets = JSON.parse((await client.get("tickets")) || "[]");
    tickets.push(newTicket);

    await client.set("tickets", JSON.stringify(tickets));
    await client.set("ticketIdCounter", (id + 1).toString());

    res.json({ message: "Ticket created!", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tickets/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = parseInt(req.params.id);
    const tickets = JSON.parse((await client.get("tickets")) || "[]");

    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index !== -1) {
      tickets[index].status = status;
      await client.set("tickets", JSON.stringify(tickets));
      res.json({ message: "Ticket updated!" });
    } else {
      res.status(404).json({ error: "Ticket not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
