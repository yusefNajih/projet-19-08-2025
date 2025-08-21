import React, { useState } from 'react';

// import html2pdf from "html2pdf.js";

const ContractGenerator = () => {
  const [formData, setFormData] = useState({
    // Données du loueur
    loueurAdresse: '',
    loueurVille: '',
    loueurRC: '',
    loueurPatente: '',
    loueurICE: '',
    loueurIF: '',
    loueurRepresentant: '',
    loueurTel: '',
    
    // Données du locataire
    locataireNomPrenom: '',
    locataireCIN: '',
    locataireNaissance: '',
    locataireAdresse: '',
    locataireVille: '',
    locataireTel: '',
    locatairePermis: '',
    locatairePermisDate: '',
    locataireNationalite: '',
    
    // Données du véhicule
    vehiculeMarque: '',
    vehiculeImmat: '',
    vehiculeChassis: '',
    vehiculeKm: '',
    vehiculeCarburant: '',
    vehiculeEtat: '',
    
    // Données de location
    dateDebut: '',
    dateFin: '',
    lieuPrise: '',
    lieuRestitution: '',
    
    // Tarification
    tarifJournalier: '',
    kmInclus: '',
    tarifKmSupp: '',
    franchiseAssurance: '',
    depotGarantie: '',
    montantTotal: '',
    
    // Carburant
    tarifCarburant: '',
    
    // Conducteur supplémentaire
    conducteurSupp: '',
    conducteurSuppPermis: '',
    conducteurSuppTarif: '',
    
    // Options
    assuranceBrisGlace: false,
    assuranceBrisGlaceTarif: '',
    gps: false,
    gpsTarif: '',
    siegeEnfant: false,
    siegeEnfantTarif: '',
    chauffeur: false,
    chauffeurTarif: '',
    
    // Lieu et date de signature
    lieuSignature: '',
    dateSignature: '',
    
    // Tribunal compétent
    tribunalCompetent: '',
    
    // Contact
    contactTel: '',
    contactEmail: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePrint = () => {
    window.print();
  };




const handleDownloadPDF = async () => {
  const contract = document.getElementById("contract-content");
  if (!contract) {
    console.error('error dans contract content ');
    return;
  }
  contract.classList.add("force-simple-colors");
  try {
    await new Promise(res => setTimeout(res, 100));
    // Charger le script html2pdf si non déjà présent
    function loadHtml2PdfScript() {
      return new Promise((resolve, reject) => {
        if (window.html2pdf) return resolve(window.html2pdf);
        // Correction du chemin pour Vite/React : placer html2pdf.bundle.min.js dans le dossier public et charger depuis /lib/
        let script = document.createElement('script');
        script.src = '/lib/html2pdf.bundle.min.js';
        script.onload = () => resolve(window.html2pdf);
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }
    const html2pdf = window.html2pdf || await loadHtml2PdfScript();
    if (!html2pdf) {
      throw new Error('html2pdf.js non chargé');
    }
    html2pdf()
      .set({
        margin:       0,
        filename:     'Contrat.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      })
      .from(contract)
      .save()
      .catch(err => {
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
    <button type="button" onClick={handleDownloadPDF} className="btn btn-secondary">
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
            value={(parseFloat(formData.prixParJour) || 0) * (parseInt(formData.nombreJours) || 0)}
            onChange={handleInputChange}
            readOnly
            style={{ backgroundColor: '#f9f9f9' }}
          />
        </div>
      </div>
    </div>

    {/* Conducteur supplémentaire et Signature sur la même ligne */}
    <div className="form-row-double">
     

      <div className="form-group half-width">
        <h3>Signature et contact</h3>
        <div className="form-row">
          <input
            type="text"
            name="lieuSignature"
            placeholder="Lieu de signature"
            value={formData.lieuSignature}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="dateSignature"
            placeholder="Date de signature"
            value={formData.dateSignature}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-row">
          <input
            type="tel"
            name="contactTel"
            placeholder="Téléphone de contact"
            value={formData.contactTel}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="contactEmail"
            placeholder="Email de contact"
            value="Cherkaoui.autorent@gmail.com"
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  </form>
</div>
      
    
      <hr className="separtor"/>
      <div className="contract-preview" id="contract-content">
        <div className="contract-header">
          <h1>CONTRAT DE LOCATION DE VÉHICULE</h1>
          <h2>STE CHERKAOUI AUTO RENT</h2>
        </div>

        <div className="contract-section">
          <h3>PARTIES CONTRACTANTES</h3>
          
          <div className="party-section">
            <h4> <strong>LOUEUR :</strong></h4>
            <ul>
              <li><strong>Raison sociale :</strong> CHERKAOUI AUTO RENT</li>
              <li><strong>Registre de Commerce :</strong> {formData.loueurRC || '________________________'}</li>
              <li><strong>Représenté par :</strong> {formData.loueurRepresentant || '________________________'}</li>
              <li><strong>Tél :</strong> +212 6 45 84 86 86</li>
            </ul>
          </div>

          <div className="party-section">
            <h4><strong>LOCATAIRE :</strong></h4>
            <ul>
              <li><strong>Nom et prénom :</strong> {formData.locataireNomPrenom || '________________________'}</li>
              <li><strong>N° CIN/Passeport :</strong> {formData.locataireCIN || '________________________'}</li>
              <li><strong>N° de téléphone :</strong> {formData.locataireTel || '________________________'}</li>
              <li><strong>N° de permis de conduire :</strong> {formData.locatairePermis || '________________________'}</li>
              <li><strong>Date d'obtention du permis :</strong> {formData.locatairePermisDate || '________________________'}</li>
            </ul>
          </div>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 1 - OBJET DU CONTRAT</h3>
          <p>Le présent contrat, établi conformément au <strong><i>Dahir des Obligations et Contrats (DOC) marocain</i></strong> , a pour objet la location du véhicule ci-dessous désigné :</p>
          
          <div className="vehicle-section">
            <h4>VÉHICULE LOUÉ :</h4>
            <ul>
              <li><strong>Marque et modèle :</strong> {formData.vehiculeMarque || '________________________'}</li>
              <li><strong>N° d'immatriculation :</strong> {formData.vehiculeImmat || '________________________'}</li>
              <li><strong>Kilométrage au départ :</strong> {formData.vehiculeKm || '________________________'} km</li>
            </ul>
          </div>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 2 - DURÉE ET LIEU DE LA LOCATION</h3>
          <ul>
            <li><strong>Date et heure de début :</strong> {formData.dateDebut || '________________________'}</li>
            <li><strong>Date et heure de fin prévue :</strong> {formData.dateFin || '________________________'}</li>
            <li><strong>Lieu de prise en charge :</strong> {formData.lieuPrise || '________________________'}</li>
            <li><strong>Lieu de restitution :</strong> {formData.lieuRestitution || '________________________'}</li>
          </ul>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 3 - CONDITIONS TARIFAIRES</h3>
          <ul>
            <li><strong>Tarif journalier :</strong> {formData.prixParJour || '________________________'} DH/jour</li> 
            <li><strong>Dépôt de garantie :</strong> {formData.depotGarantie || '________________________'} DH</li>
            <li><strong>Taxe sur la valeur ajoutée (TVA 20%) :</strong> Incluse/Non incluse</li>
          </ul>
          <p><strong>MONTANT TOTAL TTC :</strong> {(parseFloat(formData.prixParJour) || 0) * (parseInt(formData.nombreJours) || 0)|| '________________________'} DH</p>
        </div>

        {/* Articles 4-13 restent statiques */}
        <div className="contract-section">
          <h3>ARTICLE 4 - CONDITIONS D'UTILISATION</h3>
          <h4>4.1 Usage autorisé</h4>
          <p>Le locataire s'engage à :</p>
          <ul>
            <li>Utiliser le véhicule conformément au Code de la route marocain</li>
            <li>Respecter les limitations de vitesse et la réglementation en vigueur</li>
            <li>Ne pas conduire sous l'influence d'alcool ou de substances illicites</li>
            <li>Ne pas transporter plus de passagers que prévu</li>
            <li>Maintenir le véhicule en bon état de propreté</li>
          </ul>
          
          <h4>4.2 Usage interdit</h4>
          <p>Il est strictement interdit de :</p>
          <ul>
            <li>Sous-louer ou prêter le véhicule à des tiers non autorisés</li>
            <li>Utiliser le véhicule pour des activités illégales</li>
            <li>Conduire hors des routes goudronnées sans autorisation</li>
            <li>Transporter des marchandises dangereuses</li>
            <li>Participer à des courses ou rallyes</li>
          </ul>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 5 - ASSURANCE ET RESPONSABILITÉ</h3>
          <h4>5 Couverture d'assurance</h4>
          <p>Le véhicule est assuré conformément aux dispositions de la loi <strong><i>n° 17-99</i></strong>  portant Code des assurances </p>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 6 - OBLIGATIONS DU LOCATAIRE</h3>
          <p>Le locataire s'engage à :</p>
          <ul>
            <li>Présenter un permis de conduire valide (minimum 1 an d'ancienneté)</li>
            <li>Vérifier l'état du véhicule lors de la prise en charge</li>
            <li>Effectuer les vérifications quotidiennes (huile, eau, freins)</li>
            <li>Signaler immédiatement toute panne ou incident</li>
            <li>Respecter les dates et heures de restitution</li>
            <li>Acquitter toutes les amendes et contraventions</li>
          </ul>
        </div>


        <div className="contract-section">
          <h3>ARTICLE 7 - RESTITUTION DU VÉHICULE</h3>
          <h4>7.1 Modalités</h4>
          <p>Le véhicule doit être restitué :</p>
          <ul>
            <li>À la date et heure convenues (tolérance : 1 heure)</li>
            <li>Au lieu prévu au contrat</li>
            <li>En parfait état de fonctionnement et de propreté</li>
            <li>Avec tous les équipements et documents de bord</li>
          </ul>
          
          <h4>7.2 Retard</h4>
          <p>Tout retard supérieur à 1 heure entraîne la facturation d'une journée supplémentaire complète.</p>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 8 - GARANTIE ET PAIEMENT</h3>
          <h4>8.1 Dépôt de garantie</h4>
          <p>Un dépôt de garantie de {formData.depotGarantie || '________________________'} DH est exigé :</p>
          <ul>
            <li>En espèces ou par carte bancaire</li>
            <li>Bloqué pendant la durée de location</li>
          </ul>
          
          <h4>8.2 Utilisation de la garantie</h4>
          <p>La garantie couvre :</p>
          <ul>
            <li>Les dégradations constatées</li>
            <li>Les amendes et contraventions</li>
            <li>Les frais de remorquage en cas de négligence</li>
            <li>La franchise d'assurance</li>
          </ul>
          
          <h4>8.3 Paiement</h4>
          <p>Le règlement s'effectue :</p>
          <ul>
            <li>Intégralement à la signature du contrat</li>
            <li>En dirhams marocains uniquement</li>
            <li>Par espèces, carte bancaire ou virement</li>
          </ul>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 9- INCIDENTS ET SINISTRES</h3>
          <h4>9.1 En cas d'accident</h4>
          <p>Le locataire doit :</p>
          <ul>
            <li>Établir un constat amiable avec les parties concernées</li>
            <li>Alerter les autorités compétentes si nécessaire</li>
            <li>Prévenir Cherkaoui Auto Rent dans les 2 heures</li>
            <li>Transmettre tous documents dans les 48 heures</li>
          </ul>
          
          <h4>9.2 En cas de vol</h4>
          <ul>
            <li>Porter plainte immédiatement au commissariat le plus proche</li>
            <li>Informer Cherkaoui Auto Rent dans l'heure</li>
            <li>Fournir le récépissé de plainte sous 24 heures</li>
          </ul>
          
          <h4>9.3 Assistance dépannage</h4>
          <p>Cherkaoui Auto Rent assure une assistance 24h/24 sur l'ensemble du territoire marocain.</p>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 10 - DONNÉES PERSONNELLES</h3>
          <p>Conformément à la loi <strong><i>n° 09-08</i></strong> relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, les données collectées sont nécessaires à l'exécution du présent contrat et à la gestion de la location.</p>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 11 - RÉSILIATION</h3>
          <p>Le présent contrat peut être résilié de plein droit par Cherkaoui Auto Rent en cas de :</p>
          <ul>
            <li>Non-respect des conditions contractuelles</li>
            <li>Défaut de paiement</li>
            <li>Usage non conforme du véhicule</li>
            <li>Fausse déclaration du locataire</li>
          </ul>
        </div>

        <div className="contract-section">
          <h3>ARTICLE 12 - FORCE MAJEURE</h3>
          <p>Les parties ne peuvent être tenues responsables de l'inexécution de leurs obligations en cas de force majeure reconnue par la jurisprudence marocaine.</p>
        </div>

        

        <div className="contract-section">
          <h3>ARTICLE 13 - DISPOSITIONS DIVERSES</h3>
          <h4>13. Conducteurs supplémentaires</h4>
          <p>Conducteur supplémentaire autorisé :</p>
          <ul>
            <li><strong>Nom et prénom:</strong> {formData.conducteurSupp || '________________________'}</li>
            <li><strong>N° permis :</strong> {formData.conducteurSuppPermis || '________________________'}</li>
            
          </ul>
          
        </div>

        <div className="contract-section">
          <h3>SIGNATURES</h3>
          <p><strong>Fait à {formData.lieuSignature || '________________________'}, le {formData.dateSignature || '________________________'}</strong></p>
          <p><strong>Lu et approuvé</strong></p>
          
          <div className="signatures">
            <div className="signature-left">
              <p><strong>CHERKAOUI AUTO RENT</strong></p>
              <p>Le représentant</p>
              <p>(Nom, qualité, signature et cachet)</p>
              <div className="signature-line">_________________________________</div>
            </div>
            <div className="signature-right">
              <p><strong>LE LOCATAIRE</strong></p>
              <p>(Nom, prénom et signature)</p>
              <div className="signature-line">_________________________________</div>
            </div>
          </div>
        </div>

        <div className="contract-section">
          <h3>ÉTAT DES LIEUX CONTRADICTOIRE</h3>
          <table className="inspection-table">
            <thead>
              <tr>
                <th>ÉLÉMENT À VÉRIFIER</th>
                <th>DÉPART</th>
                <th>RETOUR</th>
                <th>OBSERVATIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Carrosserie</strong></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>- Avant</td>
                <td>☐ BE ☐ Rayures ☐ Chocs</td>
                <td>☐ BE ☐ Rayures ☐ Chocs</td>
                <td></td>
              </tr>
              <tr>
                <td>- Arrière</td>
                <td>☐ BE ☐ Rayures ☐ Chocs</td>
                <td>☐ BE ☐ Rayures ☐ Chocs</td>
                <td></td>
              </tr>
              <tr>
                <td>- Côté droit</td>
                <td>☐ BE ☐ Rayures ☐ Chocs</td>
                <td>☐ BE ☐ Rayures ☐ Chocs</td>
                <td></td>
              </tr>
              <tr>
                <td>- Côté gauche</td>
                <td>☐ BE ☐ Rayures ☐ Chocs</td>
                <td>☐ BE ☐ Rayures ☐ Chocs</td>
                <td></td>
              </tr>
              <tr>
                <td><strong>Vitres et pare-brise</strong></td>
                <td>☐ BE ☐ Fissures ☐ Éclats</td>
                <td>☐ BE ☐ Fissures ☐ Éclats</td>
                <td></td>
              </tr>
              <tr>
                <td><strong>Pneumatiques</strong></td>
                <td>☐ BE ☐ Usure ☐ Crevaison</td>
                <td>☐ BE ☐ Usure ☐ Crevaison</td>
                <td></td>
              </tr>
              <tr>
                <td><strong>Habitacle</strong></td>
                <td>☐ Propre ☐ Taches ☐ Déchirures</td>
                <td>☐ Propre ☐ Taches ☐ Déchirures</td>
                <td></td>
              </tr>
              <tr>
                <td><strong>Équipements de série</strong></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>- Trousse de secours</td>
                <td>☐ Présente</td>
                <td>☐ Présente</td>
                <td></td>
              </tr>
              <tr>
                <td>- Triangle de signalisation</td>
                <td>☐ Présent</td>
                <td>☐ Présent</td>
                <td></td>
              </tr>
              <tr>
                <td>- Cric et outils</td>
                <td>☐ Complets</td>
                <td>☐ Complets</td>
                <td></td>
              </tr>
              <tr>
                <td>- Carte grise</td>
                <td>☐ Présente</td>
                <td>☐ Présente</td>
                <td></td>
              </tr>
              <tr>
                <td>- Vignette d'assurance</td>
                <td>☐ À jour</td>
                <td>☐ À jour</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          
          <div className="inspection-footer">
            <p><strong>Kilométrage :</strong> __________ km &nbsp;&nbsp;&nbsp;&nbsp; <strong>Carburant :</strong> __________</p>
            
            <div className="inspection-signatures">
              <div>
                <p><strong>Signatures de l'état des lieux :</strong></p>
                <div className="signature-section">
                  <p><strong>Départ :</strong></p>
                  <p>Cherkaoui Auto Rent : __________________</p>
                  <p>Locataire : __________________</p>
                </div>
                <div className="signature-section">
                  <p><strong>Retour :</strong></p>
                  <p>Cherkaoui Auto Rent : __________________</p>
                  <p>Locataire : __________________</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contract-footer">
          <p><em>Contrat établi en deux exemplaires originaux, chaque partie reconnaissant avoir reçu le sien.</em></p>
          <p><strong>CHERKAOUI AUTO RENT</strong> - Tél : +212 74 72 74 79 / +212 6 45 84 86 86 </p>
        </div>
      </div>

      {/* Section du formulaire */}
     
    </div>
  );
};

export default ContractGenerator;