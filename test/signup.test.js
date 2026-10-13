import { test } from "node:test";
import assert from "node:assert/strict";
import { submitSignup } from "../src/signup.js";

test("builds the account payload", () => {
  const result = submitSignup({ email: "sam@example.com", password: "correct horse", age: "34" });
  assert.deepEqual(result, { ok: true, account: { email: "sam@example.com", password: "correct horse", age: 34 } });
});
