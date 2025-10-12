// src/routes/authRoutes.js
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple session tracking (in production, use proper session management)
const sessions = new Set();

// Login page route
export const getLoginPage = (req, res) => {
  try {
    const htmlContent = readFileSync(path.join(__dirname, '../pages/login.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error loading login page:', error);
    res.status(500).send('Error loading page');
  }
};

// Handle login form submission
export const postLogin = (req, res) => {
  const { email, password } = req.body;
  
  // Simple authentication check (in production, use proper authentication)
  if (email && password) {
    // Redirect back to homepage after successful login
    res.redirect("/");
  } else {
    // Redirect back to login with error (in production, show proper error)
    res.redirect("/login?error=1");
  }
};