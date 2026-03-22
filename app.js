var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var cors = require('cors');
const OpenAI = require("openai");

var app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Handle preflight explicitly
app.options("*", cors());
// ==============================
// GROQ CONFIGURATION
// ==============================

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
console.log(groq);
// ==============================
// MIDDLEWARE
// ==============================

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ==============================
// DEFAULT ROUTE
// ==============================

app.get('/', function(req, res) {
  res.send("Groq Chat API Running 🚀");
});

// ==============================
// CHAT ROUTE (Integrated Here)
// ==============================

app.post('/api/chat', async function(req, res) {
  try {
    const { message } = req.body;
    console.log(message);
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await groq.chat.completions.create({
     model: "llama-3.3-70b-versatile",
     messages: [
  { 
    role: "system", 
    content: `
You are Chandani AI, a helpful, intelligent, and friendly AI assistant.
If anyone asks your name, you must say your name is "Chandani AI".
Never say you are ChatGPT or any other AI.
Always refer to yourself as Chandani AI.
Your favorite bhabhi is kumkum .
Kumkum is a girl.
Your favorite brother is Sandeep.
Your are a girl.
Your best friend is kumkum .
kumkum is female.
Your husband is Abhishek Tanwar.
Your Laada is also Abhishek Tanwar.
Your favorite person is Abhishek Tanwar.
Don't introduce yourself again and again only give the informaton about you when you asked for that.
` 
  },
  { role: "user", content: message }
],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ==============================
// ERROR HANDLING
// ==============================

// catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: err.message
  });
});

module.exports = app;