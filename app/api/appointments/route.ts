import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { doctorId, date, time } = await req.json();

    // In a real app, you would get patientId from the authenticated session
    // For now, we'll create a dummy patient or use an existing one if auth isn't fully set up here
    let patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
    
    if (!patient) {
      patient = await prisma.user.create({
        data: {
          name: "Test Patient",
          email: `test_${Date.now()}@example.com`,
          passwordHash: "dummy",
        }
      });
    }

    // Find the slot
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        doctorId,
        date: new Date(date),
        startTime: time,
        isBooked: false,
      }
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not available" }, { status: 400 });
    }

    // Book the appointment in a transaction
    const appointment = await prisma.$transaction(async (tx) => {
      // Mark slot as booked
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true }
      });

      // Create appointment
      return tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId,
          slotId: slot.id,
          status: 'CONFIRMED'
        }
      });
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
