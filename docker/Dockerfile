# Build binary
FROM node:14.17.2
ENV NODE_OPTIONS=""
WORKDIR /usr/src/FTX-bot

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80

CMD [ "node", "app.js" ]
