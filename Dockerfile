# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build TypeScript (if needed)
RUN npm run build || echo "No build step"

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"] 