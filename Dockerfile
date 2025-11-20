# Use an official Node.js image
FROM node:24-alpine3.21

# Set working directory
WORKDIR /app/load_manager

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the files
COPY . .

ARG LOAD_MANAGER_HOST
ARG LOAD_MANAGER_PORT
ARG ACTORS_PUB_SUB_HOST
ARG ACTORS_PUB_SUB_PORT
ARG ACTORS_CLIENT_SERVER_HOST
ARG ACTORS_CLIENT_SERVER_PORT

RUN echo "LOAD_MANAGER_HOST=${LOAD_MANAGER_HOST}" > .env \
  && echo "LOAD_MANAGER_PORT=${LOAD_MANAGER_PORT}" >> .env \
  && echo "ACTORS_PUB_SUB_HOST=${ACTORS_PUB_SUB_HOST}" >> .env \
  && echo "ACTORS_PUB_SUB_PORT=${ACTORS_PUB_SUB_PORT}" >> .env \
  && echo "ACTORS_CLIENT_SERVER_HOST=${ACTORS_CLIENT_SERVER_HOST}" >> .env \
  && echo "ACTORS_CLIENT_SERVER_PORT=${ACTORS_CLIENT_SERVER_PORT}" >> .env

# Esto hace que no sea un servicio, sino una app de docker
ENTRYPOINT ["node", "index.ts"]