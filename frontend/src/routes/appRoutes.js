// src/routes/appRoutes.js
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App/Dashboard page with integrated chat
export const getAppPage = (req, res) => {
  try {
    const htmlContent = readFileSync(path.join(__dirname, '../pages/app.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error loading app page:', error);
    res.status(500).send('Error loading page');
  }
};