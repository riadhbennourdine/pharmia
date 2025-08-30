# Use the official Node.js 18 image as the base image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you use it) to the working directory
# This allows npm to install dependencies before copying the rest of the application code
COPY package.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port your application listens on (default for Express is 3000, but Cloud Run uses PORT env var)
# Cloud Run automatically sets the PORT environment variable. Your app should listen on process.env.PORT.
EXPOSE 8080

# Define the command to run your application
# Assuming your main server file is server.js in the /app directory
CMD ["node", "server.js"]