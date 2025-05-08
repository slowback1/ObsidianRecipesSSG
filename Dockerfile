# Build stage
FROM node:18-alpine as builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Copy input recipes
COPY recipes/ ./recipes/

# Build the static site
RUN node src/index.js ./recipes ./output

# Serve stage
FROM nginx:alpine

# Copy the built static site from builder stage
COPY --from=builder /app/output /usr/share/nginx/html

# Copy custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 