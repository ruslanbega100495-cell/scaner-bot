FROM node:20-slim
 
WORKDIR /app
 
# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
 
# Install dependencies
COPY package*.json ./
RUN npm install
 
# Copy prisma schema
COPY prisma ./prisma/
RUN npx prisma generate
 
# Copy source code
COPY . .
 
# Build
RUN npm run build || true
 
# Expose port
EXPOSE 3000
 
# Start
CMD ["node", "dist/index.js"]
 