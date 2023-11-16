const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());

//veryfi jwt
const gateman = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({error:true,message:'unauthorized access'})
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
  if (err) {
    return res.status(401).send({error:true,message:'unauthorized access'})
    }
    req.decoded = decoded;
    next();
});
}





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.etfhytw.mongodb.net/?retryWrites=true&w=majority`;

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

    const menuCollection = client.db('bistroDB').collection('menu');
    const reviewCollection = client.db('bistroDB').collection('reviwes');
    const cartsCollection = client.db('bistroDB').collection('carts');
    const usersCollection = client.db('bistroDB').collection('users');

    //jwt
    app.post('/jwt', (req, res) => {
      const body = req.body;
      const token = jwt.sign(body, process.env.ACCESS_TOKEN, { expiresIn: '1hr' });
      res.send({token})
    })

    //users related api
    app.post('/users', async (req, res) => {
      const query = { email: req.body.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
       return res.send('existing user')
        
      }
      const result = await usersCollection.insertOne(req.body)
      res.send(result);
    })
    // users get
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })
    // users delete
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })
    // carts related api
    //carts post
    app.post('/carts', async (req, res) => {
      const result = await cartsCollection.insertOne(req.body);
      res.send(result);
    });
    //carts get
    app.get('/carts', async (req, res) => {
      const email = req?.query?.email;
      const query = { email: email };     
      const result = await cartsCollection.find(query).toArray();
      res.send(result)

    });


    // carts delete
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result)
    })

    app.get('/menus', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });


    app.get('/reviwes', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', async (req, res) => {
  res.send('running')
});

app.listen(port, () => {
  console.log(`running ${port}`);
})