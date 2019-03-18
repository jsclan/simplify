const express = require('express');
const body_parser = require('body-parser');
const api_router = require('./routes');
const express_app = express();

module.exports = () => {
  express_app.use(body_parser.urlencoded({extended: true}));
  express_app.use(body_parser.json());
  express_app.use(api_router);

  express_app.use(function (err, req, res) {
    res.status(err.status || 500).json({"message": "Internal error"});
  });

  return express_app;
}
