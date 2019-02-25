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

## Notes

* The `environment` sent to Rollbar will be the `stage` option.
* Remember that the plugins are executed in the order they are listed, so you probably want to list serverless-rollbar-deploys last.

## Possible Improvements

* Notify on other deployment events such as start and fail.
* Only warn rather than fail if the any other other variables are missing.
