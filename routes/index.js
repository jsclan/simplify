const express = require('express');
const router = express.Router();
const echoAtTime = require('../component/echoAtTime')

router.post('/echoAtTime', echoAtTime);

router.get('*', (req, res) => {
  res.status(404).json({"message": "Route not found"});
});

module.exports = router;