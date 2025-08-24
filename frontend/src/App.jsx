import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import VehicleManagement from "./components/VehicleManagement";
import VehicleAdminTable from "./components/VehicleAdminTable";
import ClientManagement from "./components/ClientManagement";
import ReservationManagement from "./components/ReservationManagement";
import Reports from "./components/Reports";
import ContractGenerator from "./components/ContractGenerator";
import Settings from "./components/Settings";
import "./i18n";
import "./App.css";

function App() {
  const { i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Vehicle refresh flag for cross-component update
  const [vehicleRefreshFlag, setVehicleRefreshFlag] = useState(0);

  // Function to trigger vehicle list refresh
  const triggerVehicleRefresh = () => setVehicleRefreshFlag((f) => f + 1);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Set initial document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("dashboard");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "vehicles":
        return <VehicleManagement vehicleRefreshFlag={vehicleRefreshFlag} />;
      case "vehicle-admin":
        return <VehicleAdminTable />;
      case "clients":
        return <ClientManagement />;
      case "reservations":
        return (
          <ReservationManagement
            triggerVehicleRefresh={triggerVehicleRefresh}
          />
        );
      case "contracts":
        return <ContractGenerator />;
      // case "maintenance":
      //   return <div>Maintenance (à implémenter)</div>;
      case "reports":
        return <Reports/>;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  // Si aucun utilisateur, afficher le composant Login qui gérera l'affichage du formulaire d'inscription admin
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      user={user}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;


