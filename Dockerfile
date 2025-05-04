# Multi-stage build for Little Alchemy app

# Stage 1: Build the React frontend
FROM node:23-alpine-slim AS frontend-builder
WORKDIR /app/frontend
COPY app/frontend/package.json app/frontend/package-lock.json* ./
RUN npm install
COPY app/frontend/ ./
RUN npm run build

# Stage 2: Build the Go backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app
COPY app/backend/go.mod app/backend/go.sum ./
RUN go mod download
COPY app/backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 3: Final lightweight image
FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates

# Copy built artifacts from previous stages
COPY --from=backend-builder /app/main ./
COPY --from=frontend-builder /app/frontend/dist ./frontend

# Set environment variables
ENV GIN_MODE=release

# Expose port
EXPOSE 8081

# Run the Go application
CMD ["./main"]