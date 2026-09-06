import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        availabilitySlots: {
          where: {
            isBooked: false,
            date: {
              gte: new Date(),
            },
          },
          orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
          ]
        },
      },
    });

    // Format to match frontend expectations
    const formattedDoctors = doctors.map(doc => {
      // Group availability slots by date
      const slotsByDate = doc.availabilitySlots.reduce((acc, slot) => {
        const dateStr = slot.date.toISOString().split('T')[0];
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(slot.startTime);
        return acc;
      }, {} as Record<string, string[]>);

      const formattedAvailabilitySlots = Object.entries(slotsByDate).map(([date, slots]) => ({
        date,
        slots,
      }));

      return {
        id: doc.id,
        name: doc.user.name,
        specialty: doc.specialty,
        rating: doc.rating,
        reviewCount: doc.reviewCount,
        experience: doc.experience,
        photoUrl: doc.photoUrl,
        availability: doc.availabilitySlots.length > 0 ? "today" : "any-time", // simplify for now
        bio: doc.bio,
        consultationFee: doc.consultationFee,
        videoConsultation: doc.videoConsultation,
        qualifications: doc.qualifications,
        availabilitySlots: formattedAvailabilitySlots,
      };
    });

    return NextResponse.json(formattedDoctors);
  } catch (error: any) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}
