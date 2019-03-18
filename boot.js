const debug = require('debug')('app');
const client = require('./redis_client');
const redis_client = client.getInstance();
const moment = require('moment');
const invokeAtTime = require('./component/invokeAtTime');

module.exports = (onConnect, onError) => {
  debug('Connecting to the redis...');

  redis_client.on('connect', () => {
    debug('Connected to redis');
    onConnect({ redis_client });
    invokeAtTime.run();
  });
  redis_client.on('error', (error) => {
    invokeAtTime.stop();
    debug(`Connection to redis failed! ${error}`);
    onError(error)
  });
};