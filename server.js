require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SMS Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// CREATE SUBSCRIPTION
app.post("/subscriptions", (req, res) => {
  const {
    user_email,
    plan_name,
    start_date,
    end_date,
    monthly_cost,
    status,
  } = req.body;

  // Basic validation
  if (!user_email || !plan_name || !start_date || !end_date || !monthly_cost || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `
    INSERT INTO subscriptions 
    (user_email, plan_name, start_date, end_date, monthly_cost, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [user_email, plan_name, start_date, end_date, monthly_cost, status],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({
        message: "Subscription created successfully",
        subscription_id: result.insertId,
      });
    }
  );
});


// GET ALL SUBSCRIPTIONS
app.get("/subscriptions", (req, res) => {
  const query = "SELECT * FROM subscriptions";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json(results);
  });
});

// GET SINGLE SUBSCRIPTION
app.get("/subscriptions/:id", (req, res) => {
  const id = req.params.id;

  const query = "SELECT * FROM subscriptions WHERE subscription_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json(results[0]);
  });
});


// UPDATE SUBSCRIPTION
app.put("/subscriptions/:id", (req, res) => {
  const id = req.params.id;

  const {
    user_email,
    plan_name,
    start_date,
    end_date,
    monthly_cost,
    status,
  } = req.body;

  const query = `
    UPDATE subscriptions
    SET user_email = ?, 
        plan_name = ?, 
        start_date = ?, 
        end_date = ?, 
        monthly_cost = ?, 
        status = ?
    WHERE subscription_id = ?
  `;

  db.query(
    query,
    [user_email, plan_name, start_date, end_date, monthly_cost, status, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.json({ message: "Subscription updated successfully" });
    }
  );
});


// DELETE SUBSCRIPTION
app.delete("/subscriptions/:id", (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM subscriptions WHERE subscription_id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ message: "Subscription deleted successfully" });
  });
});
