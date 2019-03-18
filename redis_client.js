const redis = require('redis');
const redis_client = redis.createClient();

module.exports = {
  getInstance: () => redis_client,
  get: (key) => new Promise((resolve, reject) => {
    redis_client.get(key, (err, data) => {
      if (err)
        reject(err);
      resolve(data)
    })
  }),
  set: (key, value) => new Promise((resolve, reject) => {
    redis_client.set(key, value, (err, data) => {
      if (err)
        reject(err);
      resolve(data)
    })
  }),
  del: (key) => new Promise((resolve, reject) => {
    redis_client.del(key, (err, data) => {
      if (err)
        reject(err);
      resolve(data)
    })
  })
};