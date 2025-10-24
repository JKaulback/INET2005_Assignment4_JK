// Import required modules
const express = require('express');           // Web framework for Node.js
const bodyParser = require('body-parser');    // Middleware to parse request bodies
const dotenv = require('dotenv');             // Loads environment variables from a .env file
const axios = require('axios');               // HTTP client for making API requests
const cors = require('cors');                 // Middleware to enable Cross-Origin Resource Sharing
const path = require('path');                 // Utility for handling file and directory paths

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Define the port the server will listen on
const port = 3001;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set the directory where EJS templates are located
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory, if any

// Route for the homepage
app.get('/', (req, res) => {
    let msg = "Welcome"; // Message to pass to the EJS template
    res.render('index', { message: msg }); // Render 'index.ejs' with the message
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});