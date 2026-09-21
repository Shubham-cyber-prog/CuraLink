import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma';
import { CreatePrescriptionInput } from '../validators/prescription.validator';
import { ForbiddenError, NotFoundError } from '../utils/errors';

const PRESCRIPTION_SECRET = process.env.PRESCRIPTION_SECRET || 'curalink-rx-secure-signature-key-2026';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'prescriptions');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class PrescriptionService {
  async createPrescription(doctorId: string, data: CreatePrescriptionInput) {
    // 1. Verify doctor license approval status (NMC Telemedicine Guidelines Compliance)
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
      include: { user: true },
    });

    if (!doctorProfile || doctorProfile.verificationStatus !== 'APPROVED') {
      throw new ForbiddenError(
        'Only verified doctors with approved medical licenses can issue e-prescriptions.'
      );
    }

    // 2. Fetch patient information
    const patient = await prisma.user.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // 3. Generate SHA-256 Digital Signature
    const timestamp = new Date().toISOString();
    const payloadToSign = `${doctorId}:${data.patientId}:${data.consultationId}:${JSON.stringify(
      data.medications
    )}:${timestamp}:${PRESCRIPTION_SECRET}`;
    const digitalSignature = crypto.createHash('sha256').update(payloadToSign).digest('hex');

    const prescriptionId = `rx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const fileName = `${prescriptionId}.pdf`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const pdfUrl = `/uploads/prescriptions/${fileName}`;

    // 4. Create database record first
    const prescription = await prisma.prescription.create({
      data: {
        id: prescriptionId,
        appointmentId: data.consultationId,
        doctorId,
        patientId: data.patientId,
        diagnosis: data.diagnosis,
        medications: JSON.stringify(data.medications),
        notes: data.notes || null,
      },
    });

    // 5. Generate PDF file on disk
    await this.generatePDFFile({
      filePath,
      prescriptionId: prescription.id,
      doctorName: doctorProfile.user.name,
      specialization: doctorProfile.specialization,
      licenseNumber: doctorProfile.medicalLicenseNumber,
      medicalCouncil: 'National Medical Commission (NMC)',
      patientName: patient.name,
      patientEmail: patient.email,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      diagnosis: data.diagnosis,
      medications: data.medications,
      notes: data.notes,
      digitalSignature,
    });

    return {
      ...prescription,
      pdfUrl,
      digitalSignature,
      parsedMedications: data.medications,
      doctor: {
        name: doctorProfile.user.name,
        specialization: doctorProfile.specialization,
        licenseNumber: doctorProfile.medicalLicenseNumber,
      },
      patient: {
        name: patient.name,
        email: patient.email,
      },
    };
  }

  async getPrescriptionById(prescriptionId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    const doctorUser = prescription.appointment?.doctor?.user;
    const doctorProfile = prescription.appointment?.doctor;

    return {
      ...prescription,
      pdfUrl: `/uploads/prescriptions/${prescription.id}.pdf`,
      doctor: {
        id: doctorUser?.id || prescription.doctorId,
        name: doctorUser?.name || 'Doctor',
        email: doctorUser?.email || '',
        specialization: doctorProfile?.specialization || 'General Practice',
        medicalLicenseNumber: doctorProfile?.medicalLicenseNumber || '',
      },
      parsedMedications: JSON.parse(prescription.medications),
    };
  }

  async getPatientPrescriptions(patientId: string) {
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prescriptions.map((p) => {
      const doctorUser = p.appointment?.doctor?.user;
      const doctorProfile = p.appointment?.doctor;

      return {
        ...p,
        pdfUrl: `/uploads/prescriptions/${p.id}.pdf`,
        doctor: {
          id: doctorUser?.id || p.doctorId,
          name: doctorUser?.name || 'Doctor',
          email: doctorUser?.email || '',
          specialization: doctorProfile?.specialization || 'General Practice',
        },
        parsedMedications: JSON.parse(p.medications),
      };
    });
  }

  public async generatePDFFile(data: {
    filePath: string;
    prescriptionId: string;
    doctorName: string;
    specialization: string;
    licenseNumber: string;
    medicalCouncil: string;
    patientName: string;
    patientEmail: string;
    date: string;
    diagnosis: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    notes?: string;
    digitalSignature: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(data.filePath);

      doc.pipe(stream);

      // Header Banner
      doc
        .rect(0, 0, 595, 80)
        .fill('#0F766E'); // Teal background

      doc
        .fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('CuraLink Healthcare', 40, 20);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Official Telemedicine E-Prescription', 40, 48)
        .text('NMC Telemedicine Guidelines 2020 Compliant', 350, 48, { align: 'right' });

      doc.moveDown(3);

      // Doctor Details Section (Top Left)
      doc
        .fillColor('#1F2937')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Dr. ${data.doctorName}`, 40, 100);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(`Specialization: ${data.specialization}`)
        .text(`Medical License No: ${data.licenseNumber}`)
        .text(`State Council: ${data.medicalCouncil}`)
        .text(`Status: Verified Medical Practitioner ✓`, { width: 300 });

      // Patient & Date Details (Top Right)
      doc
        .fillColor('#1F2937')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('PATIENT DETAILS', 350, 100, { align: 'right' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(`Name: ${data.patientName}`, 350, 118, { align: 'right' })
        .text(`Email: ${data.patientEmail}`, 350, 132, { align: 'right' })
        .text(`Date: ${data.date}`, 350, 146, { align: 'right' })
        .text(`Rx ID: ${data.prescriptionId}`, 350, 160, { align: 'right' });

      // Horizontal Divider
      doc
        .moveTo(40, 185)
        .lineTo(555, 185)
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .stroke();

      // Diagnosis Section
      doc
        .fillColor('#0F766E')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DIAGNOSIS / CLINICAL IMPRESSION', 40, 195);

      doc
        .fillColor('#1F2937')
        .fontSize(11)
        .font('Helvetica')
        .text(data.diagnosis, 40, 212);

      // Rx Symbol
      doc
        .fillColor('#0F766E')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Rx', 40, 240);

      // Medications Table Header
      const tableTop = 275;
      doc
        .rect(40, tableTop, 515, 24)
        .fill('#F3F4F6');

      doc
        .fillColor('#111827')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Medication Name', 50, tableTop + 7)
        .text('Dosage', 210, tableTop + 7)
        .text('Frequency', 300, tableTop + 7)
        .text('Duration', 430, tableTop + 7);

      // Medications Table Body
      let y = tableTop + 30;
      data.medications.forEach((med, index) => {
        doc
          .fillColor('#1F2937')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`${index + 1}. ${med.name}`, 50, y);

        doc
          .font('Helvetica')
          .fillColor('#374151')
          .text(med.dosage, 210, y)
          .text(med.frequency, 300, y)
          .text(med.duration, 430, y);

        if (med.instructions) {
          y += 14;
          doc
            .fontSize(9)
            .fillColor('#6B7280')
            .text(`   Instructions: ${med.instructions}`, 50, y);
        }

        y += 20;

        doc
          .moveTo(40, y - 5)
          .lineTo(555, y - 5)
          .strokeColor('#F3F4F6')
          .lineWidth(0.5)
          .stroke();
      });

      if (data.notes) {
        y += 10;
        doc
          .fillColor('#0F766E')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Doctor Notes / Advice', 40, y);

        y += 16;
        doc
          .fillColor('#374151')
          .fontSize(10)
          .font('Helvetica')
          .text(data.notes, 40, y);
        y += 30;
      } else {
        y += 20;
      }

      // Security & Digital Signature Footer
      const footerTop = 720;
      doc
        .rect(40, footerTop, 515, 60)
        .fill('#F9FAFB')
        .strokeColor('#D1D5DB')
        .lineWidth(1)
        .stroke();

      doc
        .fillColor('#0F766E')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('DIGITAL SIGNATURE & VERIFICATION HASH (SHA-256)', 50, footerTop + 8);

      doc
        .fillColor('#4B5563')
        .fontSize(8)
        .font('Courier')
        .text(data.digitalSignature, 50, footerTop + 22);

      doc
        .fillColor('#6B7280')
        .fontSize(8)
        .font('Helvetica-Oblique')
        .text(
          'This e-prescription is digitally generated under the Information Technology Act 2000 & NMC Telemedicine Practice Guidelines 2020. Valid across licensed pharmacies.',
          50,
          footerTop + 38,
          { width: 495 }
        );

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    });
  }
}

export const prescriptionService = new PrescriptionService();
