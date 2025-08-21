import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      // Navigation
      dashboard: "Tableau de bord",
      vehicles: "Véhicules",
      clients: "Clients",
      reservations: "Réservations",
      billing: "Facturation",
      contracts: "Contrats",
      maintenance: "Maintenance",
      reports: "Rapports",
      settings: "Paramètres",
      
      // Common
      add: "Ajouter",
      edit: "Modifier",
      delete: "Supprimer",
      save: "Enregistrer",
      cancel: "Annuler",
      search: "Rechercher",
      filter: "Filtrer",
      export: "Exporter",
      print: "Imprimer",
      download: "Télécharger",
      upload: "Télécharger",
      status: "Statut",
      actions: "Actions",
      date: "Date",
      price: "Prix",
      total: "Total",
      
      // Vehicle Management
      vehicleManagement: "Gestion des Véhicules",
      addVehicle: "Ajouter un Véhicule",
      brand: "Marque",
      model: "Modèle",
      fuelType: "Type de Carburant",
      dailyPrice: "Prix Journalier",
      mileage: "Kilométrage",
      available: "Disponible",
      rented: "Loué",
      maintenance: "En Maintenance",
      outOfService: "Hors Service",
      
      // Client Management
      clientManagement: "Gestion des Clients",
      addClient: "Ajouter un Client",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      address: "Adresse",
      licenseNumber: "Numéro de Permis",
      nationalId: "Carte d'Identité",
      
      // Reservations
      reservationManagement: "Gestion des Réservations",
      addReservation: "Ajouter une Réservation",
      startDate: "Date de Début",
      endDate: "Date de Fin",
      client: "Client",
      vehicle: "Véhicule",
      pending: "En Attente",
      confirmed: "Confirmée",
      active: "Active",
      completed: "Terminée",
      cancelled: "Annulée",
      
      // Dashboard
      totalVehicles: "Total Véhicules",
      activeRentals: "Locations Actives",
      totalRevenue: "Revenus Totaux",
      totalClients: "Total Clients",
      monthlyRevenue: "Revenus Mensuels",
      vehicleStatus: "Statut des Véhicules",
      topClients: "Meilleurs Clients",

      // Revenue Reset (DEV)
      resetRevenueBtn: "Réinitialiser les revenus (DEV)",
      resettingRevenue: "Réinitialisation...",
      revenueResetSuccess: "Les revenus ont été réinitialisés avec succès !",
      revenueResetError: "Erreur lors de la réinitialisation des revenus.",
      
      // Company
      companyName: "Cherkaoui AutoRent",
      welcomeMessage: "système de gestion Cherkaoui AutoRent"
    }
  },
  ar: {
    translation: {
      // Navigation
      dashboard: "لوحة التحكم",
      vehicles: "المركبات",
      clients: "العملاء",
      reservations: "الحجوزات",
      billing: "الفواتير",
      contracts: "العقود",
      maintenance: "الصيانة",
      reports: "التقارير",
      settings: "الإعدادات",
      
      // Common
      add: "إضافة",
      edit: "تعديل",
      delete: "حذف",
      save: "حفظ",
      cancel: "إلغاء",
      search: "بحث",
      filter: "تصفية",
      export: "تصدير",
      print: "طباعة",
      download: "تحميل",
      upload: "رفع",
      status: "الحالة",
      actions: "الإجراءات",
      date: "التاريخ",
      price: "السعر",
      total: "المجموع",
      
      // Vehicle Management
      vehicleManagement: "إدارة المركبات",
      addVehicle: "إضافة مركبة",
      brand: "العلامة التجارية",
      model: "الطراز",
      fuelType: "نوع الوقود",
      dailyPrice: "السعر اليومي",
      mileage: "المسافة المقطوعة",
      available: "متاح",
      rented: "مؤجر",
      maintenance: "قيد الصيانة",
      outOfService: "خارج الخدمة",
      
      // Client Management
      clientManagement: "إدارة العملاء",
      addClient: "إضافة عميل",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      licenseNumber: "رقم الرخصة",
      nationalId: "بطاقة الهوية",
      
      // Reservations
      reservationManagement: "إدارة الحجوزات",
      addReservation: "إضافة حجز",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
      client: "العميل",
      vehicle: "المركبة",
      pending: "في الانتظار",
      confirmed: "مؤكد",
      active: "نشط",
      completed: "مكتمل",
      cancelled: "ملغى",
      
      // Dashboard
      totalVehicles: "إجمالي المركبات",
      activeRentals: "الإيجارات النشطة",
      totalRevenue: "إجمالي الإيرادات",
      totalClients: "إجمالي العملاء",
      monthlyRevenue: "الإيرادات الشهرية",
      vehicleStatus: "حالة المركبات",
      topClients: "أفضل العملاء",

      // Revenue Reset (DEV)
      resetRevenueBtn: "إعادة تعيين الإيرادات (للتطوير)",
      resettingRevenue: "جاري إعادة التعيين...",
      revenueResetSuccess: "تمت إعادة تعيين الإيرادات بنجاح!",
      revenueResetError: "حدث خطأ أثناء إعادة تعيين الإيرادات.",
      
      // Company
      companyName: "الشرقاوي أوتورنت ",
      welcomeMessage: "مرحباً بكم في نظام إدارةالشرقاوي أوتورنت "
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;

