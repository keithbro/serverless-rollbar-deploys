'use strict';

const { http } = require('follow-redirects');
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
      const config = this.serverless.service.custom.rollbar;
      if (!config) {
        reject("Could not find custom.rollbar variable group in serverless.yml");
        return;
      }

      const local_username = config.deployUser;
      if (!local_username) {
        reject("Could not find custom.rollbar.deployUser variable in serverless.yml");
        return;
      }

      const access_token = config.accessToken;
      if (!access_token) {
        reject("Could not find custom.rollbar.accessToken variable in serverless.yml");
        return;
      }

      const revision = process.env.GIT_COMMIT || execSync('git rev-parse --short HEAD').toString('utf8').trim();
      if (!revision) {
        reject("Unable to determine git revision, run me in a git repository or pass GIT_COMMIT env variable");
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
