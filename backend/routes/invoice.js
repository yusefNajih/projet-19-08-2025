const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const Client = require('../models/Client');
const Vehicle = require('../models/Vehicle');
const PDFDocument = require('pdfkit');


// Générer une facture PDF professionnelle pour une réservation
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client')
      .populate('vehicle');
    if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });

    // Paramètres agence (à personnaliser si besoin)
    const agency = {
      name: 'AUTO-RENT',
      address: 'Boulevard Hassan II, Casablanca – Maroc',
      phone: '+212 6 12 34 56 78',
      email: 'contact@auto-rent.ma',
      rc: '123456',
      if: '7891011',
      ice: '0011223344',
    };

    // Création du PDF avec police arabe/unicode
    const doc = new PDFDocument({ margin: 40 });
    doc.registerFont('arabic', __dirname + '/../fonts/NotoNaskhArabic-Regular.ttf');
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=facture_${reservation.reservationNumber}.pdf`,
        'Content-Length': pdfData.length
      });
      res.end(pdfData);
    });

    // En-tête agence (sans emoji, police standard)
    doc
      .font('arabic').fontSize(18).fillColor('#1a237e').text(`Facture N° FAC-${reservation.reservationNumber.replace('RES', 'FAC')}`, { align: 'right' })
      .moveDown(0.5)
      .font('arabic').fontSize(16).fillColor('#222').text(agency.name, { align: 'left' })
      .font('arabic').fontSize(10).fillColor('#444').text(`Adresse : ${agency.address}`)
      .font('arabic').text(`Téléphone : ${agency.phone}   Email : ${agency.email}`)
      .font('arabic').text(`RC: ${agency.rc} – IF: ${agency.if} – ICE: ${agency.ice}`)
      .moveDown();

    // Ligne séparatrice
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#1a237e');
    doc.moveDown();

    // Bloc client
    const client = reservation.client;
    doc.font('arabic').fontSize(12).fillColor('#1a237e').text('Informations Client', { underline: true });
    doc.font('arabic').fontSize(10).fillColor('#222').text(`Nom & Prénom : ${client.firstName} ${client.lastName}`);
    if (client.address && (client.address.street || client.address.city)) {
      doc.font('arabic').text(`Adresse : ${client.address.street || ''} ${client.address.city || ''} ${client.address.postalCode || ''}`);
    }
    doc.font('arabic').text(`Téléphone : ${client.phone}`);
    doc.font('arabic').text(`Email : ${client.email}`);
    if (client.nationalId) doc.font('arabic').text(`CIN / Passeport : ${client.nationalId}`);
    if (client.licenseNumber) doc.font('arabic').text(`Permis de conduire : ${client.licenseNumber}` + (client.licenseExpiryDate ? ` (Valide jusqu’au ${new Date(client.licenseExpiryDate).toLocaleDateString('fr-FR')})` : ''));
    doc.moveDown();

    // Bloc véhicule
    const vehicle = reservation.vehicle;
    doc.font('arabic').fontSize(12).fillColor('#1a237e').text('Informations Véhicule', { underline: true });
    doc.font('arabic').fontSize(10).fillColor('#222').text(`Marque / Modèle : ${vehicle.brand} ${vehicle.model}`);
    doc.font('arabic').text(`Immatriculation : ${vehicle.licensePlate}`);
    if (vehicle.color) doc.font('arabic').text(`Couleur : ${vehicle.color}`);
    if (reservation.mileageStart != null) doc.font('arabic').text(`Kilométrage départ : ${reservation.mileageStart} km`);
    if (reservation.mileageEnd != null) doc.font('arabic').text(`Kilométrage retour : ${reservation.mileageEnd} km`);
    if (reservation.fuelLevelStart) doc.font('arabic').text(`Carburant départ : ${reservation.fuelLevelStart}`);
    if (reservation.fuelLevelEnd) doc.font('arabic').text(`Carburant retour : ${reservation.fuelLevelEnd}`);
    if (reservation.notes) doc.font('arabic').text(`État du véhicule : ${reservation.notes}`);
    doc.moveDown();

    // Bloc location
    doc.font('arabic').fontSize(12).fillColor('#1a237e').text('Détails de Location', { underline: true });
    doc.font('arabic').fontSize(10).fillColor('#222')
      .text(`Date de début : ${new Date(reservation.startDate).toLocaleDateString('fr-FR')} ${reservation.actualStartDate ? ('– ' + new Date(reservation.actualStartDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })) : ''}`)
      .text(`Date de fin : ${new Date(reservation.endDate).toLocaleDateString('fr-FR')} ${reservation.actualEndDate ? ('– ' + new Date(reservation.actualEndDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })) : ''}`)
      .text(`Durée totale : ${reservation.totalDays} jour(s)`);
    if (reservation.pickupLocation) doc.font('arabic').text(`Lieu de prise en charge : ${reservation.pickupLocation}`);
    if (reservation.returnLocation) doc.font('arabic').text(`Lieu de restitution : ${reservation.returnLocation}`);
    doc.moveDown();


    // Bloc montant avec caution
    doc.font('arabic').fontSize(12).fillColor('#1a237e').text('Récapitulatif', { underline: true });
    doc.font('arabic').fontSize(10).fillColor('#222').text(`Montant de base : ${reservation.baseAmount} DH`);
    if (reservation.additionalFees && reservation.additionalFees.length > 0) {
      doc.font('arabic').text('Frais supplémentaires :');
      reservation.additionalFees.forEach(fee => {
        doc.font('arabic').text(`- ${fee.description} : ${fee.amount} DH`);
      });
    }

    // Affichage de la caution déposée
    if (reservation.deposit && reservation.deposit.amount > 0) {
      doc.font('arabic').text(`Caution déposée : ${reservation.deposit.amount} DH`);
      if (reservation.deposit.paid) {
        const dateRemb = reservation.deposit.paidDate ? new Date(reservation.deposit.paidDate).toLocaleDateString('fr-FR') : '';
        doc.font('arabic').fillColor('#388e3c').text(`Caution remboursée${dateRemb ? ' le ' + dateRemb : ''}`);
        doc.font('arabic').fillColor('#222');
      } else {
        doc.font('arabic').fillColor('#e65100').text('Caution non remboursée');
        doc.font('arabic').fillColor('#222');
      }
    }

    doc.font('arabic').text(`Total à payer : ${reservation.totalAmount} DH`, { underline: true });

    // Phrase de satisfaction client
    doc.moveDown(1);
    doc.font('arabic').fontSize(11).fillColor('#388e3c').text('Le client a payé le montant indiqué pour sa satisfaction et la bonne exécution du service.', { align: 'left' });

    // Signatures (moins d'espace)
    doc.moveDown(1);
    doc.font('arabic').fontSize(11).fillColor('#222');
    const y = doc.y;
    doc.text('Signature du client', 60, y, { align: 'left' });
    doc.text('Signature du responsable de location', doc.page.width - 260, y, { align: 'left' });

    // Footer (moins d'espace)
    doc.moveDown(1);
    doc.font('arabic').fontSize(9).fillColor('#888').text('Merci pour votre confiance. Cette facture fait office de contrat de location.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la génération de la facture' });
  }
});

module.exports = router;
