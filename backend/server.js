// Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// --- 1. CONFIGURATION AND MIDDLEWARE ---

// Middleware to parse JSON requests
app.use(express.json());

// Load required environment variables
const MONGO_USER = process.env.MONGO_ASIF_USERNAME;
const MONGO_PASS = process.env.MONGO_ASIF_PASSWORD;
const DB_URL = process.env.DB_URL;

if (!MONGO_USER || !MONGO_PASS || !DB_URL) {
    console.error("FATAL ERROR: MongoDB credentials (MONGO_ASIF_USERNAME, MONGO_ASIF_PASSWORD, DB_URL) must be set in the .env file.");
    process.exit(1);
}

// Construct the MongoDB URI
// The standard format is: mongodb://user:pass@host:port/databaseName
const mongoUri = `mongodb://${MONGO_USER}:${MONGO_PASS}@${DB_URL}/simpleAuthDB?authSource=admin`;

// --- 2. MONGOOSE CONNECTION ---

async function connectDB() {
    try {
        await mongoose.connect(mongoUri, {
            // These options are often included for modern Mongoose connections
        });
        console.log('✅ Connected successfully to MongoDB.');
    } catch (error) {
        console.error('❌ Could not connect to MongoDB:', error.message);
        // Exit process on connection failure
        process.exit(1); 
    }
}

connectDB();

// --- 3. MONGOOSE USER MODEL ---

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', UserSchema);

// --- 4. ROUTES ---

/**
 * POST /register
 * Registers a new user.
 * Body: { "username": "...", "password": "..." }
 */
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        // Hash the password before saving it
        // 10 is the salt rounds (a cost factor that determines how much time is needed to calculate a single bcrypt hash)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            username: username,
            password: hashedPassword
        });

        await newUser.save();
        
        console.log(`New user registered: ${username}`);
        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'An internal error occurred during registration.' });
    }
});

/**
 * POST /login
 * Authenticates a user.
 * Body: { "username": "...", "password": "..." }
 */
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            // Use a generic error for security (prevents user enumeration)
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log(`User logged in: ${username}`);
            // In a real application, you would generate a JWT token here
            res.status(200).json({ message: 'Login successful!', user: { username: user.username } });
        } else {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An internal error occurred during login.' });
    }
});

// --- 5. START SERVER ---

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});