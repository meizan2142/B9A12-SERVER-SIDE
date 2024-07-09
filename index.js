const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()

const corsOptions = {
    origin: ['http://localhost:5173', 'https://supermacy-assignment.web.app'],
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.usv0l7z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // collection
        const userCollection = client.db('supermacy').collection('newUser')
        const topEarnersCollection = client.db('supermacy').collection('topEarners')
        const taskCollection = client.db('supermacy').collection('tasks')
        // get data of users who are registered
        app.get('/newuser', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        app.get('/newuser/:email', async (req, res) => {
            const email = req.params.email
            const result = await userCollection.findOne({email})
            res.send(result)
        })


        // show topEarner data on backend
        app.get('/topearners', async (req, res) => {
            const result = await topEarnersCollection.find().toArray()
            res.send(result)
        })
        // post data from client side(client side Registration)
        app.post('/newuser', async (req, res) => {
            const newUsers = req.body;
            const query  = {email: newUsers.email}
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({message: 'User Already exists', insertedId: null})
            }
            const result = await userCollection.insertOne(newUsers);
            res.send(result)
        });
        // Task collection
        app.get('/addedtasks', async(req, res) => {
            const result = await taskCollection.find().toArray()
            res.send(result)
        })
        // Storing all added task on mongodb
        app.post('/addedtasks', async (req, res) => {
            const allTasks = req.body;
            console.log(allTasks);
            const result = await taskCollection.insertOne(allTasks);
            console.log(result);
            res.send(result)
        });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally { }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('If you smell, what the Rock is Cooking')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
