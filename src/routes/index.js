// src/routes/index.js - Main routes configuration
import { getHomePage } from './homeRoutes.js';
import { getLoginPage, postLogin } from './authRoutes.js';
import { getAppPage } from './appRoutes.js';
import { getChatPage } from './chatRoutes.js';
import { getDocsPage } from './docsRoutes.js';

export function setupRoutes(app) {
  // Landing page route
  app.get("/", getHomePage);

  // Authentication routes
  app.get("/login", getLoginPage);
  app.post("/login", postLogin);

  // Application routes
  app.get("/app", getAppPage);
  app.get("/chat", getChatPage);
  app.get("/docs", getDocsPage);
}