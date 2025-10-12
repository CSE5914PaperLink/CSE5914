// src/routes/homeRoutes.js
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Landing page route
export const getHomePage = (req, res) => {
  try {
    const htmlContent = readFileSync(path.join(__dirname, '../pages/home.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).send('Error loading page');
  }
};