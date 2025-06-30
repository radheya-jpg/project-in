const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database file path
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Helper function to read users
function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

// Helper function to write users
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const users = readUsers();
        
        // Check if user exists
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        writeUsers(users);
        
        // Create token
        const token = jwt.sign({ userId: newUser.id }, SECRET_KEY, { expiresIn: '1h' });
        
        res.status(201).json({ token, userId: newUser.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const users = readUsers();
        const user = users.find(user => user.email === email);
        
        // Check if user exists
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Create token
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        
        res.json({ token, userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected Example Endpoint
app.get('/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const users = readUsers();
        const user = users.find(u => u.id === decoded.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Don't send password back
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});