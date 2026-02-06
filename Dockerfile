# syntax=docker/dockerfile:1

# ===========================================
# Stage 1: Build the Vite React application
# ===========================================
FROM node:20-alpine AS builder

# Install git and git-lfs for LFS file hydration
RUN apk add --no-cache git git-lfs

WORKDIR /app

# Copy the entire repository (needs .git for LFS)
COPY . .

# Hydrate LFS files (graphics, maps, etc.)
RUN git lfs install && git lfs pull

# Resolve symlinks by copying actual directories
# (Docker can't follow symlinks that point outside the context)
RUN rm -f web-app/public/maps web-app/public/quests && \
    cp -r maps web-app/public/maps && \
    cp -r quests web-app/public/quests

# Build the web application
WORKDIR /app/web-app
RUN npm ci && npm run build

# ===========================================
# Stage 2: Serve with Nginx
# ===========================================
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/web-app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
