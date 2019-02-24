# serverless-rollbar-deploys

Send [serverless](https://serverless.com) deployment notifications to [Rollbar](http://rollbar.com).

## Install

```bash
npm install --save-dev serverless-rollbar-deploys
```

## Usage

Add the plugin and configure the accessToken and deployUser as demonstrated below.

```yaml
plugins:
  - serverless-rollbar-deploys

custom:
  rollbar:
    accessToken: STRING_VALUE
    deployUser: ${env:USER}
```

The `environment` sent to Rollbar will be the `stage` option.
