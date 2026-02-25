// Integration test for auth endpoints
// Requires a running MongoDB instance (see jest.config.ts for setup)

describe('POST /api/v1/auth/register', () => {
  it.todo('registers a new user and sends verification email');
  it.todo('rejects duplicate email');
  it.todo('rejects invalid password format');
});

describe('POST /api/v1/auth/login', () => {
  it.todo('returns access token and sets refresh cookie on valid credentials');
  it.todo('rejects invalid credentials with 401');
  it.todo('rejects suspended account with 403');
});

describe('POST /api/v1/auth/refresh', () => {
  it.todo('rotates refresh token and returns new access token');
  it.todo('detects token reuse and revokes all sessions');
});
