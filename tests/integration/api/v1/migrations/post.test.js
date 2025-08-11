import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
})

test("POST to /api/v1/migrations should return 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
    body: {},
  });
  expect(response1.status).toBe(201);

  const response1Body = await response1.json();
  expect(Array.isArray(response1Body)).toBeTruthy();
  expect(response1Body.length).toBeGreaterThan(0);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
    body: {},
  });
  expect(response2.status).toBe(200);

  const response2Body = await response2.json();
  expect(Array.isArray(response2Body)).toBeTruthy();
  expect(response2Body.length).toEqual(0);
});
