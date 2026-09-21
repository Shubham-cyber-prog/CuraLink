import prisma from '../../src/lib/prisma';
import { authService } from '../../src/services/auth.service';
import { Role } from '../../src/types/role';

describe('Google OAuth Role Assignment & Security Tests', () => {
  const testDoctorEmail = `test.doctor.oauth.${Date.now()}@example.com`;
  const testPatientEmail = `test.patient.oauth.${Date.now()}@example.com`;
  const existingUserEmail = `test.existing.user.${Date.now()}@example.com`;

  afterAll(async () => {
    // Cleanup test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testDoctorEmail, testPatientEmail, existingUserEmail],
        },
      },
    });
  });

  it('assigns role DOCTOR when new user signs up via Google with role DOCTOR', async () => {
    // Mock fetch for Google userinfo endpoint
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('googleapis.com/oauth2/v3/userinfo')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            sub: `google-sub-${Date.now()}-doc`,
            email: testDoctorEmail,
            name: 'Dr. Test OAuth',
            email_verified: true,
          }),
        });
      }
      return originalFetch(url);
    }) as any;

    try {
      const result = await authService.googleLogin('mock-google-token-doc', 'DOCTOR');

      expect(result.user.role).toBe(Role.DOCTOR);
      expect(result.user.email).toBe(testDoctorEmail);

      // Verify in Database directly
      const dbUser = await prisma.user.findUnique({
        where: { email: testDoctorEmail },
        include: { doctorProfile: true },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.role).toBe(Role.DOCTOR);
      expect(dbUser?.doctorProfile).not.toBeNull();
      expect(dbUser?.doctorProfile?.verificationStatus).toBe('PENDING');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('assigns role PATIENT when new user signs up via Google with role PATIENT', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('googleapis.com/oauth2/v3/userinfo')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            sub: `google-sub-${Date.now()}-pat`,
            email: testPatientEmail,
            name: 'Patient Test OAuth',
            email_verified: true,
          }),
        });
      }
      return originalFetch(url);
    }) as any;

    try {
      const result = await authService.googleLogin('mock-google-token-pat', 'PATIENT');

      expect(result.user.role).toBe(Role.PATIENT);
      expect(result.user.email).toBe(testPatientEmail);

      const dbUser = await prisma.user.findUnique({
        where: { email: testPatientEmail },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.role).toBe(Role.PATIENT);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('never overwrites existing user role on subsequent Google login with a different role requested', async () => {
    // 1. Create an existing user with role PATIENT
    const existingUser = await prisma.user.create({
      data: {
        email: existingUserEmail,
        name: 'Existing Patient',
        role: Role.PATIENT,
      },
    });

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('googleapis.com/oauth2/v3/userinfo')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            sub: `google-sub-existing-${Date.now()}`,
            email: existingUserEmail,
            name: 'Existing Patient',
            email_verified: true,
          }),
        });
      }
      return originalFetch(url);
    }) as any;

    try {
      // User attempts to log in via Google with requestedRole = "DOCTOR"
      const result = await authService.googleLogin('mock-google-token-existing', 'DOCTOR');

      // Role must STILL be PATIENT
      expect(result.user.role).toBe(Role.PATIENT);

      const dbUser = await prisma.user.findUnique({
        where: { email: existingUserEmail },
      });
      expect(dbUser?.role).toBe(Role.PATIENT);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('assigns role DOCTOR and creates doctor profile in non-Google (email/password) signup', async () => {
    const emailSignup = `email.doctor.${Date.now()}@example.com`;

    try {
      const result = await authService.register({
        name: 'Dr. Email Signup',
        email: emailSignup,
        password: 'Password123!',
        role: Role.DOCTOR,
      });

      expect(result.user.role).toBe(Role.DOCTOR);

      const dbUser = await prisma.user.findUnique({
        where: { email: emailSignup },
        include: { doctorProfile: true },
      });

      expect(dbUser?.role).toBe(Role.DOCTOR);
      expect(dbUser?.doctorProfile).not.toBeNull();
      expect(dbUser?.doctorProfile?.verificationStatus).toBe('PENDING');
    } finally {
      await prisma.user.deleteMany({
        where: { email: emailSignup },
      });
    }
  });

  it('properly encodes and decodes OAuth state parameter with role and CSRF', () => {
    const csrfToken = 'test-csrf-token-12345';
    const selectedRole = 'DOCTOR';
    const statePayload = JSON.stringify({ csrf: csrfToken, role: selectedRole, ts: Date.now() });
    const encodedState = Buffer.from(statePayload).toString('base64url');

    // Decode in callback
    const decoded = JSON.parse(Buffer.from(encodedState, 'base64url').toString('utf8'));
    expect(decoded.csrf).toBe(csrfToken);
    expect(decoded.role).toBe('DOCTOR');
  });
});
