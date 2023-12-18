const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");
const dotenv = require("dotenv");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// middleware
app.use(cors());
app.use(express.json());
dotenv.config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o1ht6xv.mongodb.net/?retryWrites=true&w=majority`;

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

    const BonikDb = client.db("BonikDB");
    const productCollection = BonikDb.collection("Products");
    const cartCollection = BonikDb.collection("cart");
    const userCollection = BonikDb.collection("user");



    // users related Api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //product api
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      // console.log(result);
      res.send(result);
    });

    // get Product by category 

    app.get('/product/:category', async(req,res)=>{
      const category = req.params.category 
      const result = await productCollection.find({category}).toArray()
      console.log(result);
      res.send(result)

    })

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    //Add Product

    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    //  update Product
    app.put("/updateProduct/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedProduct }
      );
      res.json(result);
    });
    //delete Product by Id 
    app.delete('/deleteProduct/:id', async(req, res)=>{
      const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await productCollection.deleteOne(query)
         console.log(result);
         res.send(result)

    })
    // add to cart api

    app.get("/add-cart", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/add-cart/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const data = req.body;
      const updateCart = {
        $set: {
          qty: data.qty,
          price: data.price,
        },
      };
      const result = await cartCollection.updateOne(filter, updateCart);

      res.send(result);
    });

    app.post("/add-cart", async (req, res) => {
      const data = req.body;
      const existingProduct = await cartCollection.findOne({
        productId: data.productId,
      });
      if (existingProduct) {
        res.send("Product is already in the cart");
      } else {
        const result = await cartCollection.insertOne(data);
        console.log(result);
        res.send(result);
      }
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

app.listen(PORT, () => {
  console.log(`server rinning on PORT ${PORT}`);
});
