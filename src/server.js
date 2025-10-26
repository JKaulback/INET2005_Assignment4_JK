// --- IMPORTS ---
const express = require('express');           // Web framework for Node.js
const session = require('express-session');
const bodyParser = require('body-parser');    // Middleware to parse request bodies
const dotenv = require('dotenv');             // Loads environment variables from a .env file
const axios = require('axios');               // HTTP client for making API requests
const cors = require('cors');                 // Middleware to enable Cross-Origin Resource Sharing
const path = require('path');                 // Utility for handling file and directory paths

// --- CONFIG ---
dotenv.config();

// --- CONSTANTS ---
const app = express();
const port = process.env.PORT || 3000;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MAX_ANSWER_CHARACTERS = 70;
const SYSTEM_PROMPT_CONTENT = "You are an expert trivia question generator with deep knowledge across all topics. " +
    "Generate a factually accurate trivia question with four possible answers. " +
    "CRITICAL: Ensure your facts are 100% correct before responding. " +
    "Only ONE answer should be correct, and the other three should be plausible but incorrect. " +
    "Respond in the following JSON format: " +
    '{ "trivia_question": "", ' +
    ' "trivia_answers": [' +
    ' { "content": "", "is_correct": true },' +
    ' { "content": "", "is_correct": false },' +
    ' { "content": "", "is_correct": false },' +
    ' { "content": "", "is_correct": false }' +
    ']} \n\n' +
    "REQUIREMENTS:\n" +
    "- Each answer must be under " + MAX_ANSWER_CHARACTERS + " characters\n" +
    "- All answers must be unique\n" +
    "- The correct answer must be factually accurate\n" +
    "- Wrong answers should be plausible but clearly incorrect\n" +
    "- Double-check your facts before responding";
const MODEL = "gpt-3.5-turbo";
const SYSTEM_PROMPT = { role: "system", content: SYSTEM_PROMPT_CONTENT };
const HEADERS = {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json" 
};

// --- EJS VIEWS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- MIDDLEWARE ---
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory, if any
app.use(session({
    secret: 'b7f3c9e2d1a4f8c6e3a9d7b2a1c5e6f9',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

// FUNCTIONS
// Fisher-Yates shuffle algorithm to randomize array order
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

async function queryTriviaBot(messages) {
    try {
        const response = await axios.post(
            OPENAI_URL,
            {
                model: MODEL,
                messages: messages
            },
            {
                headers: HEADERS
            }
        );

        return response.data.choices[0].message.content;

    } catch(err) {
        console.error(err);
        return err;
    }
}

function initializeSessionBundle(req) {
    if (!req.session.bundle) {
        req.session.bundle = {
            messages: [SYSTEM_PROMPT],
            player_score: 0,
            is_revealed: false,
            answer_correct: false
        };
    }
}


// --- ROUTES ---
app.get('/', (req, res) => {
    // If a session exists, clear it
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.log('Error destroying session:', err);
            } else {
                console.log('Session destroyed successfully');
            }
        });
    }

    res.render('index'); // Render 'index.ejs' with the message
    console.log("Landing page");
});

app.get('/trivia-game', async (req, res) => {
    // Initialize default values
    initializeSessionBundle(req);
    req.session.bundle.is_revealed = false;

    // Get a new trivia question w/ answers
    let triviaJSON = await queryTriviaBot(req.session.bundle.messages);
    req.session.bundle.messages.push( { role: "assistant", content: triviaJSON } );

    console.log("trivia JSON:", triviaJSON);
    
    // Parse the JSON string into an object
    let trivia_data;
    try {
        trivia_data = JSON.parse(triviaJSON);
    } catch (error) {
        console.error("Error parsing trivia JSON:", error);
        trivia_data = {
            trivia_question: "Error loading question",
            trivia_answers: [
                { content: "Error", is_correct: false },
                { content: "Error", is_correct: false },
                { content: "Error", is_correct: false },
                { content: "Error", is_correct: true }
            ]
        };
    }

    req.session.bundle.trivia_question = trivia_data.trivia_question;
    
    // Shuffle the answers to randomize their order
    req.session.bundle.trivia_answers = shuffleArray(trivia_data.trivia_answers);
    
    console.log("Messages array size:", req.session.bundle.messages.length);

    res.render('trivia-game', req.session.bundle);
});

app.get('/submit-answer', (req, res) => {
    // Initialize bundle if it doesn't exist
    initializeSessionBundle(req);
    
    req.session.bundle.answer_correct = req.query.is_correct === 'true';

    if (req.session.bundle.answer_correct) {
        req.session.bundle.player_score += 1;
    }

    req.session.bundle.is_revealed = true;

    res.render('trivia-game', req.session.bundle);
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});