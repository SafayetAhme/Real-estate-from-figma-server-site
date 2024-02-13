const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

const stripe = require('stripe')(process.env.STRIPE_SECRET_kEY);


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.jfiige1.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();


        // DATA COLLECTION NAME
        const menusCollection = client.db("Real-estate-from-Figma").collection("menus");
        const agentsCollection = client.db("Real-estate-from-Figma").collection("agents");
        const blogsCollection = client.db("Real-estate-from-Figma").collection("blogs");
        const projectsCollection = client.db("Real-estate-from-Figma").collection("projects");
        const usersCollection = client.db("Real-estate-from-Figma").collection("users");
        const addtoloveCollection = client.db("Real-estate-from-Figma").collection("addLove");
        const paymentCollection = client.db("Real-estate-from-Figma").collection("payment");



        // get menus data
        app.get('/menus', async (req, res) => {
            const result = await menusCollection.find().toArray();
            res.send(result);
        })

        // get agents data
        app.get('/agents', async (req, res) => {
            const result = await agentsCollection.find().toArray();
            res.send(result);
        })

        // get blogs data
        app.get('/blogs', async (req, res) => {
            const result = await blogsCollection.find().toArray();
            res.send(result);
        })

        // get projects data
        app.get('/projects', async (req, res) => {
            const result = await projectsCollection.find().toArray();
            res.send(result);
        })

        // get addlove data
        app.get('/addLove', async (req, res) => {
            const result = await addtoloveCollection.find().toArray();
            res.send(result);
        })

        // get users data
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        // get payments data
        app.get('/payment', async (req, res) => {
            const result = await paymentCollection.find().toArray();
            res.send(result);
        })

        // post user data
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user alredy exists', insertedId: null })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // post addlove data
        app.post('/addLove', async (req, res) => {
            try {
                const addtoLove = req.body;
                const result = await addtoloveCollection.insertOne(addtoLove);
                if (result.insertedId) {
                    res.status(201).json({ message: 'Data added to love successfully', insertedId: result.insertedId });
                } else {
                    res.status(500).json({ message: 'Failed to add data to love' });
                }
            } catch (error) {
                console.error('Error adding data to love:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        })

        // post review
        app.post('/customerReview/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const review = req.body;
            const item = await menusCollection.findOne({ _id: new ObjectId(id) })
            const exReview = item.customerReview
            exReview.push(review);
            const result = await menusCollection.updateOne({ _id: item._id }, {
                $set: {
                    customerReview: exReview
                }
            })
            res.send(result);
        })


        // post review for egent
        app.post('/agentReview/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const review = req.body;
            const item = await agentsCollection.findOne({ _id: new ObjectId(id) })
            const exReview = item?.customerReview;
            exReview.push(review);
            const result = await agentsCollection.updateOne({ _id: item._id }, {
                $set: {
                    customerReview: exReview
                }
            })
            res.send(result);
        })


        // payment intent
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            console.log("price some", price)
            const amount = parseFloat(price) * 100
            console.log(amount, 'amount inside the intent')

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card'],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        });


        // post paymenth information in data base
        app.post('/payment', async (req, res) => {
            const payment = req.body;
            const paymentResult = await paymentCollection.insertOne(payment);
            res.send(paymentResult);
        })


        // delete addlove data
        app.delete('/addLove/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addtoloveCollection.deleteOne(query);
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



app.get('/', (req, res) => {
    res.send('realestate is running from figma')
})

app.listen(port, () => {
    console.log(`realestate server is running on port ${port}`)
})