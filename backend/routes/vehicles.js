const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Vehicle = require("../models/Vehicle");
const { auth, authorize } = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

// @route   PUT /api/vehicles/:id/admin-status
// @desc    Update administrative document expiry dates for a vehicle
// @access  Private (Admin only)
router.put(
  "/:id/admin-status",
  [auth, authorize("admin")],
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle)
        return res.status(404).json({ message: "Vehicle not found" });

      // Update insurance expiry
      if (req.body.insurance) {
        vehicle.documents.insurance = {
          ...vehicle.documents.insurance,
          ...req.body.insurance,
        };
      }
      // Update registration (vignette) expiry
      if (req.body.vignette) {
        vehicle.documents.registration = {
          ...vehicle.documents.registration,
          ...req.body.vignette,
        };
      }
      // Update inspection expiry
      if (req.body.inspection) {
        vehicle.documents.inspection = {
          ...vehicle.documents.inspection,
          ...req.body.inspection,
        };
      }

      await vehicle.save();
      res.json({ message: "Administrative documents updated", vehicle });
    } catch (error) {
      console.error("Update admin status error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/vehicles
// @desc    Get all vehicles with filtering and pagination
// @access  Private
router.get(
  "/",
  auth,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["available", "rented", "maintenance", "out_of_service"])
      .withMessage("Invalid status"),
    query("brand").optional().isString().trim(),
    query("fuelType")
      .optional()
      .isIn(["essence", "diesel", "electric", "hybrid"])
      .withMessage("Invalid fuel type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.brand) filter.brand = new RegExp(req.query.brand, "i");
      if (req.query.fuelType) filter.fuelType = req.query.fuelType;
      if (req.query.search) {
        filter.$or = [
          { brand: new RegExp(req.query.search, "i") },
          { model: new RegExp(req.query.search, "i") },
          { licensePlate: new RegExp(req.query.search, "i") },
        ];
      }

      const vehicles = await Vehicle.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Vehicle.countDocuments(filter);

      res.json({
        vehicles,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      });
    } catch (error) {
      console.error("Get vehicles error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/vehicles/admin-status
// @desc    Get administrative status for all vehicles (for admin dashboard)
// @access  Private (Admin only)
router.get("/admin-status", [auth, authorize("admin")], async (req, res) => {
  try {
    // Log pour debug
    console.log("ADMIN-STATUS DEBUG:", {
      user: req.user,
      headers: req.headers,
      query: req.query,
    });

    const vehicles = await Vehicle.find();
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 30); // 30 jours d'alerte

    const result = vehicles.map((v) => {
      // Assurance
      let insuranceStatus = "Non renseignée";
      let insuranceAlert = "";
      if (v.documents?.insurance) {
        if (!v.documents.insurance.expiryDate) {
          insuranceStatus = "Non renseignée";
        } else if (v.documents.insurance.expiryDate < now) {
          insuranceStatus = "Expirée";
          insuranceAlert = "🚨 Assurance expirée";
        } else if (v.documents.insurance.expiryDate < soon) {
          insuranceStatus = "Bientôt expirée";
          insuranceAlert = "⚠️ Assurance bientôt expirée";
        } else {
          insuranceStatus = "Valide";
        }
      }

      // Vignette
      let vignetteStatus = "Non renseignée";
      let vignetteAlert = "";
      if (v.documents?.registration) {
        if (!v.documents.registration.expiryDate) {
          vignetteStatus = "Non renseignée";
        } else if (v.documents.registration.expiryDate < now) {
          vignetteStatus = "Expirée";
          vignetteAlert = "🚨 Vignette expirée";
        } else if (v.documents.registration.expiryDate < soon) {
          vignetteStatus = "Bientôt expirée";
          vignetteAlert = "⚠️ Vignette bientôt expirée";
        } else {
          vignetteStatus = "Valide";
        }
      }

      // Visite technique
      let inspectionStatus = "Non renseignée";
      let inspectionAlert = "";
      if (v.documents?.inspection) {
        if (!v.documents.inspection.expiryDate) {
          inspectionStatus = "Non renseignée";
        } else if (v.documents.inspection.expiryDate < now) {
          inspectionStatus = "Expirée";
          inspectionAlert = "🚨 Visite technique expirée";
        } else if (v.documents.inspection.expiryDate < soon) {
          inspectionStatus = "Bientôt expirée";
          inspectionAlert = "⚠️ Visite technique bientôt expirée";
        } else {
          inspectionStatus = "Valide";
        }
      }

      // Statut administratif global
      let adminStatus = "🟢 Conforme";
      let adminAlert = "✅ Aucun problème";
      if (
        [insuranceStatus, vignetteStatus, inspectionStatus].includes("Expirée")
      ) {
        adminStatus = "🔴 Non conforme";
        adminAlert = "🚨 Document expiré";
      } else if (
        [insuranceStatus, vignetteStatus, inspectionStatus].includes(
          "Bientôt expirée"
        )
      ) {
        adminStatus = "🟡 À régulariser";
        adminAlert = "⚠️ Document bientôt expiré";
      }

      return {
        id: v._id,
        vehicle: `${v.brand} ${v.model} ${v.year} – ${v.licensePlate}`,
        insurance: {
          company: v.documents?.insurance?.originalName || "",
          expiryDate: v.documents?.insurance?.expiryDate,
          status: insuranceStatus,
          alert: insuranceAlert,
        },
        vignette: {
          expiryDate: v.documents?.registration?.expiryDate,
          status: vignetteStatus,
          alert: vignetteAlert,
        },
        inspection: {
          expiryDate: v.documents?.inspection?.expiryDate,
          status: inspectionStatus,
          alert: inspectionAlert,
        },
        fuelType: v.fuelType,
        adminStatus,
        adminAlert,
      };
    });
    res.json(result);
  } catch (error) {
    console.error("Admin status vehicles error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (error) {
    console.error("Get vehicle error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/vehicles
// @desc    Create a new vehicle
// @access  Private (Manager/Admin only)
router.post(
  "/",
  auth,
  authorize("admin", "manager"),
  upload.single("image"),
  [
    body("brand").notEmpty().trim().withMessage("Brand is required"),
    body("model").notEmpty().trim().withMessage("Model is required"),
    body("year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Invalid year"),
    body("licensePlate")
      .notEmpty()
      .trim()
      .withMessage("License plate is required"),
    body("fuelType")
      .isIn(["essence", "diesel", "electric", "hybrid"])
      .withMessage("Invalid fuel type"),
    body("dailyPrice")
      .isFloat({ min: 0 })
      .withMessage("Daily price must be a positive number"),
    body("mileage")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive number"),
    body("color").optional().trim(),
    body("transmission")
      .optional()
      .isIn(["manual", "automatic"])
      .withMessage("Invalid transmission"),
    body("seats")
      .optional()
      .isInt({ min: 2, max: 50 })
      .withMessage("Seats must be between 2 and 50"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        brand,
        model,
        year,
        licensePlate,
        fuelType,
        dailyPrice,
        mileage,
        color,
        transmission,
        seats,
        notes,
      } = req.body;

      // Chemin de l'image
      const imagePath = req.file ? req.file.path : undefined;

      const vehicle = new Vehicle({
        brand,
        model,
        year,
        licensePlate: licensePlate.toUpperCase(),
        fuelType,
        dailyPrice,
        mileage,
        color,
        transmission,
        seats,
        notes,
        image: imagePath,
      });

      await vehicle.save();

      res.status(201).json({
        message: "Vehicle created successfully",
        vehicle,
      });
    } catch (error) {
      console.error("Create vehicle error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private (Manager/Admin only)
router.put(
  "/:id",
  auth,
  authorize("admin", "manager"),
  upload.single("image"),
  [
    body("brand")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Brand cannot be empty"),
    body("model")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Model cannot be empty"),
    body("year")
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Invalid year"),
    body("licensePlate")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("License plate cannot be empty"),
    body("fuelType")
      .optional()
      .isIn(["essence", "diesel", "electric", "hybrid"])
      .withMessage("Invalid fuel type"),
    body("dailyPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Daily price must be a positive number"),
    body("mileage")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive number"),
    body("status")
      .optional()
      .isIn(["available", "rented", "maintenance", "out_of_service"])
      .withMessage("Invalid status"),
    body("color").optional().trim(),
    body("transmission")
      .optional()
      .isIn(["manual", "automatic"])
      .withMessage("Invalid transmission"),
    body("seats")
      .optional()
      .isInt({ min: 2, max: 50 })
      .withMessage("Seats must be between 2 and 50"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const vehicle = await Vehicle.findById(req.params.id);

      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // If license plate is being updated, check for duplicates
      if (
        req.body.licensePlate &&
        req.body.licensePlate.toUpperCase() !== vehicle.licensePlate
      ) {
        const existingVehicle = await Vehicle.findOne({
          licensePlate: req.body.licensePlate.toUpperCase(),
          _id: { $ne: req.params.id },
        });

        if (existingVehicle) {
          return res.status(400).json({
            message: "Vehicle with this license plate already exists",
          });
        }
      }

      // Update fields
      Object.keys(req.body).forEach((key) => {
        if (key === "licensePlate") {
          vehicle[key] = req.body[key].toUpperCase();
        } else {
          vehicle[key] = req.body[key];
        }
      });

      // Si une nouvelle image est envoyée, mettre à jour le champ image
      if (req.file) {
        vehicle.image = req.file.path;
      }

      await vehicle.save();

      res.json({
        message: "Vehicle updated successfully",
        vehicle,
      });
    } catch (error) {
      console.error("Update vehicle error:", error);
      if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle
// @access  Private (Admin only)
router.delete("/:id", [auth, authorize("admin")], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if vehicle has active reservations
    const Reservation = require("../models/Reservation");
    const activeReservations = await Reservation.countDocuments({
      vehicle: req.params.id,
      status: { $in: ["confirmed", "active"] },
    });

    if (activeReservations > 0) {
      return res.status(400).json({
        message: "Cannot delete vehicle with active reservations",
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/vehicles/:id/check-availability
// @desc    Check vehicle availability for date range
// @access  Private
router.get(
  "/:id/check-availability",
  auth,
  [
    query("startDate").isISO8601().withMessage("Invalid start date"),
    query("endDate").isISO8601().withMessage("Invalid end date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startDate, endDate } = req.query;
      const vehicleId = req.params.id;

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if vehicle is available (not in maintenance or out of service)
      if (
        vehicle.status === "maintenance" ||
        vehicle.status === "out_of_service"
      ) {
        return res.json({
          available: false,
          reason: `Vehicle is currently ${vehicle.status.replace("_", " ")}`,
        });
      }

      // Check for conflicting reservations
      const Reservation = require("../models/Reservation");
      const conflict = await Reservation.checkConflict(
        vehicleId,
        new Date(startDate),
        new Date(endDate)
      );

      if (conflict) {
        return res.json({
          available: false,
          reason: "Vehicle is already reserved for this period",
          conflictingReservation: conflict.reservationNumber,
        });
      }

      res.json({
        available: true,
        vehicle: {
          id: vehicle._id,
          brand: vehicle.brand,
          model: vehicle.model,
          dailyPrice: vehicle.dailyPrice,
        },
      });
    } catch (error) {
      console.error("Check availability error:", error);
      if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
