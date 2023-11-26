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
    const wishlistcollection = client.db("blogDB").collection("wishlist");
    const detailsCollection = client.db("blogDB").collection("details");

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

    app.get("/wishlist", async (req, res) => {
      const cursor = await wishlistcollection.find().toArray();
      res.send(cursor);
    });

    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await wishlistcollection.deleteOne(filter);
      res.send(result);
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

    app.get("/details", async (req, res) => {
      const cursor = await detailsCollection.find().toArray();
      res.send(cursor);
    });

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

// const express = require('express');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const cookieparser = require('cookie-parser')
// require('dotenv').config()
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const app = express();
// const port = process.env.PORT || 5000;

// // middleware

// app.use(cors({
//   origin : [
//     // 'http://localhost:5173'
//     'https://blog-website-15a06.web.app',
//     'https://blog-website-15a06.firebaseapp.com'
//   ],
//   credentials : true
// }));
// app.use(express.json());
// app.use(cookieparser())

// const uri = mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ce2m8v.mongodb.net/?retryWrites=true&w=majority;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// ada
// async function run() {
//   try {
//     await client.connect();

//     const essentialcollection = client.db('essentialitem').collection('item');
//     const addblogcollection = client.db('addblog').collection('info');
//     const wishlistcollection = client.db('allwishlist').collection('wishlist');
//     const commentcollection = client.db('allcomment').collection('comment')

//     // auth api

//     app.post('/jwt', async(req,res)=>{
//       const user = req.body;
//       console.log('token user', user)
//       const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn : '3h'})
//       res.cookie('token', token, {
//         httpOnly : true,
//         secure : true,
//         sameSite : 'none'
//       })
//       .send({success : true})
//     })

//     app.post('/signout', async(req,res)=>{
//       const user = req.body;
//       res.clearCookie('token',{maxAge : 0})
//       .send({success : true})
//     })
//     // Send a ping to confirm a successful connection

//     app.get('/item', async(req,res)=>{
//         const cursor = await essentialcollection.find().toArray();
//         res.send(cursor)
//     })

//     // addblog apis
//     app.get('/info', async(req,res)=>{
//       const cursor = await addblogcollection.find().toArray();
//       res.send(cursor)
//   })

//     app.post('/info', async(req,res)=>{
//         const alldata = req.body;
//         // console.log(alldata)
//         const result = await addblogcollection.insertOne(alldata);
//         res.send(result)
//     })
// // for blogdetails
//     app.get('/info/:id', async(req,res)=>{
//       const id = req.params.id;
//       // console.log(id)
//       const options = {
//         projection: { _id:1, title: 1, image: 1,shortdes : 1 ,category : 1,longdes :1 },
//       };
//       const filter = { _id : new ObjectId(id)}
//       const result = await addblogcollection.findOne(filter,options)
//       res.send(result)
//     })

//     app.patch('/info/:id', async(req,res)=>{
//       const id = req.params.id;
//       console.log(id)
//       const filter = { _id : new ObjectId(id)}
//     const updatedbody = req.body;
//     console.log(updatedbody)
//       const updateDoc = {
//         $set: {
//           title : updatedbody.title,
//           image : updatedbody.image,
//        shortdes : updatedbody.shortdes,
//       category  : updatedbody.category,
//         longdes : updatedbody.longdes
//         },
//       };
//       const result = await addblogcollection.updateOne(filter,updateDoc)
//       res.send(result)
//     })

//     // wishlist api
//     app.post('/wishlist', async(req,res)=>{
//       const alldata = req.body;
//       // console.log(alldata);
//       const result = await wishlistcollection.insertOne(alldata);
//       res.send(result)
//     })

//     app.get('/wishlist', async(req,res)=>{
//       const cursor = await wishlistcollection.find().toArray()
//       res.send(cursor)
//     })

//     app.delete('/wishlist/:id', async(req,res)=>{
//       const id = req.params.id;
//       // console.log(id)
//       const filter = { _id : new ObjectId(id)}
//       const result = await wishlistcollection.deleteOne(filter)
//       res.send(result)
//     })

//     // comment api

//     app.post('/comment',async(req,res)=>{
//       const alldata = req.body;
//       const result = await commentcollection.insertOne(alldata)
//       res.send(result)
//     })

//     app.get('/comment',async(req,res)=>{
//       const cursor = await commentcollection.find().toArray()
//       res.send(cursor)
//     })

//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }

