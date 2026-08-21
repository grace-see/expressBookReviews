const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  let sameUsers = users.filter((user) => {
    return user.username === username;
  });

  if (sameUsers.length > 0)
    return false;
  else
    return true;
};

const authenticatedUser = (username,password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  if (validUsers.length > 0)
    return true;
  else
    return false;
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    console.log(req.session.id);
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(401).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.session.authorization.username;
  const review = req.query.review;
  const book = books[req.params.isbn];

  if (book) {
    console.log(review);
    let userReview = book.reviews[username];
    if (userReview) {
      userReview = review;
      res.send(`The review for the user ${username} has been updated.`);
    } else {
      book.reviews[username] = {
        "username": username,
        "review": review
      };
      res.send(`The review made by ${username} has been posted.`)
    }
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    const reviews = book.reviews[username];
    if (reviews) {
      delete book.reviews[username];
      
    } 
    return res.status(200).send(`The review made by ${username} has been deleted.`);
    
  } else {
    return res.status(404).json({ message: "Provided book does not exist"})
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
