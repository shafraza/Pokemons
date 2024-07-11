# Use the official Node.js 18 image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json separately to leverage Docker cache
COPY package*.json ./

# Install npm version 10.1.0 (if  needed)
RUN npm install -g npm@10.1.0

# Install dependencies based on package.json
RUN npm install

# Copy the entire project directory to the container
COPY . .

# Copy .env file to the container
COPY .env ./

# Expose the port on which the app will run (if necessary)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
