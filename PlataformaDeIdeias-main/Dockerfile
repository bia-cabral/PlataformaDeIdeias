FROM node:22-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

FROM node:22-slim

WORKDIR /usr/src/app

# Copy node_modules from build stage
COPY --from=build /usr/src/app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy application code
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
