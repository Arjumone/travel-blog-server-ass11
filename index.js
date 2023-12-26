const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1mhzzn6.mongodb.net/?retryWrites=true&w=majority`;


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
    // await client.connect();

    const blogCollection = client.db("blogDB").collection("blogs");
    const wishlistcollection = client.db("blogDB").collection("wishlist");
    const detailsCollection = client.db("blogDB").collection("details");
    const commentsCollection = client.db("blogDB").collection("comments");

    app.get("/blogs", async (req, res) => {
      const cursor = await blogCollection.find().toArray();
      res.send(cursor);
    });

    app.post("/blogs", async (req, res) => {
      const alldata = req.body;
      alldata.date = new Date();
      const result = await blogCollection.insertOne(alldata);
      res.send(result);
    });

    app.get("/blogs/current", async (req, res) => {
      const currentDate = new Date();
      const startOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const endOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1
      );

      const filter = {
        date: { $gte: startOfDay, $lt: endOfDay },
      };

      const options = {
        projection: {
          _id: 1,
          title: 1,
          image: 1,
          sortDescription: 1,
          longDescription: 1,
          date: 1,
        },
      };

      const result = await blogCollection.find(filter, options).toArray();
      res.send(result);
    });

    // wishlist
   
    app.post("/wishlist/:email", async (req, res) => {
        const userEmail = req.params.email;
        const { blog } = req.body;
        const wishlistItem = {
          userEmail,
          blog,
        };
        const result = await wishlistcollection.insertOne(wishlistItem);
        res.send(result);
      
    });
    
    app.get("/wishlist/:email", async (req, res) => {
        const userEmail = req.params.email;
        const cursor = await wishlistcollection.find({ userEmail }).toArray();
        res.send(cursor);
    });
    
    app.delete("/wishlist/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await wishlistcollection.deleteOne(filter);
        res.send(result);
    });
    

    // all blogs
    app.post("/blogs", async (req, res) => {
        const blogData = req.body;
        const result = await blogCollection.insertOne(blogData);
        res.send(result);
    });

    app.get('/blogs', async (req, res) => {
        const allBlogs = await blogCollection.find().toArray();
        res.json(allBlogs);
    });
    
    app.get('/blogs/:title', async (req, res) => {
        const title = req.params.title;
    
        // Check if title is an empty string
        if (title.trim() === '') {
          const allBlogs = await blogCollection.find().toArray();
          res.send(allBlogs);
        } else {
          const regex = new RegExp(title, 'i');
          const filteredBlogs = await blogCollection.find({
            title: { $regex: regex },
          }).toArray();
    
          res.send(filteredBlogs);
        }
    });
    

    // details
    app.post("/details/:email", async (req, res) => {
      const userEmail = req.params.email;
      const { blog } = req.body;
      const wishlistItem = {
        userEmail,
        blog,
      };
      const result = await detailsCollection.insertOne(wishlistItem);
      res.send(result);
    });

    app.get('/details/:email', async (req, res) => {
        const { email } = req.params;
        const details = await detailsCollection.find({ userEmail: email }).toArray();
        res.send(details);
    });

    // comments

    app.post("/comments", async (req, res) => {
        const newComment = req.body;
        const result = await commentsCollection.insertOne(newComment);
        res.send(result);
    });

    // features

    app.get("/blogs", async (req, res) => {
        const topBlogs = await blogCollection
          .find()
          .sort({ "longDescription.length": -1 })
          .limit(10)
          .toArray();
    
        res.send(topBlogs);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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

