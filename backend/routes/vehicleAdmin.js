const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

// GET /api/vehicleAdmin/status
router.get('/status', [auth, authorize('admin')], async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 30);

    const result = vehicles.map(v => {
      // ... logique de statut administratif (copie depuis l’ancienne route admin-status) ...
      let insuranceStatus = 'Non renseignée';
      let insuranceAlert = '';
      if (v.documents?.insurance) {
        if (!v.documents.insurance.expiryDate) {
          insuranceStatus = 'Non renseignée';
        } else if (v.documents.insurance.expiryDate < now) {
          insuranceStatus = 'Expirée';
          insuranceAlert = '🚨 Assurance expirée';
        } else if (v.documents.insurance.expiryDate < soon) {
          insuranceStatus = 'Bientôt expirée';
          insuranceAlert = '⚠️ Assurance bientôt expirée';
        } else {
          insuranceStatus = 'Valide';
        }
      }
      // ... vignette et inspection idem ...
      let vignetteStatus = 'Non renseignée';
      let vignetteAlert = '';
      if (v.documents?.registration) {
        if (!v.documents.registration.expiryDate) {
          vignetteStatus = 'Non renseignée';
        } else if (v.documents.registration.expiryDate < now) {
          vignetteStatus = 'Expirée';
          vignetteAlert = '🚨 Vignette expirée';
        } else if (v.documents.registration.expiryDate < soon) {
          vignetteStatus = 'Bientôt expirée';
          vignetteAlert = '⚠️ Vignette bientôt expirée';
        } else {
          vignetteStatus = 'Valide';
        }
      }
      let inspectionStatus = 'Non renseignée';
      let inspectionAlert = '';
      if (v.documents?.inspection) {
        if (!v.documents.inspection.expiryDate) {
          inspectionStatus = 'Non renseignée';
        } else if (v.documents.inspection.expiryDate < now) {
          inspectionStatus = 'Expirée';
          inspectionAlert = '🚨 Visite technique expirée';
        } else if (v.documents.inspection.expiryDate < soon) {
          inspectionStatus = 'Bientôt expirée';
          inspectionAlert = '⚠️ Visite technique bientôt expirée';
        } else {
          inspectionStatus = 'Valide';
        }
      }
      let adminStatus = '🟢 Conforme';
      let adminAlert = '✅ Aucun problème';
      if ([insuranceStatus, vignetteStatus, inspectionStatus].includes('Expirée')) {
        adminStatus = '🔴 Non conforme';
        adminAlert = '🚨 Document expiré';
      } else if ([insuranceStatus, vignetteStatus, inspectionStatus].includes('Bientôt expirée')) {
        adminStatus = '🟡 À régulariser';
        adminAlert = '⚠️ Document bientôt expiré';
      }
      return {
        id: v._id,
        brand: v.brand,
        model: v.model,
        licensePlate: v.licensePlate,
        fuelType: v.fuelType,
        insurance: {
          company: v.documents?.insurance?.originalName || '',
          expiryDate: v.documents?.insurance?.expiryDate,
          status: insuranceStatus,
          alert: insuranceAlert
        },
        vignette: {
          expiryDate: v.documents?.registration?.expiryDate,
          status: vignetteStatus,
          alert: vignetteAlert
        },
        inspection: {
          expiryDate: v.documents?.inspection?.expiryDate,
          status: inspectionStatus,
          alert: inspectionAlert
        },
        adminStatus,
        adminAlert
      };
    });
    res.json(result);
  } catch (error) {
    console.error('Admin status vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/vehicleAdmin/:id/documents
router.put('/:id/documents', [auth, authorize('admin')], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Update insurance expiry
    if (req.body.insurance) {
      vehicle.documents.insurance = {
        ...vehicle.documents.insurance,
        ...req.body.insurance
      };
    }
    // Update registration (vignette) expiry
    if (req.body.vignette) {
      vehicle.documents.registration = {
        ...vehicle.documents.registration,
        ...req.body.vignette
      };
    }
    // Update inspection expiry
    if (req.body.inspection) {
      vehicle.documents.inspection = {
        ...vehicle.documents.inspection,
        ...req.body.inspection
      };
    }

    await vehicle.save();
    res.json({ message: 'Administrative documents updated', vehicle });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;