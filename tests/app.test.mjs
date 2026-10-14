import { test } from "node:test";
import assert from "node:assert/strict";
import { handler } from "../src/app.mjs";

test("greets the name from the query string", async () => {
  const res = await handler({ queryStringParameters: { name: "Ada" } });
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).message, "Hello, Ada!");
});

test("defaults to world", async () => {
  const res = await handler({});
  assert.equal(JSON.parse(res.body).message, "Hello, world!");
});

test("warm invocations reuse the same instance", async () => {
  const first = JSON.parse((await handler({})).body);
  const second = JSON.parse((await handler({})).body);
  assert.equal(second.coldStartAt, first.coldStartAt);
  assert.equal(second.invocations, first.invocations + 1);
});
