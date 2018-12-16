const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const Data = require("./data");

const API_PORT = 3001;
const app = express();
const router = express.Router();
const axios = require('axios')

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger("dev"));

// This is the client ID and client secret that you obtained
// while registering the application
const clientID = '8a1687848313cff592cf';
const clientSecret = '34259d810318d55ade44a8518609efb0afdc6388';
app.get('/oauth/redirect', (req, res, next) => {
  // The req.query object has the query params that
  // were sent to this route. We want the `code` param
  const requestToken = req.query.code
  
  axios({
    // make a POST request
    method: 'post',
    // to the Github authentication API, with the client ID, client secret and request token
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSOn
    headers: {
      accept: 'application/json'
    }
  }).then((response) => {
    // Once we get the response, extract the access token from the response body
    const accessToken = response.data.access_token

    return axios.get('https://api.github.com/user', { headers: {
        'User-Agent': 'File Edit APP',
        Authorization: `token ${accessToken}`
    }})

  })
  .then((response) => {

    res.cookie('user', response.data.node_id);
    res.redirect(`http://localhost:3000/?access_token=${response.data.node_id}`)
  })
  .catch(next)
});


// This is our MongoDB database
const dbRoute = "mongodb://CCCT:testuser1@ds137100.mlab.com:37100/fileeditordb";

// connects our back end code with the database
mongoose.connect(
    dbRoute,
    { useNewUrlParser: true }
);

const db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));


function auth(req, res, next) {

    if(!req.cookies.user)
        return res.status(403).send('Login required');

    return next();

}

// Get method
router.get("/getData", auth, (req, res) => {

    Data.find({ user: req.cookies.user }, (err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data });
    });
});

// Create method
router.post("/putData", auth, (req, res) => {
    const data = new Data();

    const { id, name, content, starred } = req.body;

    // Data
    data.id = id;
    data.name = name;
    data.content = content;
    data.starred = starred;
    data.user = req.cookies.user;

    data.save(err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});

// Update method
router.post("/updateData", auth, (req, res) => {
    const { id, update } = req.body;

    Data.findOneAndUpdate({ id }, update, err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});

// Delete method
router.delete("/deleteData", auth, (req, res) => {
    const { id } = req.body;
    Data.findOneAndDelete(id, err => {
        if (err) return res.send(err);
        return res.json({ success: true });
    });
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`Listening port ${API_PORT}`));
