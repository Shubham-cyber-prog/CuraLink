import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        availabilitySlots: {
          where: { isBooked: false, date: { gte: new Date() } },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Group availability slots by date
    const slotsByDate = doctor.availabilitySlots.reduce((acc, slot) => {
      const dateStr = slot.date.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(slot.startTime);
      return acc;
    }, {} as Record<string, string[]>);

    const formattedAvailabilitySlots = Object.entries(slotsByDate).map(([date, slots]) => ({
      date,
      slots,
    }));

    const formattedDoctor = {
      id: doctor.id,
      name: doctor.user.name,
      specialty: doctor.specialty,
      rating: doctor.rating,
      reviewCount: doctor.reviewCount,
      experience: doctor.experience,
      photoUrl: doctor.photoUrl,
      bio: doctor.bio,
      consultationFee: doctor.consultationFee,
      videoConsultation: doctor.videoConsultation,
      qualifications: doctor.qualifications,
      availabilitySlots: formattedAvailabilitySlots,
      reviews: [], // Mock or add Review model in the future
    };

    return NextResponse.json(formattedDoctor);
  } catch (error: any) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json({ error: "Failed to fetch doctor" }, { status: 500 });
  }
}
