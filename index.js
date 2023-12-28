const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

    const usersCollection = client.db("blogDB").collection("users");
    const blogCollection = client.db("blogDB").collection("blogs");
    const wishlistcollection = client.db("blogDB").collection("wishlist");
    const detailsCollection = client.db("blogDB").collection("details");
    const commentsCollection = client.db("blogDB").collection("comments");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // recent blog
    app.get("/blogs", async (req, res) => {
        const blogs = await blogCollection.find().sort({ date: -1 }).toArray();
        res.send(blogs);
    });

    // Add a new blog
    app.post("/blogs", async (req, res) => {
        const blogData = req.body;
        blogData.date = new Date();
        const result = await blogCollection.insertOne(blogData);
        res.send(result);
    });

    // wishlist
app.post("/wishlist", async (req, res) => {
  const { blog, userEmail } = req.body;
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

    app.delete("/wishlist/:email/:id", async (req, res) => {
      const userEmail = req.params.email;
      const id = req.params.id;
      const result = await wishlistcollection.deleteOne({ userEmail });
      res.send(result);
    });

    // all blogs
    // app.post("/blogs", async (req, res) => {
    //   const blogData = req.body;
    //   const result = await blogCollection.insertOne(blogData);
    //   res.send(result);
    // });

    app.get('/blogs', async (req, res) => {
        const blogs = await blogCollection.find({}).toArray();
        res.send(blogs);
    });

    app.get("/blogs/:title", async (req, res) => {
      const title = req.params.title;
      if (title.trim() === "") {
        const allBlogs = await blogCollection.find().toArray();
        res.send(allBlogs);
      } else {
        const regex = new RegExp(title, "i");
        const filteredBlogs = await blogCollection
          .find({
            title: { $regex: regex },
          }).toArray();
        res.send(filteredBlogs);
      }
    });

    // details done
    app.post("/details", async (req, res) => {
        // const userEmail = req.params.email;
        const { blog } = req.body;
        const detailsItem = {
          
          blog,
        };
        const result = await detailsCollection.insertOne(detailsItem);
        res.send(result);
    });

    app.get("/details/all", async (req, res) => {
        const details = await detailsCollection.find().toArray();
        res.send(details);
    });

    // comments done
    app.get("/comments/:blogId", async (req, res) => {
        const blogId = req.params.blogId;
        const comments = await commentsCollection.find({ blogId }).toArray();
        res.send(comments);
    });

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
          .toArray();
        res.send(topBlogs);
    });

    // update done
    app.get("/blogs/:id", async (req, res) => {
      const blogId = req.params.id;

      const blog = await blogCollection.findOne({ _id: ObjectId(blogId) });
      res.send(blog);
    });

    app.put("/blogs/:id", async (req, res) => {
      const blogId = req.params.id;
      const updatedBlog = req.body;
      const result = await blogCollection.updateOne(
        { _id: new ObjectId(blogId) },
        { $set: updatedBlog }
      );
      res.send(result);
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
