const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.akoa4pb.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const coffeeCollection = client.db("coffeeDB").collection("coffees");
    const userCollection = client.db("coffeeDB").collection("users");

    // Coffee APIs
    app.get("/coffees", async (req, res) => {
      const result = await coffeeCollection.find().toArray();
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const result = await coffeeCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = { $set: req.body };
      const result = await coffeeCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // User APIs
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
      const result = await userCollection.insertOne(userProfile);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const { email, lastSignInTime } = req.body;
      const filter = { email };
      const updatedDoc = { $set: { lastSignInTime } };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Ping
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Do not close client, keep server running
  }
}

run().catch(console.dir);

// Root route
app.get("/", (req, res) => {
  res.send("Coffee server is getting hotter.");
});

// Start server
app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
});
