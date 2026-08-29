import { hashPassword, comparePassword } from '../../src/utils/password';

describe('Password Utilities', () => {
  it('should hash a password and verify it successfully', async () => {
    const rawPassword = 'Password123!';
    const hashedPassword = await hashPassword(rawPassword);

    expect(hashedPassword).not.toBe(rawPassword);
    expect(hashedPassword.length).toBeGreaterThan(20);

    const isMatch = await comparePassword(rawPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should return false when comparing with incorrect password', async () => {
    const rawPassword = 'Password123!';
    const wrongPassword = 'WrongPassword123!';
    const hashedPassword = await hashPassword(rawPassword);

    const isMatch = await comparePassword(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });
});
