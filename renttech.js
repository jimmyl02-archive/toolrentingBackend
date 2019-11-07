// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
const uuidv1   = require('uuid/v1');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});


var port = process.env.PORT || 8080;        // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://rentech:rentech1@ds013956.mlab.com:13956/rentech'); // connect to our database

const mongooseCon = mongoose.connection;
mongooseCon.on('error', console.error);
mongooseCon.once('open', function(){
    console.log("Connected to mongod server");
});

//mongoDb Definitions
const userSchema = mongoose.Schema({
    uuid: String,
    username: String,
    fName: String,
    lName: String,
	email: String,
    password: String,
    numSales: Number,
    buyerRating: Number,
	city: String
});

const user = mongoose.model('user', userSchema);

const itemSchema = mongoose.Schema({
    uuid: String,
    sellerUuid: String,
    buyerUuid: String,
    status: String,
    category: String,
    itemName: String,
    numItem: Number,
    price: Number,
    description: String,
    location: String
});

const item = mongoose.model('item', itemSchema);

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.post('/login', function(req, res) {
    const body = req.body;
    if(body.hasOwnProperty('username') && body.hasOwnProperty('password')){
        user.findOne({ username: body.username, password: body.password }, function (err, person) {
            if(err) return res.json({ message: 'false' });
            if(!person) return res.status(401).json({ message: 'false' });
            return res.json({ uuid: person.uuid });
        })
    }else{
        res.json({ message: 'false' }); 
    }  
});

router.post('/register', function(req, res) {
    const body = req.body;
    const newUser = new user({ 
                        uuid: uuidv1(),
                        username: body.username,
                        fName: body.fname,
                        lName: body.lname,
                        email: body.email,
                        password: body.password,
                        numSales: 0,
                        buyerRating: 5,
                        city: body.city
                        });
    newUser.save(function (err, user) {
        if(err) return res.json({ message: 'failure' });
        return res.status(200).json({ message: 'success' });
    })
})

router.post('/createItem', function(req, res) {
    const body = req.body;
    const newItem = new item({
                        uuid: uuidv1(),
                        sellerUuid: body.sellerUuid,
                        buyerUuid: '',
                        status: 'available',
                        category: body.category,
                        itemName: body.itemName,
                        numItem: body.numItem,
                        price: body.price,
                        description: body.description,
                        location: body.location
                        });
    newItem.save(function (err, item) {
        if(err) return res.status(402).json({ message: 'failure'});
        return res.status(200).json({ item });
    })   
})

router.get('/get', function(req, res) {
    item.find({}, function(err, item) {
        if(err) return res.json({ message: 'failure' });
        return res.status(200).json( item )
    })
})

router.get('/get/:sellerUuid', function(req, res) {
    item.find({ sellerUuid: req.params.sellerUuid }, function(err, item) {
        if(err) return res.json({ message: 'failure' });
        if(!item) return res.json({ message: 'failure' });
        return res.status(200).json( item )
    })
})

router.get('/getInfo/:uuid', function(req, res) {
    user.findOne({ uuid: req.params.uuid }, function(err, user) {
        if(err) return res.json({ message: 'failure' });
        if(!user) return res.json({ message: 'failure' });
        return res.status(200).json({ 'username': user.username, 'email': user.email, 'fname': user.fName });
    })
})

router.get('/removeListing/:uuid', function(req, res) {
    item.findOneAndRemove( { uuid: req.params.uuid }, function(err, item) {
        if(err) return res.json({ message: 'failure' });
        if(!item) return res.json({ message: 'failure' });
        return res.status(200).json({ item });
    })
})

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
