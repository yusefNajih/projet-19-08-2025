import React, { useState } from "react";
import logo from "../assets/logo.png";
import cache from "../assets/cache.png"
// import html2pdf from "html2pdf.js";

const ContractGenerator = () => {
  const [formData, setFormData] = useState({
    // Données du loueur
    loueurAdresse: "",
    loueurVille: "",
    loueurRC: "",
    loueurPatente: "",
    loueurICE: "",
    loueurIF: "",
    loueurRepresentant: "",
    loueurTel: "",

    // Données du locataire
    locataireNomPrenom: "",
    locataireCIN: "",
    locataireNaissance: "",
    locataireAdresse: "",
    locataireVille: "",
    locataireTel: "",
    locatairePermis: "",
    locatairePermisDate: "",
    locataireNationalite: "",

    // Données du véhicule
    vehiculeMarque: "",
    vehiculeImmat: "",
    vehiculeChassis: "",
    vehiculeKm: "",
    vehiculeCarburant: "",
    vehiculeEtat: "",

    // Données de location
    dateDebut: "",
    dateFin: "",
    lieuPrise: "",
    lieuRestitution: "",

    // Tarification
    tarifJournalier: "",
    kmInclus: "",
    tarifKmSupp: "",
    franchiseAssurance: "",
    depotGarantie: "",
    montantTotal: "",

    // Carburant
    tarifCarburant: "",

    // Conducteur supplémentaire
    conducteurSupp: "",
    conducteurSuppPermis: "",
    conducteurSuppTarif: "",
    conducteurSuppTel: "",

    // Options
    assuranceBrisGlace: false,
    assuranceBrisGlaceTarif: "",
    gps: false,
    gpsTarif: "",
    siegeEnfant: false,
    siegeEnfantTarif: "",
    chauffeur: false,
    chauffeurTarif: "",

    // Lieu et date de signature
    lieuSignature: "",
    dateSignature: "",

    // Tribunal compétent
    tribunalCompetent: "",

    // Contact
    contactTel: "",
    contactEmail: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const contract = document.getElementById("contract-content");
    if (!contract) {
      console.error("error dans contract content ");
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
          filename: "Contrat.pdf",
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
    <div className="contract-generator">
      <div className="form-section">
        <h2>Informations du contrat</h2>
        <div className="form-actions">
          <button onClick={handlePrint} className="btn btn-primary">
            Imprimer
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="btn btn-secondary"
          >
            Télécharger PDF
          </button>
        </div>

        <form className="contract-form">
          {/* Informations Loueur et Locataire sur la même ligne */}
          <div className="form-row-double">
            {/* <div className="form-group half-width">
        <h3>Informations du loueur</h3>
        <div className="form-row">
          <input
            type="text"
            name="loueurRC"
            placeholder="Registre de Commerce"
            value={formData.loueurRC}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            name="loueurRepresentant"
            placeholder="Représenté par"
            value={formData.loueurRepresentant}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="loueurTel"
            placeholder="Téléphone du loueur"
            value={formData.loueurTel}
            onChange={handleInputChange}
          />
        </div>
      </div> */}

            <div className="form-group half-width">
              <h3>Informations du locataire</h3>
              <div className="form-row">
                <input
                  type="text"
                  name="locataireNomPrenom"
                  placeholder="Nom et prénom"
                  value={formData.locataireNomPrenom}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="locataireCIN"
                  placeholder="N° CIN/Passeport"
                  value={formData.locataireCIN}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="tel"
                  name="locataireTel"
                  placeholder="Téléphone du locataire"
                  value={formData.locataireTel}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="locatairePermis"
                  placeholder="N° de permis de conduire"
                  value={formData.locatairePermis}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="date"
                  name="locatairePermisDate"
                  placeholder="Date d'obtention du permis"
                  value={formData.locatairePermisDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group half-width">
              <h3>Conducteur supplémentaire</h3>
              <div className="form-row">
                <input
                  type="text"
                  name="conducteurSupp"
                  placeholder="Nom complet du conducteur supplémentaire"
                  value={formData.conducteurSupp}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="conducteurSuppPermis"
                  placeholder="N° permis conducteur supplémentaire"
                  value={formData.conducteurSuppPermis}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="tel"
                  name="conducteurSupplocataireTel"
                  placeholder="Téléphone du locataire supplémentaire"
                  value={formData.conducteurSupplocataireTel}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Véhicule et Conditions tarifaires sur la même ligne */}
          <div className="form-row-double">
            <div className="form-group half-width">
              <h3>Informations du véhicule</h3>
              <div className="form-row">
                <input
                  type="text"
                  name="vehiculeMarque"
                  placeholder="Marque et modèle"
                  value={formData.vehiculeMarque}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="vehiculeImmat"
                  placeholder="N° d'immatriculation"
                  value={formData.vehiculeImmat}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="number"
                  name="vehiculeKm"
                  placeholder="Kilométrage au départ"
                  value={formData.vehiculeKm}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group half-width">
              <h3>Conditions tarifaires</h3>
              <div className="form-row">
                <input
                  type="number"
                  name="depotGarantie"
                  placeholder="Dépôt de garantie (DH)"
                  value={formData.depotGarantie}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="number"
                  name="prixParJour"
                  placeholder="Prix par jour (DH)"
                  value={formData.prixParJour}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="nombreJours"
                  placeholder="Nombre de jours"
                  value={formData.nombreJours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="number"
                  name="montantTotal"
                  placeholder="Montant total TTC (DH)"
                  value={
                    (parseFloat(formData.prixParJour) || 0) *
                    (parseInt(formData.nombreJours) || 0)
                  }
                  onChange={handleInputChange}
                  readOnly
                  style={{ backgroundColor: "#f9f9f9" }}
                />
              </div>
            </div>
          </div>

          {/* Conducteur supplémentaire et Signature sur la même ligne */}
          <div className="form-row-double">
            <div className="form-group half-width">
              <h3>DURÉE ET LIEU DE LA LOCATION</h3>
              <div className="form-row">
                <input
                  type="text"
                  name="lieuPrise"
                  placeholder="Lieu de Depart"
                  value={formData.lieuPrise}
                  onChange={handleInputChange}
                />
                <input
                  type="date"
                  name="dateDebut"
                  placeholder="Date de signature"
                  value={formData.dateDebut}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="lieuRestitution"
                  placeholder="Lieu de Retour"
                  value={formData.lieuRestitution}
                  onChange={handleInputChange}
                />
                <input
                  type="Date"
                  name="dateFin"
                  placeholder="Date de Retour"
                  value={formData.dateFin}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <hr className="separtor" />

      <div className="contract-preview" id="contract-content">
        <div className="contract-header">
          <h1>
            <strong>CONTRAT</strong>
          </h1>
          <div className="LOGO">
            <img src={logo} alt="logo" />
          </div>
          <h2>STE CHERKAOUI AUTO RENT</h2>
        </div>

        <div className="contract-section">
          <div className="locataire">
            <div className="party-section">
              <h4>
                {" "}
                <strong>Informations Société :</strong>
              </h4>
              <ul>
                <li>
                  <strong>Raison sociale :</strong> CHERKAOUI AUTO RENT
                </li>
                <li>
                  <strong>Registre de Commerce :</strong>{" "}
                  {formData.loueurRC || "________________________"}
                </li>
                <li>
                  <strong>Représenté par : </strong>Cherkaoui Bartote{" "}
                </li>
                <li>
                  <strong>Tél :</strong> +212 6 45 84 86 86
                </li>
                <li>
                  <strong>Email :</strong> Cherkaoui.autorent@gmail.com
                </li>
              </ul>
            </div>
            <div className="party-section">
              <h4>
                <strong>Infomations Locataire:</strong>
              </h4>
              <ul>
                <li>
                  <strong>Nom et prénom :</strong>{" "}
                  {formData.locataireNomPrenom || "________________________"}
                </li>
                <li>
                  <strong>N° CIN/Passeport :</strong>{" "}
                  {formData.locataireCIN || "________________________"}
                </li>
                <li>
                  <strong>N° de téléphone :</strong>{" "}
                  {formData.locataireTel || "________________________"}
                </li>
                <li>
                  <strong>N° de permis de conduire :</strong>{" "}
                  {formData.locatairePermis || "________________________"}
                </li>
                <li>
                  <strong>Date d'obtention du permis :</strong>{" "}
                  {formData.locatairePermisDate || "________________________"}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="contract-section">
          <div className="locataire">
            <div className="party-section">
              <h4>VÉHICULE LOUÉ :</h4>
              <ul>
                <li>
                  <strong>Marque et modèle :</strong>{" "}
                  {formData.vehiculeMarque || ""}
                </li>
                <li>
                  <strong>N° d'immatriculation :</strong>{" "}
                  {formData.vehiculeImmat || ""}
                </li>
                <li>
                  <strong>Kilométrage au départ :</strong>{" "}
                  {formData.vehiculeKm || ""} km
                </li>
              </ul>
            </div>
            <div className="party-section">
              <h3>Conducteurs supplémentaires</h3>

              <ul>
                <li>
                  <strong>Nom et prénom:</strong>{" "}
                  {formData.conducteurSupp || ""}
                </li>
                <li>
                  <strong>N° permis :</strong>{" "}
                  {formData.conducteurSuppPermis || ""}
                </li>
                <li>
                  <strong>Tél :</strong>{" "}
                  {formData.conducteurSupplocataireTel || ""}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="contract-section">
          <div className="locataire">
            <div className="party-section">
              <h3> DURÉE ET LIEU DE LA LOCATION</h3>

              <ul>
                <li>
                  <strong>Date et heure de début :</strong>{" "}
                  {formData.dateDebut || ""}
                </li>
                <li>
                  <strong>Date et heure de fin prévue :</strong>{" "}
                  {formData.dateFin || ""}
                </li>
                <li>
                  <strong>Lieu de prise en charge :</strong>{" "}
                  {formData.lieuPrise || ""}
                </li>
                <li>
                  <strong>Lieu de restitution :</strong>{" "}
                  {formData.lieuRestitution || ""}
                </li>
              </ul>
            </div>
            <div className="party-section">
              <h3> CONDITIONS TARIFAIRES</h3>
              <ul>
                <li>
                  <strong>Tarif journalier :</strong>{" "}
                  {formData.prixParJour || ""} DH/jour
                </li>
                <li>
                  <strong>Dépôt de garantie :</strong>{" "}
                  {formData.depotGarantie || ""} DH
                </li>
                {/* <li>
                  <strong>Taxe sur la valeur ajoutée (TVA 20%) :</strong>{" "}
                  Incluse/Non incluse
                </li> */}
              </ul>
              <p>
                <strong>MONTANT TOTAL TTC :</strong>{" "}
                {(parseFloat(formData.prixParJour) || 0) *
                  (parseInt(formData.nombreJours) || 0) || ""}{" "}
                DH
              </p>
            </div>
          </div>
        </div>
        <div className="contract-section">
          <div className="party-section-loi">
            <p>
              <strong>
                <i>
                  * Le locataire est le seul responsable de délits
                  contraventions de la circulation routière.
                  <br />
                </i>
                <span
                  style={{
                    direction: "rtl",
                    fontFamily: "Noto Naskh Arabic, serif",
                  }}
                >
                  .المستأجر هو المسؤول الوحيد عن المخالفات المرورية*
                </span>
              </strong>
            </p>
          </div>
        </div>
        {/* signature */}
        <div className="contract-section signature-section" >

          <div className="locataire-section" style={{ width: "45%" }}>
            <div> 
              <p><i>Je déclare avoir pris connaissance des conditions générales mentionnées dans
             le contrat de location de voiture (au verso) que j'accepte sans réserve</i></p>
         
              <strong>Lieu :</strong> {formData.lieuPrise || "________________"}<br />
              <strong>Date :</strong> {formData.dateDebut || "________________"}
              </div>
            
           
            
          </div>

          <div className="locataire-section" >
            
            <div> 
              {/* <img src={cache} alt="cache" /> */}
            </div>
          </div>

        </div>


      </div>
    </div>
  );
};

export default ContractGenerator;
