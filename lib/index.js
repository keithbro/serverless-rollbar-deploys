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

    return new Promise((resolve, reject) => {
      const config = this.serverless.service.custom['rollbar-deploys'];
      if (!config) {
        reject("Missing rollbar-deploys custom variables in serverless.yml");
        return;
      }

      const revision = execSync('git rev-parse --short HEAD').toString('utf8').trim();
      if (!revision) {
        reject("Unable to determine git revision, is this a git repository?");
        return;
      }

      const local_username = config.username;
      if (!local_username) {
        reject("Missing username variable under custom.rollbar-deploys in serverless.yml");
        return;
      }

      const access_token = config.accessToken;
      if (!access_token) {
        reject("Missing accessToken variable under custom.rollbar-deploys in serverless.yml");
        return;
      }

      const environment = this.options.stage;

      const request = http.request({
        method: 'POST',
        host: 'api.rollbar.com',
        path: '/api/1/deploy/',
      }, (response) => {
        this.serverless.cli.log(`STATUS: ${response.statusCode}`);
        this.serverless.cli.log(`HEADERS: ${JSON.stringify(response.headers)}`);

        let rawData = '';
        response.on('data', (chunk) => { rawData += chunk });
        response.on('end', () => {
          if (response.statusCode !== 200) {
            reject(`Response from Rollbar was: ${rawData}`);
            return;
          }

          this.serverless.cli.log("Rollbar notification complete.");
          resolve();
        });
      });

      request.on('error', reject)

      request.write(JSON.stringify({
        access_token,
        environment,
        local_username,
        revision,
      }));

      request.end();
    });
  }
}

module.exports = ServerlessPlugin;
