# SAM FaaS Demo

Minimal AWS Lambda functions, defined and deployed with the [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/). Two functions, one HTTP API, no dependencies.

```
GET /hello?name=FaaS   →   API Gateway (HTTP API)   →   Lambda (Node.js 22)
```

```json
{ "message": "Hello, FaaS!", "coldStartAt": "2026-10-13T20:45:01.123Z", "invocations": 3 }
```

The response also shows **when the instance cold-started** and **how many times it has been invoked**. Call it a few times and you can watch Lambda reuse a warm instance, then wait a while (or redeploy) and see a new cold start.

### World clock

```
GET /time/tokyo   →   API Gateway (HTTP API)   →   Lambda (Node.js 22)
```

```json
{ "city": "tokyo", "timeZone": "Asia/Tokyo", "localTime": "Wednesday 09:15", "greeting": "Good morning from tokyo!", "workingHours": true, "hoursFromHome": 12, "home": "America/Argentina/Buenos_Aires" }
```

Supported cities: `buenos-aires`, `new-york`, `san-francisco`, `london`, `madrid`, `tokyo`, `sydney`. Any other city returns a `404` that lists them.

## What's in here

| File | What it is |
| --- | --- |
| `template.yaml` | The infrastructure: one function plus its HTTP trigger (SAM expands this into CloudFormation) |
| `src/app.mjs` | The function code: a single `handler(event)` that returns an HTTP response |
| `src/clock.mjs` | The world clock: reads `{city}` from the path and `HOME_TIMEZONE` from the environment |
| `events/hello.json`, `events/clock.json` | Sample API Gateway events for invoking the functions locally |
| `tests/app.test.mjs` | Unit tests. The handler is just a function, so you can test it without AWS |

## Prerequisites

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Node.js 22
- [Docker](https://docs.docker.com/get-docker/) (only for `sam local`)
- An AWS account with credentials configured (only for deploying)

## Walkthrough

### 1. Test it like any other function

```bash
npm test
```

### 2. Run it locally in a Lambda-like container

```bash
sam build
sam local invoke HelloFunction --event events/hello.json
sam local invoke WorldClockFunction --event events/clock.json
```

Or run a local API and hit it with curl:

```bash
sam local start-api
curl "http://127.0.0.1:3000/hello?name=FaaS"
curl "http://127.0.0.1:3000/time/tokyo"
```

### 3. Deploy to AWS

```bash
sam deploy --guided
```

Accept the defaults, and answer **y** when SAM warns that `HelloFunction` has no authorization defined (fine for a demo). When it finishes, it prints `HelloUrl` and `WorldClockUrl`:

```bash
curl "https://<api-id>.execute-api.<region>.amazonaws.com/hello?name=FaaS"
curl "https://<api-id>.execute-api.<region>.amazonaws.com/time/tokyo"
```

### 4. Watch the logs

```bash
sam logs --stack-name <your-stack-name> --tail
```

### 5. Iterate fast (optional)

`sam sync` pushes code changes to the cloud in seconds as you save:

```bash
sam sync --stack-name <your-stack-name> --watch
```

### 6. Clean up

```bash
sam delete
```

## Talking points

- **You write a function, not a server.** `app.mjs` has no ports, no framework, and no process management.
- **Infrastructure as code.** About 25 lines of `template.yaml` become a Lambda function, an IAM role, an HTTP API, a route, and permissions.
- **Events in, response out.** The trigger (here an HTTP request) arrives as a JSON `event`. Swap the event source for S3, SQS or a schedule and the handler pattern stays the same.
- **Adding a function is a few lines of YAML.** `WorldClockFunction` joins the existing HTTP API with its own route, and `sam deploy` shows just that change in the changeset.
- **Configuration lives in the template.** `HOME_TIMEZONE` is an environment variable set in `template.yaml`, so you can change it and redeploy without touching code.
- **Cold vs. warm starts.** Code at module level runs once per instance; the handler runs on every request.
- **Pay per use.** Idle costs nothing, and the free tier covers a demo like this many times over.
