# Use an official Node.js image
FROM node:24-alpine3.21

# Set working directory
WORKDIR /app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the project files
COPY . .

# Expose the port your app runs on
ARG LOAD_MANAGER_PORT=3000
ENV LOAD_MANAGER_PORT=$LOAD_MANAGER_PORT

# Expone ese puerto
EXPOSE $LOAD_MANAGER_PORT

# Start the app
CMD ["npm", "start"]
