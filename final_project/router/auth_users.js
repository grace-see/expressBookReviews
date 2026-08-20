const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  //write code to check is the username is valid
  let sameUsers = users.filter((user) => {
    return user.username === username;
  });

  if (sameUsers.length > 0)
    return false;
  else
    return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  if (validUsers.length > 0)
    return true;
  else
    return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }
  
  if (authenticatedUser(username, password)) {
    //Generate JWT token for session
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60*60 });
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const review = req.body.review;
  const book = books.get(req.params.isbn);

  if (username) {
    let userReview = book.reviews[username];
    if (userReview) {
      book.reviews[username] = review;
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
  const username = req.body.username;
  const isbn = req.params.isbn;

  if (username) {
    books.filter((review) => {
      return review.username !== username;
    });
  }
  
  res.send(`The review made by ${username} has been deleted.`);
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
