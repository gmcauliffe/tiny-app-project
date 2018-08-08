const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs'); // set the view engine to ejs

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
//  PostRequest: req.body.longURL
};

function generateRandomString() {
  let text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  };
  return text;
}


// index page
app.get('/', function(req, res) {
    res.render('pages/index');    // use res.render to load up an ejs view file
});

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// URLS index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  res.render("pages/urls_index", templateVars);
});

// new URL page
app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new");
});

// single URL Id page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    URLId: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("pages/urls_show", templateVars);
});

// POST route
app.post("/urls", (req, res) => {
  let URLId = generateRandomString();
  let URL = req.body.longURL;
  urlDatabase[URLId][URL];
  res.redirect(`http://localhost:8080/urls/${URLId}`);         // Respond with 'Ok' (we will replace this)
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});