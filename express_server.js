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

// URLS JSON Page
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

// Redirection
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Create new URLId and add to database
app.post("/urls", (req, res) => {
  let URLId = generateRandomString();
  let URL = req.body.longURL;
  urlDatabase[URLId] = URL;
  res.redirect(`http://localhost:8080/urls/${URLId}`);
});

// Update LongURL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updateURL;
  res.redirect(`http://localhost:8080/urls`);
});

// Delete URLId
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`http://localhost:8080/urls`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});