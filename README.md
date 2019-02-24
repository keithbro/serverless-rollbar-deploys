# serverless-rollbar-deploys

Send deployment notifications to Rollbar.

## Install

```bash
npm install --save-dev serverless-rollbar-deploys
```

## Usage

See the example below for how to modify your serverless.yml

```yaml
plugins:
  - serverless-rollbar-deploys

custom:
  rollbar-deploys:
    accessToken: STRING_VALUE
    user: ${env:USER}
```
