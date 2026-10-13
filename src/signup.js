// Builds the account payload sent to the API from the signup form fields.
export function submitSignup(fields) {
  const account = {
    email: fields.email,
    password: fields.password,
    age: Number(fields.age),
  };
  return { ok: true, account };
}
