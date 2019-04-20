const express = require('express');
const bodyParser = require('body-parser').json();
var app = express() // making new express obj 
const port = 3000 // select port number on which we want to run our application.

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = "Heros";
const { ObjectId } = require('mongodb');
const swaggerDocument = require('./config/swagger.json');
const swaggerUi = require('swagger-ui-express');

let insertDocs = require('./routes/insert');
let retrieveDocs = require('./routes/retrieve')
console.log(insertDocs);


app.use(bodyParser);

var allowDelete = function (req, res, next) {
    res.append('Access-Control-Allow-Methods', 'DELETE')
    next()
}

// ! Swagger UI will be generated
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true
    })
  );

app.use('/delete/:id', allowDelete);

client.connect().then(function () {
    console.log("connected to database successfully");
}).catch(function (err) {
    console.log(err);
})

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "PUT, GET, POST ,DELETE");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Header","Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods","PUT, GET, POST, PATCH, DELETE, OPTIONS");
    next();
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));



app.post('/herosdata', (req, res) => {

    res.send(req.body.superheros);
});


app.post('/insert', bodyParser, (req, res) => {
    herosObj = req.body;
    const db = client.db(dbName);
    console.log(herosObj);
    insertDocs.insert(db, client,res);
});


app.get('/display', bodyParser, (req, res) => {
    herosObj = req.body.superheros;
    //console.log(herosObj);
    const db = client.db(dbName);
    retrieveDocs.retrieve(db, res);
})

app.post('/update', bodyParser, (req, res) => {
    herosObj = req.body.superheros;
    const db = client.db(dbName);
    const collection = db.collection('superHeros');
    let myQuery = { $and: [{ fightsWon: { $gt: 10 } }, { superpowers: "Swim" }, { superpowers: "Fly" }] };
    let newValues = { $mul: { fanFollowing: 2 } };

    
    collection.updateMany(myQuery, newValues).then(() => {
        console.log("records updated");
    }).catch(function (err) {
        console.log(err);
    });
})

app.put('/update/:id', (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('superheros');
    console.log("hi");
    console.log(req.body);
    hero = req.body;
    myQuery = { _id: ObjectId(req.params.id) }
    newValues = { $set : {
        superHero: hero.superHero,
        heroHeight:hero.heroHeight,
        heroGender : hero.heroGender,
        canFly : hero.canFly,
        fanFollowing : hero.fanFollowing,
        superpowers : hero.superpowers,
        fightsWon : hero.fightsWon
    }} ;
    // //{$mul:{fanFollowing:2}};
    collection.updateOne(myQuery, newValues).then(() => {
        console.log("record updates")
        res.send("record updates");
    }).catch((err) => {
        console.log(err);
    })
})
app.get('/readOne/:id', (req, res, next) => {
    const db = client.db(dbName);

    const collection = db.collection('superHeros');
    collection.findOne({ "_id": ObjectId(req.params.id) }).then((result) => {
        console.log(result);
    }).catch(function (err) {
        console.log(err);
    });

    //next(); 
});

app.get('/readOne/head/one', (req, res, next) => {
    const db = client.db(dbName);

    const collection = db.collection('superHeros');
    const value = JSON.parse(req.headers['canfly']);
    console.log(value);
    collection.find({ canFly: value }).toArray().then((result) => {
        res.send(result);
    }).catch(function (err) {
        console.log(err);
    });

    //next(); 
});


app.get('/readOne/fly/:canFly', (req, res, next) => {
    console.log(req.params.canFly)
    const db = client.db(dbName);
    const collection = db.collection('superHeros');
    //console.log(req.params.canFly);
    myQuery = { canFly: { $eq: Boolean(req.params.canFly) } };
    collection.findOne(myQuery).then((result) => {
        console.log(result);
    }).catch(function (err) {
        console.log(err);
    });
})

app.delete('/delete/:id', (req, res) => {
    console.log("hi")
    const db = client.db(dbName);
    const collection = db.collection('superheros');

    collection.deleteOne({ "_id": ObjectId(req.params.id) }).then((result) => {
        res.send(result);
    }).catch((err) => console.log(err));
})



app.delete('/thanosSnaps', (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('superHeros');
    myQuery = { $where: 'this.superpowers.length <= 2' };

    collection.deleteMany(myQuery).then(() => {
        console.log("deleted docs");
    }).catch((err) => console.log(err));
})

app.get('/showHeroes/canFly', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('superHeros');
    try {
        await collection.find({ "superpowers": "Fly" }).toArray(async (err, obj) => {
            res.send(obj)
        })
    }
    catch (err) {
        throw err;
    }
});