import fs from 'fs';
import path from 'path';

describe('Database Schema Index Audit', () => {
  const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  it('should have required indexes on Appointment model', () => {
    const appointmentSection = schemaContent.match(/model Appointment \{([\s\S]*?)\n\}/)?.[1] || '';
    expect(appointmentSection).toContain('@@index([status])');
    expect(appointmentSection).toContain('@@index([date])');
    // Composite indexes covering leading doctorId and userId
    expect(appointmentSection).toContain('@@index([doctorId, date])');
    expect(appointmentSection).toContain('@@index([userId, status])');
  });

  it('should have required indexes on Payment model', () => {
    const paymentSection = schemaContent.match(/model Payment \{([\s\S]*?)\n\}/)?.[1] || '';
    expect(paymentSection).toContain('@@index([userId])');
    expect(paymentSection).toContain('@@index([status])');
  });

  it('should have required indexes on Prescription model', () => {
    const prescriptionSection = schemaContent.match(/model Prescription \{([\s\S]*?)\n\}/)?.[1] || '';
    expect(prescriptionSection).toContain('@@index([patientId])');
    expect(prescriptionSection).toContain('@@index([doctorId])');
    expect(prescriptionSection).toContain('@@index([createdAt])');
  });

  it('should have required indexes on Review model', () => {
    const reviewSection = schemaContent.match(/model Review \{([\s\S]*?)\n\}/)?.[1] || '';
    expect(reviewSection).toContain('@@index([patientId])');
    expect(reviewSection).toContain('@@index([doctorId, createdAt])');
  });

  it('should have required indexes on User model', () => {
    const userSection = schemaContent.match(/model User \{([\s\S]*?)\n\}/)?.[1] || '';
    expect(userSection).toContain('@@index([role])');
    expect(userSection).toContain('@@index([createdAt])');
  });

  it('should have required indexes on DataErasureRequest model', () => {
    const erasureSection = schemaContent.match(/model DataErasureRequest \{([\s\S]*?)\n\}/)?.[1] || '';
    expect(erasureSection).toContain('@@index([userId])');
    expect(erasureSection).toContain('@@index([status])');
  });

  it('should confirm redundant single-column indexes were skipped on DoctorProfile', () => {
    const doctorSection = schemaContent.match(/model DoctorProfile \{([\s\S]*?)\n\}/)?.[1] || '';
    // verificationStatus is leading prefix in composite indexes
    expect(doctorSection).toContain('@@index([verificationStatus, experienceYears])');
    expect(doctorSection).toContain('@@index([verificationStatus, city])');
    // Redundant single-column index @@index([verificationStatus]) should not exist
    expect(doctorSection).not.toContain('@@index([verificationStatus])');
  });
});
