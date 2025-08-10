const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const PDFDocument = require('pdfkit');

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const s = new Date(data.startDate);
    const e = new Date(data.endDate);
    const days = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
    data.total = days * (Number(data.pricePerDay) || 0);
    const c = new Contract(data);
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const c = await Contract.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrat_${c._id}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('CONTRAT DE LOCATION DE VEHICULE', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Société : Cherkaoui Auto Rent`);
    doc.text(`Locataire : ${c.clientFirstName} ${c.clientName}, né(e) le ${c.birthDate} à ${c.birthPlace}`);
    doc.text(`Adresse : ${c.address}`);
    doc.text(`Téléphone : ${c.phone} | Email : ${c.email}`).moveDown();
    doc.text(`Véhicule : ${c.vehicle.make} ${c.vehicle.model} - ${c.vehicle.plate}`);
    doc.text(`Location : du ${c.startDate} au ${c.endDate}`);
    doc.text(`Prix/jour : ${c.pricePerDay} DH | Total : ${c.total} DH | Caution : ${c.cautionAmount} DH`).moveDown();

    // Clauses légales extraites et adaptées du contrat fourni
    const clauses = [
      '1 - Parties et objet du contrat : ...',
      '2 - Conducteurs agréés : ...',
      '4 - Conditions d’utilisation : ...',
      '5 - Assurance : ...',
      '6 - État du véhicule : ...',
      '7 - Entretien : ...',
      '8 - Sinistre : ...',
      '9 - Durée : ...',
      '10 - Restitution : ...',
      '11 - Prix : ...',
      '12 - Dépôt de garantie : ...',
      '13 - Clause pénale : ...',
      '14 - Réserve de propriété : ...',
      '15 - Droit de rétention : ...',
      '16 - Clause de résiliation : ...',
      '17 - Attribution de compétence : ...',
      '18 - Élection de domicile : ...'
    ];
    clauses.forEach(clause => {
      doc.moveDown().fontSize(11).text(clause, { align: 'justify' });
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const Contract = require('../models/Contract');
// const PDFDocument = require('pdfkit');

// router.post('/', async (req, res) => {
//   try {
//     const data = req.body;
//     data.total = calculateTotal(data);
//     const c = new Contract(data);
//     await c.save();
//     res.status(201).json(c);
//   } catch (err) {
//     res.status(500).json({ error: 'server error' });
//   }
// });

// router.get('/:id', async (req, res) => {
//   try {
//     const c = await Contract.findById(req.params.id);
//     if (!c) return res.status(404).json({ error: 'Not found' });
//     res.json(c);
//   } catch (err) {
//     res.status(500).json({ error: 'server error' });
//   }
// });

// router.get('/:id/pdf', async (req, res) => {
//   try {
//     const c = await Contract.findById(req.params.id);
//     if (!c) return res.status(404).json({ error: 'Not found' });

//     const doc = new PDFDocument({ margin: 50 });
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=contrat_${c._id}.pdf`);
//     doc.pipe(res);

//     doc.fontSize(20).text('Contrat de location - AutoRent', { align: 'center' }).moveDown();
//     doc.fontSize(12).text(`Client: ${c.clientName}`);
//     doc.text(`Email: ${c.clientEmail}`);
//     doc.text(`Téléphone: ${c.clientPhone}`).moveDown();
//     doc.text(`Véhicule: ${c.vehicle.make} ${c.vehicle.model}`);
//     doc.text(`Plaque: ${c.vehicle.plate}`).moveDown();
//     doc.text(`Début: ${formatDate(c.startDate)}`);
//     doc.text(`Fin: ${formatDate(c.endDate)}`).moveDown();
//     doc.text(`Prix / jour: ${c.pricePerDay} DH`);
//     doc.text(`Total: ${c.total} DH`).moveDown();
//     if (c.notes) doc.text(`Notes: ${c.notes}`).moveDown();
//     doc.text('Signature client: ____________________');
//     doc.end();
//   } catch (err) {
//     res.status(500).json({ error: 'server error' });
//   }
// });

// function calculateTotal(data) {
//   const s = new Date(data.startDate);
//   const e = new Date(data.endDate);
//   const days = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
//   return days * (Number(data.pricePerDay) || 0);
// }

// function formatDate(d) {
//   return new Date(d).toLocaleDateString('fr-FR');
// }

// module.exports = router;
