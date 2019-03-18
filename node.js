const boot = require('./boot');
const server = require('./server');
const debug = require('debug')('app');
const application_port = process.env.PORT || 8080;

let server_state = {
  running: false,
  onPort: application_port
};

const express_app = server();

boot(({ redis_client }) => {
  if (!server_state.running) {
    express_app.listen(application_port, () => {
      server_state.running = true;
      debug(`Server running on port ${application_port}`);
    })
  }

}, (error) => debug(error));