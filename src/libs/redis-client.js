// redis-client.js
const redis = require('redis');
const Promise = require('bluebird');
const client = Promise.promisifyAll(redis.createClient(process.env.REDIS_URL));

module.exports = client;
