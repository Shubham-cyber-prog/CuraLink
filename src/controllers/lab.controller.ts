import { Request, Response, NextFunction } from 'express';
import { labService } from '../services/lab.service';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class LabController {
  getPackages(req: Request, res: Response, next: NextFunction): void {
    try {
      const category = req.query.category as string | undefined;
      const packages = labService.getPackages(category);
      res.status(200).json({
        success: true,
        data: packages,
      });
    } catch (error) {
      next(error);
    }
  }

  getPackageById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = String(req.params.id);
      const pkg = labService.getPackageById(id);
      if (!pkg) {
        throw new NotFoundError('Lab package not found');
      }
      res.status(200).json({
        success: true,
        data: pkg,
      });
    } catch (error) {
      next(error);
    }
  }

  createBooking(req: Request, res: Response, next: NextFunction): void {
    try {
      const userId = req.user!.id;
      const {
        patientName,
        patientPhone,
        packageId,
        collectionAddress,
        collectionCity,
        collectionDate,
        collectionSlot,
        paymentMethod,
      } = req.body;

      if (!packageId) {
        throw new BadRequestError('Package ID is required');
      }
      if (!collectionAddress || collectionAddress.trim().length < 5) {
        throw new BadRequestError('Full sample collection address is required');
      }
      if (!collectionDate || !collectionSlot) {
        throw new BadRequestError('Collection date and time slot are required');
      }

      const booking = labService.createBooking({
        userId,
        patientName: patientName || req.user?.name || 'Valued Patient',
        patientPhone: patientPhone || (req.user as any)?.phone || '+91 9876543210',
        packageId,
        collectionAddress: collectionAddress.trim(),
        collectionCity,
        collectionDate,
        collectionSlot,
        paymentMethod: paymentMethod || 'UPI',
      });

      res.status(201).json({
        success: true,
        message: 'Lab sample collection booked successfully. Phlebotomist assigned.',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  getMyBookings(req: Request, res: Response, next: NextFunction): void {
    try {
      const userId = req.user!.id;
      const bookings = labService.getUserBookings(userId);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  getBookingById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = String(req.params.id);
      const userId = req.user!.id;
      const booking = labService.getBookingById(id, userId);
      if (!booking) {
        throw new NotFoundError('Booking not found');
      }
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  cancelBooking(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = String(req.params.id);
      const userId = req.user!.id;
      const cancelled = labService.cancelBooking(id, userId);
      if (!cancelled) {
        throw new NotFoundError('Booking not found or already cancelled');
      }
      res.status(200).json({
        success: true,
        message: 'Lab test collection cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const labController = new LabController();
