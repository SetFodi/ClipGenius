FROM node:20-slim

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source and build
COPY . .
RUN npm run build

# Run the worker
CMD ["node", "dist/index.js"]

