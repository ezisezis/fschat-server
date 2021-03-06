# fschat-server
A chat application that consists of 2 parts:
 - Backend server based on socket.io (this repo);
 - React-based frontend [fschat-app](https://github.com/ezisezis/fschat-app)

It also uses [prettier](https://prettier.io/) for code formatting and is set up to run in docker. 
### Installation

First of all, you will need a running node install, preferably [v8.11.3](https://nodejs.org/en/). Once you have that, install the necessary modules with yarn:
```
yarn install
```
or with npm: 
```
npm install
```
To run the server, just do:
```
yarn start
```
Or if you want to run it in docker instead, do:
```
yarn docker
```
There is also a configuration file where you can change the server port, logging settings and how long does a user have to be inactive in order to kick him out of the server in seconds (`cache.userConnectionTTL`) and how often will it be checked to kick users or not (`cache.checkperiod`), also in seconds. If the "message" does not have a username attached, then it means it's a system message. It logs everything in JSON format and by default uses port 8080.

### Future work
 - Use a better caching DB like redis;
 - Configure server from an env file instead;
 - Add auth support with passwords;
 - Use secure connection;
 - Add tests;