# Dockerfile

# node:10.15.0-alpine Or whatever Node version/image you want
FROM node:10.15.0-alpine

# install nodemon globally
RUN npm install -g nodemon

WORKDIR '/var/www/app'
