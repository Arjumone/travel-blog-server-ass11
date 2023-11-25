const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ButtonGroup } = require("react-bootstrap");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());



// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1mhzzn6.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const blogCollection = client.db("blogDB").collection("blogs");
    const bgCollection = client.db("blogDB").collection("blog");

    // blogs related apiiijjiiiii

    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/blogs", async (req, res) => {
      const newBlogs = req.body;
      const result = await blogCollection.insertOne(newBlogs);
      res.send(result);
    });

    // blog

    app.get('/blog/:email',async(req,res)=>{
      const email= req.params.email;
      const filter = {userEmail:email};
      const result =await bgCollection.find(filter).toArray()
      res.send(result);
    })
    
    app.get('/blog',async(req,res)=>{
      const cursor = bgCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post("/blog", async (req, res) => {
      const blog = req.body;
      const result = await bgCollection.insertOne(blog);
      res.send(result);
    });

    app.delete('/blog/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bgCollection.deleteOne(query)
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
