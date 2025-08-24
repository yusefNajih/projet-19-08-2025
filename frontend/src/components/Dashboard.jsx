import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, Calendar, DollarSign } from "lucide-react";
import { dashboardAPI } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

// Helper to check if user is admin (from localStorage)
function isAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && user.role === "admin";
  } catch {
    return false;
  }
}

const isDev =
  import.meta.env.MODE === "development" ||
  process.env.NODE_ENV === "development";

const Dashboard = () => {
  // Hooks doivent être déclarés en premier
  const { t } = useTranslation();

  // States pour les stats dynamiques
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState({
    totalVehicles: 0,
    totalClients: 0,
    activeRentals: 0,
    totalRevenue: 0,
    vehicleStatus: {},
  });
  const [vehicleStatus, setVehicleStatus] = useState({});
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);

  // Données pour le pie chart véhicules (maintenant après la déclaration des states)
  const vehiclePieData = [
    { name: t("available", "Disponible"), value: vehicleStatus.available || 0 },
    { name: t("rented", "Loué"), value: vehicleStatus.rented || 0 },
    {
      name: t("outOfService", "Hors service"),
      value: vehicleStatus.outOfService || 0,
    },
  ];
  const pieColors = ["#111c97ff", "#60a5fa", "#f87171"];

  // Refetch stats
  const fetchStats = () => {
    setLoading(true);
    dashboardAPI
      .getStats()
      .then((res) => {
        setOverview(res.data.overview);
        setVehicleStatus(res.data.vehicleStatus || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setError("Erreur lors du chargement des statistiques");
        setLoading(false);
      });
  };

  // Reset revenue handler
  const handleResetRevenue = async () => {
    setResetLoading(true);
    setResetMsg(null);
    try {
      await dashboardAPI.resetRevenue();
      setResetMsg(t("revenueResetSuccess", "Revenus remis à zéro avec succès"));
      fetchStats();
    } catch (e) {
      console.error("Erreur reset revenue:", e);
      setResetMsg(t("revenueResetError", "Erreur lors de la remise à zéro"));
    } finally {
      setResetLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchStats();
    
    // Récupère les données de revenu mensuel
    dashboardAPI
      .getRevenue()
      .then((res) => {
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const data = res.data.data.map((item) => ({
          month: months[(item._id || item.month) - 1],
          revenue: item.revenue,
        }));
        setMonthlyRevenueData(data);
      })
      .catch((err) => {
        console.error("Erreur revenus mensuels:", err);
        setMonthlyRevenueData([]);
      });
  }, []);

  // Stats configuration
  const stats = [
    {
      title: t("totalRevenue", "Revenus totaux"),
      value: `${overview.totalRevenue || 0} DH`,
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: t("totalDeposit", "Cautions en cours"),
      value: `${overview.totalDeposit || 0} DH`,
      icon: DollarSign,
      color: "text-orange-600",
    },
    {
      title: t("totalClients", "Total clients"),
      value: overview.totalClients || 0,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: t("vehiclesInMaintenance", "Véhicules en maintenance"),
      value: vehicleStatus.maintenance || 0,
      icon: Car,
      color: "text-yellow-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("dashboard", "Tableau de bord")}
        </h2>
        <p className="text-muted-foreground">
          {t("welcomeMessage", "Bienvenue sur votre tableau de bord")}
        </p>
        
        {/* DEV ONLY: Admin revenue reset button */}
        {isDev && isAdmin() && (
          <div className="mt-4">
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-60"
              onClick={handleResetRevenue}
              disabled={resetLoading}
            >
              {resetLoading 
                ? t("resettingRevenue", "Remise à zéro...") 
                : t("resetRevenueBtn", "Reset Revenue")
              }
            </button>
            {resetMsg && (
              <div className="mt-2 text-sm text-green-700">{resetMsg}</div>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards dynamiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-4 text-center py-8">
            {t("loading", "Chargement...")}
          </div>
        ) : error ? (
          <div className="col-span-4 text-center text-red-500 py-8">
            {error}
          </div>
        ) : (
          stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("monthlyRevenue", "Revenus mensuels")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("vehicleStatus", "État des véhicules")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
  <BarChart
    layout="vertical"
    data={vehiclePieData}
    margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" />
    <YAxis type="category" dataKey="name" />
    <Tooltip />
    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
      {vehiclePieData.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={pieColors[index % pieColors.length]}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

// import { useTranslation } from "react-i18next";
// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Car, Users, Calendar, DollarSign } from "lucide-react";
// import { dashboardAPI } from "../services/api";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from "recharts";
// import { PieChart, Pie, Cell, Legend } from "recharts";

// // Helper to check if user is admin (from localStorage)
// function isAdmin() {
//   try {
//     const user = JSON.parse(localStorage.getItem("user"));
//     return user && user.role === "admin";
//   } catch {
//     return false;
//   }
// }

// const isDev =
//   import.meta.env.MODE === "development" ||
//   process.env.NODE_ENV === "development";

// const Dashboard = () => {
//   // Hooks doivent être déclarés en premier
//   const { t } = useTranslation();

//   // States pour les stats dynamiques
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [overview, setOverview] = useState({
//     totalVehicles: 0,
//     totalClients: 0,
//     activeRentals: 0,
//     totalRevenue: 0,
//     vehicleStatus: {},
//   });
//   const [vehicleStatus, setVehicleStatus] = useState({});
//   const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
//   const [resetLoading, setResetLoading] = useState(false);
//   const [resetMsg, setResetMsg] = useState(null);

//   // Données pour le pie chart véhicules (maintenant après la déclaration des states)
//   const vehiclePieData = [
//     { name: t("available", "Disponible"), value: vehicleStatus.available || 0 },
//     { name: t("rented", "Loué"), value: vehicleStatus.rented || 0 },
//     {
//       name: t("outOfService", "Hors service"),
//       value: vehicleStatus.outOfService || 0,
//     },
//   ];
//   const pieColors = ["#111c97ff", "#60a5fa", "#f87171"];

//   // Refetch stats
//   const fetchStats = () => {
//     setLoading(true);
//     dashboardAPI
//       .getStats()
//       .then((res) => {
//         setOverview(res.data.overview);
//         setVehicleStatus(res.data.vehicleStatus || {});
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Erreur API:", err);
//         setError("Erreur lors du chargement des statistiques");
//         setLoading(false);
//       });
//   };

//   // Reset revenue handler
//   const handleResetRevenue = async () => {
//     setResetLoading(true);
//     setResetMsg(null);
//     try {
//       await dashboardAPI.resetRevenue();
//       setResetMsg(t("revenueResetSuccess", "Revenus remis à zéro avec succès"));
//       fetchStats();
//     } catch (e) {
//       console.error("Erreur reset revenue:", e);
//       setResetMsg(t("revenueResetError", "Erreur lors de la remise à zéro"));
//     } finally {
//       setResetLoading(false);
//     }
//   };

//   // Effects
//   useEffect(() => {
//     fetchStats();
    
//     // Récupère les données de revenu mensuel
//     dashboardAPI
//       .getRevenue()
//       .then((res) => {
//         const months = [
//           "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//         ];
//         const data = res.data.data.map((item) => ({
//           month: months[(item._id || item.month) - 1],
//           revenue: item.revenue,
//         }));
//         setMonthlyRevenueData(data);
//       })
//       .catch((err) => {
//         console.error("Erreur revenus mensuels:", err);
//         setMonthlyRevenueData([]);
//       });
//   }, []);

//   // Stats configuration
//   const stats = [
//     {
//       title: t("totalRevenue", "Revenus totaux"),
//       value: `${overview.totalRevenue || 0} DH`,
//       icon: DollarSign,
//       color: "text-yellow-600",
//     },
//     {
//       title: t("totalDeposit", "Cautions en cours"),
//       value: `${overview.totalDeposit || 0} DH`,
//       icon: DollarSign,
//       color: "text-orange-600",
//     },
//     {
//       title: t("totalClients", "Total clients"),
//       value: overview.totalClients || 0,
//       icon: Users,
//       color: "text-purple-600",
//     },
//     {
//       title: t("vehiclesInMaintenance", "Véhicules en maintenance"),
//       value: vehicleStatus.maintenance || 0,
//       icon: Car,
//       color: "text-yellow-700",
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">
//           {t("dashboard", "Tableau de bord")}
//         </h2>
//         <p className="text-muted-foreground">
//           {t("welcomeMessage", "Bienvenue sur votre tableau de bord")}
//         </p>
        
//         {/* DEV ONLY: Admin revenue reset button */}
//         {isDev && isAdmin() && (
//           <div className="mt-4">
//             <button
//               className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-60"
//               onClick={handleResetRevenue}
//               disabled={resetLoading}
//             >
//               {resetLoading 
//                 ? t("resettingRevenue", "Remise à zéro...") 
//                 : t("resetRevenueBtn", "Reset Revenue")
//               }
//             </button>
//             {resetMsg && (
//               <div className="mt-2 text-sm text-green-700">{resetMsg}</div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Stats Cards dynamiques */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {loading ? (
//           <div className="col-span-4 text-center py-8">
//             {t("loading", "Chargement...")}
//           </div>
//         ) : error ? (
//           <div className="col-span-4 text-center text-red-500 py-8">
//             {error}
//           </div>
//         ) : (
//           stats.map((stat, index) => {
//             const Icon = stat.icon;
//             return (
//               <Card key={index}>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">
//                     {stat.title}
//                   </CardTitle>
//                   <Icon className={`h-4 w-4 ${stat.color}`} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">{stat.value}</div>
//                 </CardContent>
//               </Card>
//             );
//           })
//         )}
//       </div>

//       {/* Charts Section */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//         <Card className="col-span-4">
//           <CardHeader>
//             <CardTitle>{t("monthlyRevenue", "Revenus mensuels")}</CardTitle>
//           </CardHeader>
//           <CardContent className="pl-2">
//             <div className="h-[200px]">
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={monthlyRevenueData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="revenue" fill="#8884d8" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="col-span-3">
//           <CardHeader>
//             <CardTitle>{t("vehicleStatus", "État des véhicules")}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[200px] flex items-center justify-center">
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={vehiclePieData}
//                     dataKey="value"
//                     nameKey="name"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={70}
//                     label
//                   >
//                     {vehiclePieData.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={pieColors[index % pieColors.length]}
//                       />
//                     ))}
//                   </Pie>
//                   <Legend />
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;