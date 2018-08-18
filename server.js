const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["franklin", "lighthouse", "coffee"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs"); // set the view engine to ejs

app.get("/", (req, res) => {
  res.redirect("/tinyapp");
});

const tinyappRouter = require("./routes/tinyapp");
app.use("/tinyapp", tinyappRouter);


app.listen(PORT, () => {
  console.log(`Guy's TinyApp Server listening on port ${PORT}!`);
});