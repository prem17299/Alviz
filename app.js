//jshint esversion:6
require('dotenv').config();// to load environment variables 
const express = require("express");
const bodyParser = require("body-parser"); //to parse the form values coming from register and login page to validate and store
const ejs = require("ejs"); // viewing engine
const mongoose = require("mongoose"); //npm module to connect node to mongoDB
const session = require('express-session'); //for maintaining user sessions and cookies
const passport = require("passport"); //authentication
const passportLocalMongoose = require("passport-local-mongoose"); //Compulsory when using passport and mongoose
// const GoogleStrategy = require('passport-google-oauth20').Strategy;//delete this for OAuth
// const findOrCreate = require('mongoose-findorcreate');//delete this for OAuth

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "ALVIZ App",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); //passport.js is maintaining session

mongoose.connect("mongodb+srv://admin-devesh:Test123@cluster0.bjahc.mongodb.net/userDB", {useNewUrlParser: true,
   useUnifiedTopology: true,
   useCreateIndex: true,
   useFindAndModify: false});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  // googleId: String,
  // secret: String
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

//To maintain session
passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// passport.use(new GoogleStrategy({                 //delete this for OAuth
//
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/secrets",             // problem is here guarantee do your own google oAuth and change CLIENT_ID in .env file
//
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     console.log(profile);
//
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

app.get("/", function(req, res){
  res.render("home");
});

// app.get("/auth/google",
//   passport.authenticate('google', { scope: ["profile"] })
// );

// app.get("/auth/google/secrets",
//   passport.authenticate('google', { failureRedirect: "/login" }),
//   function(req, res) {
//     // Successful authentication, redirect to secrets.
//     res.redirect("/secrets");
//   });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){

  User.find({"secret": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
});

app.get("/quicksort", function(req, res){
    res.render("quicksort");
});

app.get("/prims", function(req, res){
    res.render("prims");
});

app.get("/bubblesort", function(req, res){
    res.render("bubblesort");
});

app.get("/dfs", function(req, res){
    res.render("dfs");
});

app.get("/binarytree", function(req, res){
    res.render("binarytree");
});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});




// let port = process.env.PORT;
// if(port == null || port = ""){
//   port = 3000;
// }


app.listen((process.env.PORT || 3000) , function() {
  console.log("Server has started successfully.");
});
