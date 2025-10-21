FROM node:18-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:18-slim

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app .

EXPOSE 3000

CMD [ "npm", "start" ]
