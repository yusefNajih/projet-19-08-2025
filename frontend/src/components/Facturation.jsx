import React, { useState } from 'react';
import { Plus, Trash2, Download, Car } from 'lucide-react';
// import './Facturation.css';

const Facturation = () => {
  const [clientInfo, setClientInfo] = useState({
    nom: '',
    email: '',
    telephone: ''
  });

  const [vehicules, setVehicules] = useState([
    { id: 1, nom: '', nombreJours: 1, prixParJour: 0 }
  ]);

  const [tva, setTva] = useState(20);
  const [numeroFacture] = useState(`FACT-${Date.now().toString().slice(-6)}`);
  const [dateFacture] = useState(new Date().toLocaleDateString('fr-FR'));

  const entrepriseInfo = {
    nom: "AutoLoc Premium",
    adresse: "123 Avenue des Voitures, 75001 Paris",
    telephone: "01 23 45 67 89",
    email: "contact@autoloc-premium.fr"
  };

  const handleClientChange = (field, value) => {
    setClientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVehiculeChange = (id, field, value) => {
    setVehicules(prev => 
      prev.map(v => 
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  const ajouterVehicule = () => {
    const newId = Math.max(...vehicules.map(v => v.id)) + 1;
    setVehicules(prev => [
      ...prev,
      { id: newId, nom: '', nombreJours: 1, prixParJour: 0 }
    ]);
  };

  const supprimerVehicule = (id) => {
    if (vehicules.length > 1) {
      setVehicules(prev => prev.filter(v => v.id !== id));
    }
  };

  const calculerSousTotal = () => {
    return vehicules.reduce((total, v) => total + (v.nombreJours * v.prixParJour), 0);
  };

  const calculerTVA = () => {
    return (calculerSousTotal() * tva) / 100;
  };

  const calculerTotal = () => {
    return calculerSousTotal() + calculerTVA();
  };

  const handleDownloadPDF = async () => {
    const contract = document.getElementById("facturation-invoice");
    if (!contract) {
      console.error("error dans Facture content ");
      return;
    }
    contract.classList.add("force-simple-colors");
    try {
      await new Promise((res) => setTimeout(res, 100));
      // Charger le script html2pdf si non déjà présent
      function loadHtml2PdfScript() {
        return new Promise((resolve, reject) => {
          if (window.html2pdf) return resolve(window.html2pdf);
          // Correction du chemin pour Vite/React : placer html2pdf.bundle.min.js dans le dossier public et charger depuis /lib/
          let script = document.createElement("script");
          script.src = "/lib/html2pdf.bundle.min.js";
          script.onload = () => resolve(window.html2pdf);
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      const html2pdf = window.html2pdf || (await loadHtml2PdfScript());
      if (!html2pdf) {
        throw new Error("html2pdf.js non chargé");
      }
      html2pdf()
        .set({
          margin: 0,
          filename:`Facture.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(contract)
        .save()
        .catch((err) => {
          console.error("Erreur génération PDF :", err);
        })
        .finally(() => {
          contract.classList.remove("force-simple-colors");
        });
    } catch (err) {
      console.error("Erreur génération PDF :", err);
      contract.classList.remove("force-simple-colors");
    }
  };
  return (
    <div className="facturation-container">
      <div className="facturation-content">
        {/* Formulaire */}
          <div className="facturation-form">
          <div className="form-header">
            <Car className="form-icon" />
            <h2>Créer une Facture</h2>
          </div>

          {/* Informations Client */}
          <div className="form-section">
            <h3>Informations Client</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  value={clientInfo.nom}
                  onChange={(e) => handleClientChange('nom', e.target.value)}
                  placeholder="Nom du client"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => handleClientChange('email', e.target.value)}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={clientInfo.telephone}
                  onChange={(e) => handleClientChange('telephone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </div>

          {/* Véhicules */}
          <div className="form-section">
            <div className="section-header">
              <h3>Véhicules Loués</h3>
              <button
                type="button"
                onClick={ajouterVehicule}
                className="btn-add"
              >
                <Plus size={16} />
                Ajouter véhicule
              </button>
            </div>
            
            {vehicules.map((vehicule) => (
              <div key={vehicule.id} className="vehicule-row">
                <div className="vehicule-inputs">
                  <div className="form-group">
                    <label>Nom du véhicule</label>
                    <input
                      type="text"
                      value={vehicule.nom}
                      onChange={(e) => handleVehiculeChange(vehicule.id, 'nom', e.target.value)}
                      placeholder="Ex: Peugeot 308"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre de jours</label>
                    <input
                      type="number"
                      min="1"
                      value={vehicule.nombreJours}
                      onChange={(e) => handleVehiculeChange(vehicule.id, 'nombreJours', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Prix par jour (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={vehicule.prixParJour}
                      onChange={(e) => handleVehiculeChange(vehicule.id, 'prixParJour', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total (€)</label>
                    <input
                      type="text"
                      value={`${(vehicule.nombreJours * vehicule.prixParJour).toFixed(2)} €`}
                      disabled
                      className="total-input"
                    />
                  </div>
                </div>
                {vehicules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => supprimerVehicule(vehicule.id)}
                    className="btn-remove"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* TVA */}
          <div className="form-section">
            <div className="form-group tva-group">
              <label>TVA (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tva}
                onChange={(e) => setTva(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Bouton PDF */}
          <div className="form-actions">
            <button onClick={handleDownloadPDF} className="btn-pdf">
              <Download size={16} />
              Télécharger en PDF
            </button>
          </div>
          </div>
        {/* Facture */}
           <div className="facturation-invoice" id="facturation-invoice">
          <div className="invoice-header">
            <div className="company-info">
              <h1>{entrepriseInfo.nom}</h1>
              <div className="company-details">
                <p>{entrepriseInfo.adresse}</p>
                <p>Tél: {entrepriseInfo.telephone}</p>
                <p>Email: {entrepriseInfo.email}</p>
              </div>
            </div>
            <div className="invoice-logo">
              <Car size={60} className="logo-icon" />
            </div>
          </div>

          <div className="invoice-info">
            <div className="invoice-details">
              <h2>FACTURE</h2>
              <p><strong>N°:</strong> {numeroFacture}</p>
              <p><strong>Date:</strong> {dateFacture}</p>
            </div>
          </div>

          <div className="invoice-client">
            <h3>Facturé à:</h3>
            <div className="client-details">
              <p><strong>{clientInfo.nom || 'Nom du client'}</strong></p>
              <p>{clientInfo.email || 'Email du client'}</p>
              <p>{clientInfo.telephone || 'Téléphone du client'}</p>
            </div>
          </div>

          <div className="invoice-table">
            <table>
              <thead>
                <tr>
                  <th>Véhicule</th>
                  <th>Nombre de jours</th>
                  <th>Prix par jour</th>
                  <th>Total HT</th>
                </tr>
              </thead>
              <tbody>
                {vehicules.map((vehicule) => (
                  <tr key={vehicule.id}>
                    <td>{vehicule.nom || 'Véhicule non spécifié'}</td>
                    <td>{vehicule.nombreJours}</td>
                    <td>{vehicule.prixParJour.toFixed(2)} €</td>
                    <td>{(vehicule.nombreJours * vehicule.prixParJour).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-summary">
            <div className="summary-table">
              <div className="summary-row">
                <span>Sous-total HT:</span>
                <span>{calculerSousTotal().toFixed(2)} €</span>
              </div>
              <div className="summary-row">
                <span>TVA ({tva}%):</span>
                <span>{calculerTVA().toFixed(2)} €</span>
              </div>
              <div className="summary-row total-row">
                <span><strong>Total TTC:</strong></span>
                <span><strong>{calculerTotal().toFixed(2)} €</strong></span>
              </div>
            </div>
          </div>

          <div className="invoice-footer">
            <p>Merci pour votre confiance !</p>
            <p className="footer-note">
              Conditions de paiement : 30 jours à réception de facture
            </p>
          </div>
          </div>
      </div>
    </div>
  );
};

export default Facturation;