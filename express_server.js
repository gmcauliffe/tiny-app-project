const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set('view engine', 'ejs'); // set the view engine to ejs

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "barney1@example.com",
    password: "purple-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "palmolive2@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  let text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  };
  return text;
}

function errorPage(req, res, status, message) {
    let templateVars = {
    userDetails: userDatabase[req.cookies["user_id"]],
    "status": status,
    "message": message
    };
    res.render("pages/error-page", templateVars);
}

// index page
app.get('/', function(req, res) {
  let templateVars = {
    userDetails: userDatabase[req.cookies["user_id"]],
  };
  res.render('pages/index', templateVars);    // use res.render to load up an ejs view file
});

// about page
app.get('/about', function(req, res) {
  let templateVars = {
    userDetails: userDatabase[req.cookies["user_id"]],
  };
  res.render('pages/about', templateVars);
});

// URLS JSON Page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// URLS index page
app.get("/urls", (req, res) => {
  let templateVars = {
    userDetails: userDatabase[req.cookies["user_id"]],
    urls: urlDatabase};
  res.render("pages/urls_index", templateVars);
});

// new URL page
app.get("/urls/new", (req, res) => {
  if (!userDatabase[req.cookies["user_id"]]) {
    errorPage(req, res, 404, "Forbidden Access!");
  } else {
    let templateVars = {
      userDetails: userDatabase[req.cookies["user_id"]],
    };
    res.render("pages/urls_new", templateVars);
  };
});

// Login page
app.get('/login', function(req, res) {
  let templateVars = {
    userDetails: userDatabase[req.cookies["user_id"]],
  };
  res.render('pages/login', templateVars);
});

// single URL Id page
app.get("/urls/:id", (req, res) => {
  let input = req.params.id
  if (!urlDatabase.hasOwnProperty(input)) {
    errorPage(req, res, 404, "That TinyURL does not exist.");
  } else {
    let templateVars = {
      userDetails: userDatabase[req.cookies["user_id"]],
      URLId: input,
      longURL: urlDatabase[req.params.id]
    };
    res.render("pages/urls_show", templateVars);
  }
});

// Registration page
app.get("/register", (req, res) => {
  let templateVars = {
    userDetails: userDatabase[req.cookies["user_id"]],
  };
  res.render("pages/registration", templateVars);
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

// Existing User Login
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let grantAccess = false;
  let currentUser = "";
  for (var ids in userDatabase) {
    if (email === userDatabase[ids].email && password === userDatabase[ids].password) {
      grantAccess = true;
      currentUser = userDatabase[ids]['id'];
    }
  };
  if (grantAccess) {
    res.cookie('user_id', currentUser);
    res.redirect(`http://localhost:8080/urls`);
  } else {
    errorPage(req, res, 404, "Forbidden Access!");
  };
});

// Username Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`http://localhost:8080/urls`);
});

// New User Registration
app.post("/register", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;
  let exists = false;

  for (var userIds in userDatabase) {
    if (email === userDatabase[userIds].email) {
      exists = true;
    }
  };

  if (exists || !req.body.email || !req.body.password) {
    errorPage(req, res, 404, "Make sure you enter a valid email and password. Please try again.");
  } else {
    var userId = generateRandomString();
    userDatabase[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userId);
    res.redirect(`http://localhost:8080/urls`);
  };
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});