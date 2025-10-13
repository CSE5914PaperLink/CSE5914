# Use a small Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package files first to cache dependencies
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Cloud Run provides PORT env var; Express will use it automatically
ENV PORT=8080
EXPOSE 8080

# Start the Express server
CMD ["npm", "start"]
