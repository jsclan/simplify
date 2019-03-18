const moment = require('moment');
const term = require('terminal-kit').terminal;
const debug = require('debug')('app');
const redis_client = require('../redis_client');
const UPTIME_PING_KEY = 'UPTIME_PING';

let intervalID = null;
let intervalUpTimeID = null;

const queueDeliveryHandler = (unixTimestamp) => {
  redis_client.get(`echo_${unixTimestamp}`).then((message) => {
    if (message) {
      term().eraseLineAfter(`${message}\n`); //Provide message to console as specified in task.
      redis_client.del(`echo_${unixTimestamp}`); //Delete outdated/println record from redis
      debug('Provided message to console and deleted from redis');
    }
  }).catch((error) => {
    debug(`Error while process messages queue: ${error}`);
  });
};

const upTimeHandler = async () => {
  /*
  Getting unix timestamp and avoiding difference in last 3 digits with dividing to 1000
  */
  const upTimestamp = parseInt(moment().valueOf() / 1000);

  /*
  Getting latest uptime point
  */
  const upTimestampOld = await redis_client.get(UPTIME_PING_KEY);
  redis_client.set(UPTIME_PING_KEY, upTimestamp);

  /*
  Asynchronously deliver all outdated messages (if they are exist)
  */
  if (upTimestamp - upTimestampOld > 0) {
    for ( let unixTimestamp = upTimestampOld; unixTimestamp <= upTimestamp; unixTimestamp++ ) {

      /*
      Getting and delivery message at time
      */
      queueDeliveryHandler(unixTimestamp);
    }
  }

  /*
  Periodically refresh uptime point
  */
  if (!intervalUpTimeID) {
    intervalUpTimeID = setInterval(() => {
      /*
      Getting unix timestamp and avoiding difference in last 3 digits with dividing to 1000
      */
      const UTunixTimestamp = parseInt(moment().valueOf() / 1000);
      redis_client.set(UPTIME_PING_KEY, UTunixTimestamp);
      debug('Setting uptime ping');
    }, 10000);
  }
};

const queueHandler = () => {
  if (!intervalID) {
    intervalID = setInterval(() => {
      /*
      Getting unix timestamp and avoiding difference in last 3 digits with dividing to 1000
      */
      const unixTimestamp = parseInt(moment().valueOf() / 1000);

      /*
      Getting and delivery message at time
      */
      queueDeliveryHandler(unixTimestamp);
    }, 1000);
  }
};

module.exports = {
  run: async () => {
    try {
      /*
      Uptime handler. On startup will run also outdated messages
      */
      await upTimeHandler();

      /*
      Queue handler. Simple asynchronous queue processor
      */
      queueHandler();

    } catch(error) {
      debug(`Error while process messages queue: ${error}`);
    }
  },
  stop: () => {
    if (intervalID)
      clearInterval(intervalID);

    debug('Stopped rotation');
  }
};