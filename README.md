# CSE5914
AU25 CSE5914 Team1

## CS Paper Compare

### Overview

CS Paper Compare is a web application for searching, importing, managing, and comparing computer science research papers. The platform integrates with external sources like arXiv and OpenAlex, and provides an interactive dashboard, chat interface, and AI-powered analysis tools to help researchers explore and compare papers efficiently.

### Features

- **Paper Discovery**
    - Search and discover research papers from arXiv and OpenAlex directly within the app.
- **Paper Management**
    - Import, organize, and manage your collection of research papers in a personal dashboard.
- **AI-Powered Chat & Analysis**
    - Use an interactive chat interface to ask questions, compare papers, and get insights using AI (RAG-based Q&A coming soon).
- **Code Integration**
    - Link papers to their GitHub repositories for code analysis and exploration.
- **Responsive UI**
    - Modern, mobile-friendly interface built with Tailwind CSS for seamless use on any device.

### Running

#### Initial Setup
```bash
git clone https://github.com/jeevanadella/CSE5914.git

npm install
```

#### Deploying Locally
```bash
lsof -ti:3000 | xargs -r kill -9 && npm start
```
Then open [http://localhost:3000](http://localhost:3000) in your browser (additional commands included to list process IDs using port 3000, force killing existing processes, and starting the server all at once in case of port congestion).