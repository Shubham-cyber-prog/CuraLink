/**
 * Safe Medical Attachment Picker for Mobile
 * Works seamlessly in Expo Go, Android/iOS bare builds, and web.
 * Supports image attachments (photos, scans) and medical documents (PDFs, lab reports).
 */

export interface MedicalAttachment {
  type: 'IMAGE' | 'DOCUMENT';
  name: string;
  url: string; // Base64 data URL or remote URL
  size?: string;
  mimeType?: string;
}

// Curated realistic medical sample attachments for instant testing & fallback
export const SAMPLE_MEDICAL_ATTACHMENTS: MedicalAttachment[] = [
  {
    type: 'DOCUMENT',
    name: 'Complete_Blood_Count_Report.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: '1.2 MB',
    mimeType: 'application/pdf',
  },
  {
    type: 'IMAGE',
    name: 'Skin_Allergy_Rash_Scan.jpg',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    size: '840 KB',
    mimeType: 'image/jpeg',
  },
  {
    type: 'DOCUMENT',
    name: 'Cardiology_ECG_Analysis.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: '2.4 MB',
    mimeType: 'application/pdf',
  },
  {
    type: 'IMAGE',
    name: 'Physical_Prescription_Photo.jpg',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    size: '950 KB',
    mimeType: 'image/jpeg',
  },
];

/**
 * Format message content for storage:
 * If an attachment is present, serialize as JSON string:
 * { text: string, attachment: MedicalAttachment }
 */
export function formatAttachmentMessage(text: string, attachment?: MedicalAttachment): string {
  if (!attachment) return text;
  return JSON.stringify({
    text: text.trim(),
    attachment,
  });
}

/**
 * Parse raw message content:
 * Decodes JSON attachment payload or returns plain text.
 */
export function parseMessageContent(raw: string): {
  text: string;
  attachment?: MedicalAttachment;
} {
  if (typeof raw !== 'string') return { text: '' };
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.includes('"attachment"')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        text: parsed.text || '',
        attachment: parsed.attachment,
      };
    } catch {
      return { text: raw };
    }
  }
  return { text: raw };
}
