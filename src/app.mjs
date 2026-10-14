// Code outside the handler runs once per cold start and is reused by warm invocations
const coldStartAt = new Date().toISOString();
let invocations = 0;

export const handler = async (event) => {
  invocations++;
  const name = event.queryStringParameters?.name ?? "world";

  console.log(`Invocation #${invocations} for ${name}`);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Hello, ${name}!`,
      coldStartAt,
      invocations,
    }),
  };
};
