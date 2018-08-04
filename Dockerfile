FROM node:8.11.3
EXPOSE 8080

# Setup app dir
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json /usr/src/
RUN npm install
COPY . /usr/src/app

CMD ["npm", "start"]
