import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  addVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';

const router = express.Router();

router.use(protect); // All vehicle routes require authentication

router.route('/')
  .post(authorize('owner', 'provider', 'valet'), addVehicle)
  .get(getVehicles);

router.route('/:id')
  .get(getVehicleById)
  .put(updateVehicle)
  .delete(deleteVehicle);

export default router;
