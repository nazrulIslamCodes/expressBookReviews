const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(books); // Return the JSON object directly
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author);

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title);

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book reviews
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

//============================================



async function getBooks() {
    try {
        const response = await axios.get('http://localhost:5000/');
        console.log('Books available:', response.data);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

getBooks();

//===========================================



async function getBookByISBN(isbn) {
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        console.log(`Book details for ISBN ${isbn}:`, response.data);
    } catch (error) {
        console.error(`Error fetching book details for ISBN ${isbn}:`, error);
    }
}

// Example usage
getBookByISBN('1'); // Replace '1' with the actual ISBN you want to test

//===================================



async function getBooksByAuthor(author) {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log(`Books by author ${author}:`, response.data);
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error);
    }
}

// Example usage
getBooksByAuthor('Jane Austen'); // Replace with the actual author name you want to test

//======================================



async function getBooksByTitle(title) {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log(`Books with title ${title}:`, response.data);
    } catch (error) {
        console.error(`Error fetching books with title ${title}:`, error);
    }
}

// Example usage
getBooksByTitle('Pride and Prejudice'); // Replace with the actual title you want to test

//==========================================

module.exports.general = public_users;
