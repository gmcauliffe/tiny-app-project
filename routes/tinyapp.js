const express = require("express");
const tinyappRouter = new express.Router();

const urlDatabase = require("../data-files/url-database");
const userDatabase = require("../data-files/user-database");


//Functions
function generateRandomString() {
  let text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
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

function addURL(currentUser, id, URL) {
  urlDatabase[currentUser][id] = URL;
}

function loginVerification(email, password) {
  for (var ids in userDatabase) {
    if (email === userDatabase[ids].email && bcrypt.compareSync(password, userDatabase[ids].password)) {
      return userDatabase[ids].id;
    }
  }
}

function ownershipVerification(userId, urlId) {
  if (!userId || !urlDatabase[userId][urlId]) {
    return false;
  } else {
  return true;
  }
}

function addNewUser(password, email, displayName) {
  var userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  userDatabase[userId] = {
    "id": userId,
    "email": email,
    "password": hashedPassword,
    "name": displayName
  };
  urlDatabase[userId] = {};
  return userId;
}

function existingUser() {

}


//Router
tinyappRouter
  // index page
  .get('/', (req, res) => {
    if (!userDatabase[req.session.user_id]) {
      let templateVars = {
        userDetails: userDatabase[req.session.user_id],
      };
      res.render("pages/index", templateVars);
    } else {
      res.redirect("/urls");
    }
  })
  // about page
  .get("/about", function(req, res) {
    let templateVars = {
      userDetails: userDatabase[req.session.user_id],
    };
    res.render("pages/about", templateVars);
  })
  // URLS index page
  .get("/urls", (req, res) => {
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
  })
  // Create new URLId and add to database
  .post("/urls", (req, res) => {
    let URLId = generateRandomString();
    addURL(req.session.user_id, URLId, req.body.longURL);
    res.redirect(`/urls/${URLId}`);
  })
  // new URL page
  .get("/urls/new", (req, res) => {
    if (!userDatabase[req.session.user_id]) {
      let templateVars = {
        userDetails: userDatabase[req.session.user_id],
      };
      res.render("pages/index", templateVars);
    } else {
      let templateVars = {
        userDetails: userDatabase[req.session.user_id],
      };
      res.render("pages/urls_new", templateVars);
    }
  })
  // Login page
  .get("/login", function(req, res) {
    if (userDatabase[req.session.user_id]) {
      let templateVars = {
        userDetails: userDatabase[req.session.user_id],
      };
      res.redirect("/urls", templateVars);
    } else {
      let templateVars = {
        userDetails: userDatabase[req.session.user_id],
      };
      res.render("pages/login", templateVars);
    }
  })
  // Existing User Login
  .post("/login", (req, res) => {
    let access = loginVerification(req.body.email, req.body.password);
    if (access) {
      req.session.user_id = access;
      res.redirect("/urls");
    } else {
      errorPage(req, res, 403, "The password or username you entered were incorrect or do not exist.\nPlease try again!");
    }
  })
  // single URL Id page
  .get("/urls/:id", (req, res) => {
    let currentUser = req.session.user_id;
    let urlId = req.params.id;
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
  })
  // Update LongURL
  .post("/urls/:id", (req, res) => {
    let owner = ownershipVerification(req.session.user_id, req.params.id);
    if (!owner) {
      errorPage(req, res, 403, "Forbidden Access!");
    } else {
      urlDatabase[req.session.user_id][req.params.id] = req.body.updateURL;
      res.redirect("/urls");
    }
  })
  // Registration page
  .get("/register", (req, res) => {
    if (userDatabase[req.session.user_id]) {
      res.redirect("/urls");
    } else {
      let templateVars = {
        userDetails: userDatabase[req.session.user_id],
      };
      res.render("pages/registration", templateVars);
    }
  })
  // New User Registration
  .post("/register", (req, res) => {
    let user = false;
    for (var userIds in userDatabase) {
      if (req.body.email === userDatabase[userIds].email) {
        exists = true;
        return;
      }
    }
    if (exists) {
      errorPage(req, res, 400, "Make sure you enter a valid email and password. Please try again.");
    } else if (!req.body.email) {
      errorPage(req, res, 400, "Make sure you enter a valid email. Please try again.");
    } else if (!req.body.password) {
      errorPage(req, res, 400, "Make sure you enter a valid password. Please try again.");
    } else {
      let userId = addNewUser (req.body.password, req.body.email, req.body.displayName);
      req.session.user_id = userId;
      res.redirect("/urls");
    };
  });




module.exports = tinyappRouter;