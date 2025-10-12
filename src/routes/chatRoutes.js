// src/routes/chatRoutes.js
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chat page (non-functional placeholder)
export const getChatPage = (req, res) => {
  try {
    const htmlContent = readFileSync(path.join(__dirname, '../pages/chat.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error loading chat page:', error);
    res.status(500).send('Error loading page');
  }
};