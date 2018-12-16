FROM node:11
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3005
EXPOSE 27017

CMD ["node","app.js"]