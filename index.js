const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());


//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zhz6fpd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const productCollection = client.db("gadgetBurstDB").collection("products");
        const cartCollection = client.db("gadgetBurstDB").collection("cart");

        app.post("/products", async(req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

        app.get("/products/:brand_name", async (req, res) => {
            const brandName = req.params.brand_name;
            const query = { brand_name: brandName };
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/product-details/:_id", async (req, res) => {
            const id = req.params._id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        });

        app.patch("/products/:_id", async (req, res) => {
            const product = req.body;
            console.log(product);
            const id = req.params._id;
            console.log(id);
            const query = { _id: new ObjectId(id)};
            const updateDoc = {
                $set: {
                    name : product.name,
                    image_url: product.image_url,
                    brand_name: product.brand_name,
                    type : product.type,
                    price : product.price,
                    rating : product.rating
                }
            };
            const result = await productCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        app.post("/cart", async(req, res) => {
            const product = req.body;
            const result = await cartCollection.insertOne(product);
            res.send((result));
        });

        app.get("/cart", async(req, res) => {
            const products = cartCollection.find();
            const result = await products.toArray();
            res.send(result);
        });

        app.delete("/cart/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const product = cartCollection.findOne(query);
            const result = await cartCollection.deleteOne(product);
            res.send(result);
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



//tester
app.get('/', (req, res) => {
    res.send("Server is running...");
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});