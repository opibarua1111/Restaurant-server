const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xbjvx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('restaurant_portal');
        const foodsCollection = database.collection('foods');
        const purchaseCollection = database.collection('purcheases');
        const userCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        //GET API
        app.get('/foods', async (req, res) => {
            const cursor = foodsCollection.find({});
            const foods = await cursor.toArray();
            res.send(foods);
        })
        //Get single API
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const food = await foodsCollection.findOne(query);
            res.json(food);
        });
        //Add order API
        app.post('/purchease', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase);
            res.json(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });

        //POST API
        app.post('/foods', async (req, res) => {
            const service = req.body;
            const result = await foodsCollection.insertOne(service);
            res.json(result);
        });

        //use POST to Get data by email
        app.post('/purchase/byEmail', async (req, res) => {
            const email = req.body.email
            const query = { email: email };
            const cursor = await purchaseCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        })
        //DELETE API
        app.delete('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            res.json(result);
        })
        //Add Review API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });
        //GET Users
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        })
        //UPDATE user and set admin role
        app.put('/users/admin/:email', async (req, res) => {
            const user = req.params.email;
            const makeNewAdmin = req.body;
            if (user) {
                const requesterAccount = await userCollection.findOne({ email: user });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: makeNewAdmin.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await userCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make Admin' })
            }
        })

        // GET User Check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //GET Reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        //GET purchases
        app.get('/purchases', async (req, res) => {
            const cursor = purchaseCollection.find({});
            const purchases = await cursor.toArray();
            res.send(purchases);
        })
        //purchase status UPDATE
        app.put('/purchase/:id', async (req, res) => {
            const productId = req.params.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(productId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status
                },
            };
            const result = await purchaseCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })
        //DELETE product
        app.delete('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await foodsCollection.deleteOne(query);
            res.json(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Resturent website!');
})

app.listen(port, () => {
    console.log('Running Resturent server', port);
})