# SAM FaaS Demo

A minimal AWS Lambda function, defined and deployed with the [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/). One function, one HTTP endpoint, no dependencies.

```
GET /hello?name=FaaS   →   API Gateway (HTTP API)   →   Lambda (Node.js 22)
```

```json
{ "message": "Hello, FaaS!", "coldStartAt": "2026-10-13T20:45:01.123Z", "invocations": 3 }
```

The response also shows **when the instance cold-started** and **how many times it has been invoked**. Call it a few times and you can watch Lambda reuse a warm instance, then wait a while (or redeploy) and see a new cold start.

## What's in here

| File | What it is |
| --- | --- |
| `template.yaml` | The infrastructure: one function plus its HTTP trigger (SAM expands this into CloudFormation) |
| `src/app.mjs` | The function code: a single `handler(event)` that returns an HTTP response |
| `events/hello.json` | A sample API Gateway event for invoking the function locally |
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
```

Or run a local API and hit it with curl:

```bash
sam local start-api
curl "http://127.0.0.1:3000/hello?name=FaaS"
```

### 3. Deploy to AWS

```bash
sam deploy --guided
```

Accept the defaults, and answer **y** when SAM warns that `HelloFunction` has no authorization defined (fine for a demo). When it finishes, it prints `HelloUrl`:

```bash
curl "https://<api-id>.execute-api.<region>.amazonaws.com/hello?name=FaaS"
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
- **Cold vs. warm starts.** Code at module level runs once per instance; the handler runs on every request.
- **Pay per use.** Idle costs nothing, and the free tier covers a demo like this many times over.
