//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model("User", userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register", function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  bcrypt.hash(password, 10, function(err, hash){
    const user = new User({
      username: username,
      password: hash
    });
    user.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render("secrets");
      }
    });
  });
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({username:username},function(err, foundUser){
    if(err){
      res.render("error",{errorMessage: err});
    }else{
      if(foundUser){
        bcrypt.compare(password, foundUser.password, function(err, result){
          if(result === true){
            res.render("secrets");
          }else{
            res.render("error",{errorMessage:"Password is incorrect. Please try again."});
          }
        });
      }else{
        res.render("error",{errorMessage: "User not found. Please register first."});
      }
    }
  });
});


let port = process.env.PORT;
if(port == null){
    port = 3000;
}
app.listen(port, function(){
  console.log("Server is up and running on port: "+port);
});
