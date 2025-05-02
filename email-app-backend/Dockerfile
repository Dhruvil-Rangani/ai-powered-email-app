# email-app-backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# ✅ Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
