const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set('view engine', 'ejs'); // set the view engine to ejs

const urlDatabase = {
  "BarN33": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "mnB4tu": "https://www.payphone-project.com/",
    "9sD5xK": "http://www.google.com",
    "kjhB58": " http://www.museumoffailure.se/"
  },
  "D15h3r": {
    "gyh7Dj": "http://www.australiantelevision.net/",
    "oku7Du": "https://tenplay.com.au/channel-ten/offspring",
    "aD5hty": "http://www.abc.net.au/"
  }
};

const userDatabase = {
  "BarN33": {
    id: "BarN33",
    email: "barney1@example.com",
    password: "purple-dinosaur",
    name: "Barney"
  },
 "D15h3r": {
    id: "D15h3r",
    email: "palmolive2@example.com",
    password: "dishwasher-funk",
    name: "Squeaky"
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
  if (!userDatabase[req.cookies["user_id"]]) {
    errorPage(req, res, 404, "Forbidden Access!");
  } else {
    let templateVars = {
      userDetails: userDatabase[req.cookies["user_id"]],
      userId: "user_id",
      urlDb: urlDatabase};
    res.render("pages/urls_index", templateVars);
  }
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
  let currentUser = req.cookies["user_id"];
  let input = req.params.id
  if (!currentUser || !urlDatabase[currentUser][input]) {
    errorPage(req, res, 404, "Forbidden Access!");
  } else {
    let templateVars = {
      userDetails: userDatabase[req.cookies["user_id"]],
      URLId: input,
      longURL: urlDatabase[currentUser][input]
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
  let shortURL = req.params.shortURL
  let longURL = "";
  for (var ids in urlDatabase) {
    if (shortURL === urlDatabase[ids] {
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

  if (longURL === false) {
    errorPage(req, res, 404, "That TinyURL does not exist.");
  } else {
    res.redirect(longURL);
  }
  errorPage(req, res, 404, "Forbidden Access!");
});



// Create new URLId and add to database
app.post("/urls", (req, res) => {
  let currentUser = req.cookies["user_id"];
  let URLId = generateRandomString();
  let URL = req.body.longURL;
  urlDatabase[currentUser][URLId] = URL;
  res.redirect(`http://localhost:8080/urls/${URLId}`);
});

// Update LongURL
app.post("/urls/:id", (req, res) => {
  let currentUser = req.cookies["user_id"];
  urlDatabase[currentUser][req.params.id] = req.body.updateURL;
  res.redirect(`http://localhost:8080/urls`);
});

// Delete URLId
app.post("/urls/:id/delete", (req, res) => {
  let currentUser = req.cookies["user_id"];
  let input = req.params.id
  if (!currentUser || !urlDatabase[currentUser][input]) {
    errorPage(req, res, 404, "Forbidden Access!");
  } else {
    delete urlDatabase[currentUser][req.params.id];
    res.redirect(`http://localhost:8080/urls`);
  }
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
  res.redirect(`http://localhost:8080/`);
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
      password: req.body.password,
      name: req.body.displayName
    };
    res.cookie('user_id', userId);
    console.log(userDatabase);
    res.redirect(`http://localhost:8080/urls`);
  };
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});