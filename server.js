const express = require("express");
const { JsonDB, Config } = require("node-json-db");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Create a database (saves as db.json)
const db = new JsonDB(new Config("db", true, false, "/"));

// Initialize data if empty
(async () => {
  try {
    await db.getData("/users");
  } catch {
    await db.push("/users", [
      { id: 1, username: "Test_User", role: "employee" },
    ]);
    await db.push("/tickets", []);
    await db.push("/ticketIdCounter", 1);
  }
})();

app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await db.getData("/tickets");
    const users = await db.getData("/users");

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
    const id = await db.getData("/ticketIdCounter");
    const newTicket = { id, title, description, status: "Open", created_by: 1 };

    await db.push("/tickets[]", newTicket);
    await db.push("/ticketIdCounter", id + 1);

    res.json({ message: "Ticket created!", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tickets/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = parseInt(req.params.id);
    const tickets = await db.getData("/tickets");

    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index !== -1) {
      await db.push(`/tickets[${index}]/status`, status);
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
