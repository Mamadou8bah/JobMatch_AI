FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates

COPY package*.json ./
RUN npm ci

COPY . .

# generate Prisma client inside container
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]