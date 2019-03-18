const moment = require('moment');
const client = require('../redis_client');
const redis_client = client.getInstance();
const dateFormats = ['DD/MM/YYYY HH:mm:ss', 'MM-DD-YYYY HH:mm:ss'];

module.exports = (req, res) => {
  const { body: { time, message } } = req;

  const preparedDate = moment(time, dateFormats, true);

  if (preparedDate.isValid()) {
    /*
    Getting unix timestamp and avoiding difference in last 3 digits with dividing to 1000
    */
    const unixTimestamp = parseInt(preparedDate.valueOf() / 1000);

    redis_client.set(`echo_${unixTimestamp}`, message);

    res.json({"message": `Message stored and will be processed at th egiven time: ${preparedDate.format()} : ${unixTimestamp}`});
  } else {
    res.status(500).json({"message": `Date must be in the following format: ${dateFormats.join(' or ')}`});
  }
}
