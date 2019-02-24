'use strict';

const http = require('http');
const { execSync } = require('child_process');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'after:deploy:deploy': this.afterDeploy.bind(this),
    };
  }

  afterDeploy() {
    this.serverless.cli.log("Notifying Rollbar...");

    const request = http.request({
      method: 'POST',
      host: 'api.rollbar.com',
      path: '/api/1/deploy/',
    }, console.log)

    request.on('error', console.error)

    const config = this.serverless.service.custom['rollbar-deploys'];
    const revision = execSync('git rev-parse --short HEAD').toString('utf8').trim();
    const environment = this.options.stage;
    const local_username = config.username;

    console.log({ config, revision, environment });

    request.write(JSON.stringify({
      access_token: config.accessToken,
      environment,
      local_username,
      revision,
    }));

    this.serverless.cli.log("Signalling end of Rollbar request...");
    request.end();
    this.serverless.cli.log("Rollbar notification complete.");
  }
}

module.exports = ServerlessPlugin;
