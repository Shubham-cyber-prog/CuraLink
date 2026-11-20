import fs from 'fs';
import path from 'path';

export interface LabPackage {
  id: string;
  name: string;
  category: 'Full Body' | 'Diabetes & Heart' | 'Vitamins & Blood' | 'Organ Care';
  testCount: number;
  fastingHours: number;
  reportTurnaround: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  sampleType: string;
  description: string;
  popular?: boolean;
  testsCovered: string[];
}

export interface LabBooking {
  id: string;
  userId: string;
  patientName: string;
  patientPhone: string;
  packageId: string;
  packageName: string;
  price: number;
  collectionAddress: string;
  collectionCity: string;
  collectionDate: string;
  collectionSlot: string;
  paymentMethod: 'UPI' | 'CARD' | 'PAY_ON_COLLECTION';
  paymentStatus: 'PAID' | 'PENDING';
  status: 'SCHEDULED' | 'PHLEBOTOMIST_ASSIGNED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'REPORT_READY' | 'CANCELLED';
  phlebotomistName?: string;
  phlebotomistPhone?: string;
  createdAt: string;
  reportUrl?: string;
}

export const LAB_PACKAGES: LabPackage[] = [
  {
    id: 'pkg-full-body-advanced',
    name: 'Comprehensive Full Body Health Checkup',
    category: 'Full Body',
    testCount: 85,
    fastingHours: 10,
    reportTurnaround: '24 Hours',
    originalPrice: 2499,
    discountedPrice: 999,
    discountPercent: 60,
    sampleType: 'Blood & Urine',
    description: 'Gold-standard diagnostic panel covering heart, liver, kidneys, blood counts, diabetes, thyroid and essential vitamins.',
    popular: true,
    testsCovered: [
      'Complete Blood Count (CBC - 24 params)',
      'Liver Function Test (LFT - 11 params)',
      'Kidney Function Test (KFT - 9 params)',
      'Lipid Profile & Cardiac Risk (7 params)',
      'HbA1c & Fasting Blood Sugar',
      'Thyroid Profile (T3, T4, TSH)',
      'Vitamin D3 (25-Hydroxy)',
      'Vitamin B12 (Cyanocobalamin)',
      'Complete Urine Examination (CUE - 18 params)',
    ],
  },
  {
    id: 'pkg-diabetes-hba1c',
    name: 'Advanced Diabetes & Glycemic Control Panel',
    category: 'Diabetes & Heart',
    testCount: 8,
    fastingHours: 10,
    reportTurnaround: '12 Hours',
    originalPrice: 999,
    discountedPrice: 499,
    discountPercent: 50,
    sampleType: 'Blood & Urine',
    description: 'Detailed assessment of 3-month average blood glucose, pancreatic control and early diabetic kidney damage risk.',
    popular: true,
    testsCovered: [
      'HbA1c (Glycosylated Hemoglobin)',
      'Estimated Average Glucose (eAG)',
      'Fasting Blood Sugar (FBS)',
      'Post-Prandial Glucose (PPBS)',
      'Urine Microalbumin/Creatinine Ratio',
      'Serum Creatinine & eGFR',
    ],
  },
  {
    id: 'pkg-cardiac-lipid',
    name: 'Cardiac Risk & Complete Lipid Profile',
    category: 'Diabetes & Heart',
    testCount: 9,
    fastingHours: 12,
    reportTurnaround: '12 Hours',
    originalPrice: 899,
    discountedPrice: 399,
    discountPercent: 55,
    sampleType: 'Blood',
    description: 'Comprehensive screening for coronary artery disease risk, good & bad cholesterol, and triglycerides.',
    testsCovered: [
      'Total Cholesterol',
      'HDL (Good) Cholesterol',
      'LDL (Bad) Cholesterol',
      'VLDL Cholesterol',
      'Serum Triglycerides',
      'Total Cholesterol / HDL Ratio',
      'LDL / HDL Risk Ratio',
      'High-Sensitivity C-Reactive Protein (hs-CRP)',
    ],
  },
  {
    id: 'pkg-cbc-esr',
    name: 'Complete Blood Count (CBC) with ESR',
    category: 'Vitamins & Blood',
    testCount: 26,
    fastingHours: 0,
    reportTurnaround: '6 Hours',
    originalPrice: 599,
    discountedPrice: 299,
    discountPercent: 50,
    sampleType: 'Blood',
    description: 'Detects infections, anemia, platelet disorders, immune function and systemic inflammation markers.',
    popular: true,
    testsCovered: [
      'Hemoglobin (Hb)',
      'Total Leukocyte Count (WBC)',
      'Differential Count (Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils)',
      'Platelet Count',
      'RBC Count & Hematocrit (PCV)',
      'MCV, MCH, MCHC, RDW',
      'Erythrocyte Sedimentation Rate (ESR)',
    ],
  },
  {
    id: 'pkg-thyroid-tsh',
    name: 'Thyroid Function Profile (T3, T4, TSH)',
    category: 'Organ Care',
    testCount: 3,
    fastingHours: 0,
    reportTurnaround: '12 Hours',
    originalPrice: 699,
    discountedPrice: 349,
    discountPercent: 50,
    sampleType: 'Blood',
    description: 'High-precision chemiluminescence assay for hypo- and hyper-thyroidism, fatigue and metabolic changes.',
    testsCovered: [
      'Total Triiodothyronine (T3)',
      'Total Thyroxine (T4)',
      'Ultrasensitive Thyroid Stimulating Hormone (TSH 3rd Gen)',
    ],
  },
  {
    id: 'pkg-vitamins-d-b12',
    name: 'Essential Vitamins & Bone Health Panel',
    category: 'Vitamins & Blood',
    testCount: 4,
    fastingHours: 0,
    reportTurnaround: '18 Hours',
    originalPrice: 1599,
    discountedPrice: 699,
    discountPercent: 56,
    sampleType: 'Blood',
    description: 'Assesses vitamin deficiency, bone mineral density support, nerve conduction, energy levels and immunity.',
    popular: true,
    testsCovered: [
      'Vitamin D3 (25-Hydroxy Cholecalciferol)',
      'Vitamin B12 (Cyanocobalamin)',
      'Serum Calcium Total',
      'Serum Phosphorus & Alkaline Phosphatase',
    ],
  },
  {
    id: 'pkg-lft-liver',
    name: 'Liver Function Test (LFT Profile)',
    category: 'Organ Care',
    testCount: 12,
    fastingHours: 8,
    reportTurnaround: '12 Hours',
    originalPrice: 899,
    discountedPrice: 449,
    discountPercent: 50,
    sampleType: 'Blood',
    description: 'Screens liver health, alcohol impact, fatty liver signs, jaundice, enzyme activity and protein synthesis.',
    testsCovered: [
      'Bilirubin Total, Direct & Indirect',
      'SGOT / AST (Aspartate Aminotransferase)',
      'SGPT / ALT (Alanine Aminotransferase)',
      'Alkaline Phosphatase (ALP)',
      'Gamma GT (GGTP)',
      'Total Protein, Albumin & Globulin',
      'A/G Ratio',
    ],
  },
  {
    id: 'pkg-kft-kidney',
    name: 'Kidney Function Test (KFT / Renal Panel)',
    category: 'Organ Care',
    testCount: 10,
    fastingHours: 0,
    reportTurnaround: '12 Hours',
    originalPrice: 899,
    discountedPrice: 449,
    discountPercent: 50,
    sampleType: 'Blood',
    description: 'Evaluates renal filtration, electrolyte balance, hydration status and gout risk.',
    testsCovered: [
      'Serum Creatinine & eGFR',
      'Blood Urea & Blood Urea Nitrogen (BUN)',
      'Serum Uric Acid',
      'Sodium, Potassium & Chloride (Electrolytes)',
      'BUN / Creatinine Ratio',
    ],
  },
];

// Persistent File Store for Lab Bookings
const DATA_FILE = path.join(process.cwd(), 'prisma', 'lab_bookings.json');

function loadBookings(): LabBooking[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load lab bookings from file:', err);
  }
  return [];
}

function saveBookings(bookings: LabBooking[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist lab bookings:', err);
  }
}

export class LabService {
  private bookings: LabBooking[] = loadBookings();

  getPackages(category?: string): LabPackage[] {
    if (!category || category === 'All Packages') {
      return LAB_PACKAGES;
    }
    return LAB_PACKAGES.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  getPackageById(id: string): LabPackage | undefined {
    return LAB_PACKAGES.find((p) => p.id === id);
  }

  createBooking(data: {
    userId: string;
    patientName: string;
    patientPhone: string;
    packageId: string;
    collectionAddress: string;
    collectionCity?: string;
    collectionDate: string;
    collectionSlot: string;
    paymentMethod: 'UPI' | 'CARD' | 'PAY_ON_COLLECTION';
  }): LabBooking {
    const pkg = this.getPackageById(data.packageId);
    if (!pkg) {
      throw new Error('Selected lab package is not available');
    }

    const bookingId = `LAB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const phlebos = [
      { name: 'Rajesh Sharma', phone: '+91 98765 43210' },
      { name: 'Amit Verma', phone: '+91 98112 34567' },
      { name: 'Suresh Kumar', phone: '+91 97234 56789' },
      { name: 'Pooja Nair', phone: '+91 99887 76655' },
    ];
    const assignedPhlebo = phlebos[Math.floor(Math.random() * phlebos.length)];

    const newBooking: LabBooking = {
      id: bookingId,
      userId: data.userId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.discountedPrice,
      collectionAddress: data.collectionAddress,
      collectionCity: data.collectionCity || 'Delhi NCR',
      collectionDate: data.collectionDate,
      collectionSlot: data.collectionSlot,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'PAY_ON_COLLECTION' ? 'PENDING' : 'PAID',
      status: 'SCHEDULED',
      phlebotomistName: assignedPhlebo.name,
      phlebotomistPhone: assignedPhlebo.phone,
      createdAt: new Date().toISOString(),
      reportUrl: `/api/lab/reports/${bookingId}.pdf`,
    };

    this.bookings.unshift(newBooking);
    saveBookings(this.bookings);
    return newBooking;
  }

  getUserBookings(userId: string): LabBooking[] {
    return this.bookings.filter((b) => b.userId === userId);
  }

  getBookingById(id: string, userId?: string): LabBooking | undefined {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return undefined;
    if (userId && booking.userId !== userId) return undefined;
    return booking;
  }

  cancelBooking(id: string, userId: string): boolean {
    const idx = this.bookings.findIndex((b) => b.id === id && b.userId === userId);
    if (idx === -1) return false;
    this.bookings[idx].status = 'CANCELLED';
    saveBookings(this.bookings);
    return true;
  }
}

export const labService = new LabService();
