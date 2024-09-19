const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Write code to check if the username is valid
    return username && username.length > 0;
}

const authenticatedUser = (username, password) => {
    // Write code to check if username and password match the one we have in records.
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });

    // Save token in session
    req.session.token = token;

    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;  // Extract review from request body
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Check if the user has already reviewed this book
    if (books[isbn].reviews[username]) {
        books[isbn].reviews[username] = review;  // Modify existing review
        return res.status(200).json({ message: "Review updated successfully" });
    } else {
        books[isbn].reviews[username] = review;  // Add new review
        return res.status(201).json({ message: "Review added successfully" });
    }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for this book
    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];  // Remove the review
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
