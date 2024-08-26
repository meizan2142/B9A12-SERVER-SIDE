const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
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
        const paymentInfoCollection = client.db('supermacy').collection('paymentInfo')
        const submissionsCollection = client.db('supermacy').collection('submissions')
        const withdrawCollection = client.db('supermacy').collection('withdraws')
        // get data of users who are registered
        app.get('/newuser', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        app.get('/newuser/:email', async (req, res) => {
            const email = req.params.email
            const result = await userCollection.findOne({ email })
            res.send(result)
        })
        app.get('/newuser/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.findOne(query)
            res.send(result)
        })
        // update a single user role
        app.put('/newuser/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const query = { email };
            console.log(user, query);
            const updateRole = {
                $set: {
                    role: user.selectedPerson.role,
                    coins: user.userCoins
                },
            };
            const result = await userCollection.updateOne(query, updateRole)
            res.send(result);
        })
        app.patch('/newuser/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const query = { email };
            console.log(user, query);
            const updateCoins1 = {
                $set: {
                    coins: user.reduced
                },
            };
            const result1 = await userCollection.updateOne(query, updateCoins1)
            res.send(result1);
        })
        // Delete a Single Task
        app.delete('/newuser/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            console.log(query);
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })
        // post data from client side(client side Registration)
        app.post('/newuser', async (req, res) => {
            const newUsers = req.body;
            const query = { email: newUsers.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'User Already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(newUsers);
            res.send(result)
        });
        // show topEarner data on backend
        app.get('/topearners', async (req, res) => {
            const result = await topEarnersCollection.find().toArray()
            res.send(result)
        })
        // Payment Info
        app.get('/paymentinfo', async (req, res) => {
            const result = await paymentInfoCollection.find().toArray()
            res.send(result)
        })
        app.get('/paymentinfo/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await paymentInfoCollection.findOne(query)
            res.send(result)
        })
        // Task collection
        app.get('/addedtasks', async (req, res) => {
            const result = await taskCollection.find().toArray()
            res.send(result)
        })
        // Storing all added task on mongodb
        app.post('/addedtasks', async (req, res) => {
            const allTasks = req.body;
            const result = await taskCollection.insertOne(allTasks);
            res.send(result)
        });

        app.get('/addedtasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query)
            res.send(result)
        })

        // update single Task
        app.put('/addedtasks/:id', async (req, res) => {
            console.log(req.params.id)
            const query = { _id: new ObjectId(req.params.id) }
            const data = {
                $set: {
                    title: req.body.title,
                    detail: req.body.detail,
                    quantity: req.body.quantity
                }
            }
            const result = await taskCollection.updateOne(query, data)
            console.log(result);
            res.send(result)
        })

        // Delete a Single Task
        app.delete('/addedtasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            console.log(query);
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })

        // Sumission Collection
        app.get('/submissions', async (req, res) => { 
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            console.log(page, size, req.query);
            // .skip(page * size).limit(size)

            const result = await submissionsCollection.find().toArray()
            res.send(result)
        })
        app.get('/submissionsCount', async (req, res) => {
            const count = await submissionsCollection.estimatedDocumentCount()
            res.send({ count })
        })
        app.get('/submissions/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await submissionsCollection.findOne(query)
            res.send(result)
        })
        app.post('/submissions', async (req, res) => {
            const allSubmissions = req.body;
            const result = await submissionsCollection.insertOne(allSubmissions);
            res.send(result)
        });
        // update a single submission's status
        app.put('/submissions/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            console.log(id, user);
            const query = { _id: new ObjectId(req.params.id) }
            const data = {
                $set: {
                    status: req.body.status
                }
            }
            const result = await submissionsCollection.updateOne(query, data)
            console.log(result);
            res.send(result)
        })
        // WithDraws route
        app.get('/withdraws', async (req, res) => {
            const result = await withdrawCollection.find().toArray()
            res.send(result)
        })
        app.get('/withdraws/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await withdrawCollection.findOne(query)
            res.send(result)
        })
        app.post('/withdraws', async (req, res) => {
            const allSubmissions = req.body;
            const result = await withdrawCollection.insertOne(allSubmissions);
            res.send(result)
        });
        // Delete a Single Withdraw
        app.delete('/withdraws/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            console.log(query);
            const result = await withdrawCollection.deleteOne(query)
            res.send(result)
        })
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
