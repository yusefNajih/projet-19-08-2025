import React, { useState } from "react";
import logo from "../assets/logo.png";
// import cache from "../assets/cache.png"
// import html2pdf from "html2pdf.js";
// src/data/contractArticles.js
//les articles de contracts
const contractArticles = [
  {
    numero: 1,
    titre: "IDENTIFICATION DES PARTIES",
    contenu:
      "Le présent contrat est conclu entre l’agence de location de voiture, représentée légalement selon les mentions figurant en page de couverture, ci-après dénommée la société Cherkaoui Auto Rent, et le locataire défini en page 1 du contrat.",
    arabe:
      "أُبرِم هذا العقد بين وكالة كراء السيارات، الممثلة قانونيًا حسب المعطيات الواردة في صفحة الغلاف، المشار إليها فيما بعد بـ\"الشركة\"، والطرف الثاني المكتري المحدد في الصفحة الأولى من العقد."
  },
  {
    numero: 2,
    titre: "ÉTAT DU VÉHICULE",
    contenu:
      "Le véhicule est livré au locataire en parfait état apparent, propre et fonctionnel. Un état des lieux contradictoire est établi à la remise et au retour du véhicule. Toute anomalie non signalée lors de la remise engage la responsabilité du locataire.",
    arabe:
      "تُسلَّم السيارة إلى المكتري وهي في حالة ميكانيكية سليمة، نظيفة، وجاهزة للاستعمال. يتم تحرير محضر معاينة عند التسليم والإرجاع. كل ضرر لم يُذكر عند التسليم يتحمله المكتري."
  },
  {
    numero: 3,
    titre: "ENTRETIEN ET UTILISATION",
    contenu:
      "L’entretien courant (vidange, batterie, pneus, liquide de frein) est pris en charge par la société. Tout dommage résultant d’une mauvaise utilisation, surcharge, négligence, ou usage contraire aux règles est à la charge du locataire.",
    arabe:
      "تتحمل الشركة صيانة السيارة الاعتيادية (الزيت، البطارية، العجلات، سائل الفرامل). أما الأعطاب الناتجة عن سوء الاستعمال أو الإهمال فهي من مسؤولية المكتري بالكامل."
  },
  {
    numero: 4,
    titre: "DESTINATION DU VÉHICULE",
    contenu:
      "Le véhicule est exclusivement destiné à un usage personnel et privé. Il est strictement interdit de l’utiliser pour le transport public, InDrive, Uber, taxi ou usage commercial sans autorisation écrite.",
    arabe:
      "السيارة مخصصة للاستعمال الشخصي فقط. يُمنع منعًا باتًا استخدامها في النقل العمومي أو تطبيقات النقل المأجور مثل إن درايف أو أوبر أو كطاكسي، أو لأغراض مهنية أو تجارية دون إذن مكتوب."
  },
  {
    numero: 5,
    titre: "ASSURANCE ET FRANCHISE",
    contenu:
      "Le véhicule est assuré en responsabilité civile. En cas d’accident, le locataire prend à sa charge la franchise obligatoire, les frais non couverts par l’assurance (TVA, vétusté, immobilisation), ainsi que tous frais annexes.",
    arabe:
      "السيارة مؤمنة ضد المسؤولية المدنية فقط. في حالة وقوع حادث، يتحمل المكتري: مبلغ الفرنشيز المحدد من طرف الشركة، التكاليف غير المغطاة من طرف التأمين، وكل المصاريف الإضافية."
  },
  {
    numero: 6,
    titre: "MODALITÉS DE PAIEMENT",
    contenu:
      "La location est payable d’avance. En cas d’accident, prolongation ou dommage, les montants dus sont calculés et exigibles immédiatement. Tout chèque sans provision fait l’objet d’une plainte au titre de l’article 543 du Code pénal.",
    arabe:
      "يُدفع مبلغ الكراء مسبقًا. في حالة الحادث أو التمديد أو الأضرار، يُحسب المبلغ المستحق ويصبح واجب الأداء فوراً. الشيك بدون رصيد يُتابَع بموجب الفصل 543 من القانون الجنائي."
  },
  {
    numero: 7,
    titre: "DOMMAGES ET IMMOBILISATION",
    contenu:
      "Le locataire est responsable de tout dommage, y compris réparations, remorquage, pièces, main-d’œuvre, et les jours d’immobilisation au tarif journalier.",
    arabe:
      "المكتري مسؤول عن كل ضرر يلحق بالسيارة، بما في ذلك مصاريف الإصلاح، القطر، قطع الغيار، اليد العاملة، وأيام توقف السيارة حسب الثمن اليومي للكراء."
  },
  {
    numero: 8,
    titre: "DOCUMENTS DU VÉHICULE",
    contenu:
      "Le locataire est tenu de restituer tous les documents (assurance, carte grise, vignette, PV, etc.). En cas de perte ou non-restitution, des pénalités forfaitaires sont appliquées.",
    arabe:
      "يجب على المكتري إرجاع جميع الوثائق (التأمين، البطاقة الرمادية، الضريبة، المعاينة...). في حال ضياعها أو عدم إرجاعها، تُطبق غرامات جزافية بالإضافة إلى مصاريف إعادة الإصدار."
  },
  {
    numero: 9,
    titre: "INFRACTIONS",
    contenu:
      "Le locataire est seul responsable des infractions routières, amendes, saisies ou poursuites judiciaires durant la période de location.",
    arabe:
      "المكتري هو المسؤول الوحيد عن المخالفات الطرقية، الغرامات، الحجز أو المتابعات القانونية أثناء فترة الكراء."
  },
  {
    numero: 10,
    titre: "INFRACTIONS PÉNALES",
    contenu:
      "Tout acte de falsification, fausse déclaration, chèque sans provision ou usage frauduleux du véhicule constitue un crime puni par le Code pénal (Art. 540, 543, 607-1, 361 à 367).",
    arabe:
      "كل تزوير في الوثائق، تصريح كاذب، شيك بدون رصيد أو استعمال احتيالي للسيارة يُعد جريمة تُعاقب عليها الفصول: الفصل 540 (النصب)، الفصل 543 (الشيك بدون رصيد)، الفصل 1-607 (الاختلاس وسوء الاستعمال)، الفصول 361 إلى 367 (التزوير واستعماله)."
  },
  {
    numero: 11,
    titre: "RÉSILIATION ANTICIPÉE",
    contenu:
      "La société se réserve le droit de résilier unilatéralement le contrat à tout moment en cas de manquement grave (non-paiement, fausse déclaration, usage interdit).",
    arabe:
      "تحتفظ الشركة بحق فسخ العقد من جانب واحد في أي وقت في حالة ارتكاب المكتري إخلال جسيم."
  },
  {
    numero: 12,
    titre: "TRIBUNAL COMPÉTENT",
    contenu:
      "En cas de litige, le tribunal du ressort territorial du siège social de la société est seul compétent.",
    arabe:
      "في حالة النزاع، تكون المحكمة التابعة لمقر الشركة هي الوحيدة المختصة."
  },
  {
    numero: 13,
    titre: "INTERDICTIONS ABSOLUES",
    contenu:
      "Il est strictement interdit de transporter des substances illicites, participer à des courses ou modifier le véhicule.",
    arabe:
      "يُمنع منعًا باتًا نقل مواد ممنوعة، المشاركة في سباقات، أو تعديل أي جزء من السيارة."
  },
  {
    numero: 14,
    titre: "DÉPÔT DE GARANTIE",
    contenu:
      "Un dépôt est exigé à la signature. Il peut être conservé en cas de dommage, retard ou litige.",
    arabe:
      "يُؤدى مبلغ الضمان عند توقيع العقد ويُحتفظ به في حال وجود أضرار أو تأخير أو نزاع."
  },
  {
    numero: 15,
    titre: "DÉCLARATION MENSONGÈRE",
    contenu:
      "Toute fausse déclaration engage la responsabilité pénale du locataire.",
    arabe:
      "كل تصريح كاذب أمام المحكمة أو الشرطة أو الدرك يعرض المكتري للمتابعة القضائية."
  },
  {
    numero: 16,
    titre: "CLAUSE PÉNALE",
    contenu:
      "Tout manquement grave engage une pénalité forfaitaire immédiate de 50 000 MAD.",
    arabe:
      "أي إخلال جسيم يلزم المكتري بغرامة فورية قدرها 50.000 درهم."
  },
  {
    numero: 17,
    titre: "NON-RESTITUTION",
    contenu:
      "Tout retard de restitution est considéré comme un détournement et signalé aux autorités compétentes (Art. 607-1 CP).",
    arabe:
      "كل تأخير في إرجاع السيارة يُعتبر اختلاسًا ويتم التبليغ عنه فورًا كمحاولة سرقة."
  },
  {
    numero: 18,
    titre: "GPS ET SÉCURITÉ",
    contenu:
      "Toute tentative de désactivation ou sabotage du GPS constitue un acte de sabotage puni par le Code pénal.",
    arabe:
      "كل محاولة لتعطيل أو إزالة جهاز التتبع تُعد جريمة تخريب."
  },
  {
    numero: 19,
    titre: "REPRISE FORCÉE",
    contenu:
      "En cas d’abus ou fraude, la société Cherkaoui Auto Rent pourra reprendre le véhicule à tout moment, avec intervention des autorités si nécessaire.",
    arabe:
      "في حالة الاستعمال غير المشروع أو النصب، يمكن للشركة استرجاع السيارة في أي وقت ولو بمساعدة السلطات."
  },
  {
    numero: 20,
    titre: "COMPARUTION",
    contenu:
      "Le locataire s’engage à comparaître à toute convocation judiciaire.",
    arabe:
      "يتعهد المكتري بالمثول أمام القضاء عند الاستدعاء."
  },
  {
    numero: 21,
    titre: "RESPONSABILITÉ TOTALE",
    contenu:
      "Le véhicule est loué sous assurance responsabilité civile uniquement. En cas d’accident ou panne, le locataire supporte les réparations, remorquage, et retour du véhicule.",
    arabe:
      "السيارة مكراة بتأمين المسؤولية المدنية فقط. عند وقوع حادث أو عطب، يتحمل المكتري الإصلاح والقطر وإرجاع السيارة إلى مقر الشركة."
  },
  {
    numero: 22,
    titre: "INTERDICTION DE SORTIE DU TERRITOIRE",
    contenu:
      "Le véhicule ne peut franchir les frontières du Maroc sans autorisation écrite. Tout franchissement est constitutif de crime douanier.",
    arabe:
      "يُمنع مغادرة التراب الوطني بالسيارة بدون ترخيص مكتوب من الشركة."
  },
  {
    numero: 23,
    titre: "DÉFAUT DE PAIEMENT",
    contenu:
      "Tout défaut ou refus de paiement est considéré comme escroquerie au sens de l’article 540 du Code pénal.",
    arabe:
      "كل امتناع عن الأداء يُعد نصبًا طبقًا للفصل 540 من القانون الجنائي."
  },
  {
    numero: 24,
    titre: "RECONNAISSANCE DE DETTE",
    contenu:
      "Le locataire reconnaît que tout montant dû inscrit dans le contrat constitue une dette certaine, liquide et exigible.",
    arabe:
      " يُقر المكتري بأن كل مبلغ وارد في العقد هو دين ثابت، واجب الأداء."
  },
  {
    numero:25,
    contenu:" Le locataire est le seul responsable de délits contraventions de la circulation routière.",
    arabe:"المستأجر هو المسؤول الوحيد عن المخالفات المرورية"

  }
];
 const leftColumn = contractArticles.slice(0,10);
const rightColumn = contractArticles.slice(10, 24);

const lastArticle = contractArticles[contractArticles.length - 1];

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
          filename:`Contrat_${formData.locataireNomPrenom}.pdf`,
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
                  *{lastArticle.contenu}
                  <br />
                </i>
                <span style={{
          fontFamily: 'Tahoma, Arial, sans-serif',
          direction: 'rtl',
          textAlign: 'center'
        }}
                 >
                  {lastArticle.arabe}*
                </span>
              </strong>
            </p>
          </div>
        </div>
        {/* signature */}
        <div className="contract-section signature-section" >

          <div className="locataire-section" >
          
              <p><i>je soussigné <strong><i>{formData.locataireNomPrenom}</i></strong> déclare avoir pris connaissance des conditions 
générales figurant dans le contrat de location de voiture, que j'accepte sans réserve.</i>
</p>
            <p>  <strong>Lieu :</strong> {formData.lieuPrise || "________________"}<br />
              <strong>Date :</strong> {formData.dateDebut || "________________"}
        </p>
          </div>
          <div className="locataire-section" >
            <div> 
              {/* <img src={cache} alt="cache" /> */}
            </div>
          </div>
        </div>

        {/* <div className="contract-footer">
          <p><em><strong>CHERKAOUI AUTO RENT SARL</strong></em></p>
          <p>ICE: 003765030000093 - TP: 41201401 - RC: 709/BOUJAAD</p>
          <p><strong>Adresse: </strong>N° 97 LOT ENNAKHIL BEJAAD | <strong> Email: </strong> Cherkaoui.autorent@gmail.com | <strong>Tél :</strong> +212 74 72 74 79 / +212 6 45 84 86 86 </p>
        </div> */}

        <div className="contract-container">
      <h1 className="contract-title">
        Conditions Générales du Contrat
      </h1>
      <div className="contract-grid">
        {/* Colonne gauche */}
        <div className="contract-column">
          {leftColumn.map((article) => (
            <div key={article.numero} className="article-item">
              <h2 className="article-title">
                Article {article.numero} : {article.titre}
              </h2>
              <p className="article-content">{article.contenu}</p>
              <p className="article-arabic">{article.arabe}</p>
            </div>
          ))}
        </div>
        {/* Colonne droite */}
        <div className="contract-column">
          {rightColumn.map((article) => (
            <div key={article.numero} className="article-item">
              <h2 className="article-title">
                Article {article.numero} : {article.titre}
              </h2>
              <p className="article-content">{article.contenu}</p>
              <p className="article-arabic">{article.arabe}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Déclaration et signature */}
      {/* <div className="signature-section">
        <p>
          Je déclare avoir pris connaissance des conditions générales figurant
          dans le contrat de location de voiture, que j&apos;accepte sans réserve.
        </p>
        <p className="signature-line">— Signature du Locataire</p>
      </div> */}
        <div className="locataire-section-sign" >
              <p><i>je soussigné <strong><i>{formData.locataireNomPrenom}</i></strong> déclare avoir pris connaissance des conditions 
générales figurant dans le contrat de location de voiture, que j'accepte sans réserve.</i>
</p>
              <strong>Lieu :</strong> {formData.lieuPrise || "________________"}<br />
              <strong>Date :</strong> {formData.dateDebut || "________________"}
        </div>
    
        </div>

      </div>
    

    </div>
  );
};

export default ContractGenerator;
