// src/routes/docsRoutes.js
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Documentation page (placeholder)
export const getDocsPage = (req, res) => {
  try {
    const htmlContent = readFileSync(path.join(__dirname, '../pages/docs.html'), 'utf8');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error loading docs page:', error);
    res.status(500).send('Error loading page');
  }
};