import { version as uuidVersion } from "uuid";

import activation from "models/activation.js";
import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use Case: Registration Flow (all successful)", () => {
  let createUserResponseBody;
  let activationToken;
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registration.flow@curso.dev",
          password: "RegistrationFlowPassword",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@curso.dev",
      features: ["read:activation_token"],
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@fintab.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@curso.dev>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no FinTab!");
    expect(lastEmail.text).toContain("RegistrationFlow");

    const activationTokenId = orchestrator.extractUUID(lastEmail.text);

    expect(lastEmail.text).toContain(
      `${webserver.origin}/cadastro/ativar/${activationTokenId}`,
    );

    activationToken = await activation.findOneValidById(activationTokenId);

    expect(activationToken).toEqual({
      id: activationTokenId,
      used_at: null,
      user_id: createUserResponseBody.id,
      expires_at: activationToken.expires_at,
      updated_at: activationToken.updated_at,
      created_at: activationToken.created_at,
    });

    expect(uuidVersion(activationToken.id)).toBe(4);
    expect(uuidVersion(createUserResponseBody.id)).toBe(4);

    expect(Date.parse(activationToken.created_at)).not.toBeNaN();
    expect(Date.parse(activationToken.updated_at)).not.toBeNaN();
    expect(Date.parse(activationToken.expires_at)).not.toBeNaN();

    expect(activationToken.expires_at > new Date()).toBe(true);
  });

  test("Activate account", async () => {
    const response = await fetch(
      `http://localhost:3000/api/v1/activations/${activationToken.id}`,
      {
        method: "PATCH",
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(Date.parse(responseBody.used_at)).not.toBeNaN();
    expect(responseBody.used_at > responseBody.created_at).toBe(true);
    expect(responseBody.updated_at > responseBody.created_at).toBe(true);

    const updatedUser = await user.findOneByUsername("RegistrationFlow");

    expect(updatedUser.features).toEqual(["create:session"]);
  });

  test("Login", async () => {
    const createSessionResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "registration.flow@curso.dev",
          password: "RegistrationFlowPassword",
        }),
      },
    );

    expect(createSessionResponse.status).toBe(201);

    const createSessionResponseBody = await createSessionResponse.json();

    expect(createSessionResponseBody.user_id).toEqual(
      createUserResponseBody.id,
    );
  });

  test("Get user information", async () => {});
});
