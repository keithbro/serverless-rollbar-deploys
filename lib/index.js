'use strict';

const http = require('http');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      welcome: {
        usage: 'Helps you start your first Serverless plugin',
        lifecycleEvents: [
          'hello',
          'world',
        ],
        options: {
          message: {
            usage:
              'Specify the message you want to deploy '
              + '(e.g. "--message \'My Message\'" or "-m \'My Message\'")',
            required: true,
            shortcut: 'm',
          },
        },
      },
    };

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
    }, (res) => {
      this.serverless.cli.log(`STATUS: ${res.statusCode}`);
      res.on('data', this.serverless.cli.log);
      res.on('end', () => this.serverless.cli.log("No more data in response."));
    });

    request.write(JSON.stringify({
      access_token: this.serverless.service.custom.rollbarAccessToken,
      environment: 'test',
      revision: 'master',
    }));

    request.end();

    this.serverless.cli.log("Rollbar notification complete.");
  }
}

module.exports = ServerlessPlugin;
