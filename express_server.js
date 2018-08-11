const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// const cookieParser = require("cookie-parser");
// app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['franklin', 'lighthouse', 'coffee'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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
    "aD5hty": "http://www.abc.net.au/"
  },
  "Ck4bMY": {
    "oku7Du": "https://tenplay.com.au/channel-ten/offspring"
  }
};

const userDatabase = {
  "BarN33": {
    id: "BarN33",
    email: "barney1@example.com",
    password: '$2b$10$jt0mrbvcFbapK2cf74sTguytELnf4U71MOywdAVJ/1q8/4qUncaUW',
    name: "Barney"
  },
  "D15h3r": {
    id: "D15h3r",
    email: "palmolive2@example.com",
    password: '$2b$10$OsxZen/W/BOLsxwnitABtu3EYlhHiYmc49BJdNAtpYV2KrUo1TTqC',
    name: "Squeaky"
  },
  "Ck4bMY": {
    id: 'Ck4bMY',
    email: 'guyshop@icloud.com',
    password: '$2b$10$secRBylSuUxNqgqJYq7K.uqnvo/1zPPoUkOTF.2jzJ.TQb4yoCxdC',
    name: 'Guy' }
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
    userDetails: userDatabase[req.session.user_id],
    "status": status,
    "message": message
  };
  res.status(status);
  res.render("pages/error-page", templateVars);
}

function urlsForUser(id) {
  let userURLS = urlDatabase[id];
  return userURLS;
}

// index page
app.get('/', function(req, res) {
  if (!userDatabase[req.session.user_id]) {
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
    };
    res.render('pages/index', templateVars);
  } else {
    res.redirect('/urls');
  }
});

// about page
app.get('/about', function(req, res) {
  let templateVars = {
    userDetails: userDatabase[req.session.user_id],
  };
  res.render('pages/about', templateVars);
});

// // URLS JSON Page
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// URLS index page
app.get("/urls", (req, res) => {
  if (!userDatabase[req.session.user_id]) {
    errorPage(req, res, 403, "You must be logged in to see this page");
  } else {
    let urlList = urlsForUser(req.session.user_id);
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
      userId: "user_id",
      urlDb: urlList
    };
    res.render("pages/urls_index", templateVars);
  }
});

// new URL page
app.get("/urls/new", (req, res) => {
  if (!userDatabase[req.session.user_id]) {
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
    };
    res.render('pages/index', templateVars);
  } else {
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
    };
    res.render("pages/urls_new", templateVars);
  }
});

// Login page
app.get('/login', function(req, res) {
  if (userDatabase[req.session.user_id]) {
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
    };
    res.redirect('/urls', templateVars);
  } else {
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
    };
    res.render('pages/login', templateVars);
  }
});

// single URL Id page
app.get("/urls/:id", (req, res) => {
  let currentUser = req.session.user_id;
  let urlId = req.params.id
  if (!currentUser || !urlDatabase[currentUser][urlId]) {
    errorPage(req, res, 403, "Forbidden Access!");
  } else {
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
      URLId: urlId,
      longURL: urlDatabase[currentUser][urlId]
    };
    res.render("pages/urls_show", templateVars);
  }
});

// Registration page
app.get("/register", (req, res) => {
  if (userDatabase[req.session.user_id]) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
    };
    res.render("pages/registration", templateVars);
  }
});


// Redirection
app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let longURL = "";
  for (var userId in urlDatabase) {
    console.log(urlDatabase[userId]);
    if (urlDatabase[userId][short]) {
      longURL = urlDatabase[userId][short];
      res.redirect(longURL);
      return;
    } else {
      errorPage(req, res, 404, "The TinyURL you have entered does not exist. Please check the TinyURL and try again.");
    }
  }
});

// Create new URLId and add to database
app.post("/urls", (req, res) => {
  let currentUser = req.session.user_id;
  let URLId = generateRandomString();
  let URL = req.body.longURL;
  urlDatabase[currentUser][URLId] = URL;
  res.redirect(`/urls/${URLId}`);
});

// Update LongURL
app.post("/urls/:id", (req, res) => {
  let currentUser = req.session.user_id;
  let urlId = req.params.id;
  if (!currentUser || !urlDatabase[currentUser][urlId]) {
    errorPage(req, res, 403, "Forbidden Access!");
  } else {
  urlDatabase[currentUser][req.params.id] = req.body.updateURL;
  res.redirect(`/urls`);
  }
});

// Delete URLId
app.post("/urls/:id/delete", (req, res) => {
  let currentUser = req.session.user_id;
  let urlId = req.params.id;
  if (!currentUser || !urlDatabase[currentUser][urlId]) {
    errorPage(req, res, 403, "Forbidden Access!");
  } else {
    delete urlDatabase[currentUser][req.params.id];
    res.redirect(`/urls`);
  }
});

// Existing User Login
app.post("/login", (req, res) => {
  let grantAccess = false;
  let currentUser = "";

  for (var ids in userDatabase) {
    if (req.body.email === userDatabase[ids].email && bcrypt.compareSync(req.body.password, userDatabase[ids].password)) {
      grantAccess = true;
      currentUser = userDatabase[ids]['id'];
    }
  }
  if (grantAccess) {
    req.session.user_id = currentUser;
    res.redirect(`/urls`);
  } else {
    errorPage(req, res, 403, "The password or username you entered were incorrect or do not exist.\nPlease try again!");
  }
});

// Username Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/`);
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

  if (exists) {
    errorPage(req, res, 400, "Make sure you enter a valid email and password. Please try again.");
  } else if (!req.body.email) {
    errorPage(req, res, 400, "Make sure you enter a valid email. Please try again.");
  } else if (!req.body.password) {
    errorPage(req, res, 400, "Make sure you enter a valid password. Please try again.");
  } else {
    var userId = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    userDatabase[userId] = {
      id: userId,
      email: req.body.email,
      password: hashedPassword,
      name: req.body.displayName
    };
    urlDatabase[userId] = {};
    req.session.user_id = userId;
    res.redirect(`/urls`);
  };
});


app.listen(PORT, () => {
  console.log(`Guy's TinyApp Server listening on port ${PORT}!`);
});