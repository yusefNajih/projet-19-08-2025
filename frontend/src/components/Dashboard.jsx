
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, Calendar, DollarSign } from 'lucide-react';
import { dashboardAPI } from '../services/api';

// Helper to check if user is admin (from localStorage)
function isAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'admin';
  } catch {
    return false;
  }
}

const isDev = import.meta.env.MODE === 'development' || process.env.NODE_ENV === 'development';

const Dashboard = () => {
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


  // Refetch stats
  const fetchStats = () => {
    setLoading(true);
    dashboardAPI.getStats()
      .then(res => {
        setOverview(res.data.overview);
        setVehicleStatus(res.data.vehicleStatus || {});
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors du chargement des statistiques');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Reset revenue handler
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);
  const handleResetRevenue = async () => {
    setResetLoading(true);
    setResetMsg(null);
    try {
      await dashboardAPI.resetRevenue();
      setResetMsg(t('revenueResetSuccess'));
      fetchStats();
    } catch (e) {
      setResetMsg(t('revenueResetError'));
    } finally {
      setResetLoading(false);
    }
  };

  const stats = [
    {
      title: t('totalVehicles'),
      value: overview.totalVehicles,
      icon: Car,
      color: 'text-blue-600'
    },
    {
      title: t('activeRentals'),
      value: overview.activeRentals,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: t('totalRevenue'),
      value: `${overview.totalRevenue} DH`,
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      title: t('totalDeposit', 'Cautions en cours'),
      value: `${overview.totalDeposit || 0} DH`,
      icon: DollarSign,
      color: 'text-orange-600'
    },
    {
      title: t('totalClients'),
      value: overview.totalClients,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: t('vehiclesInMaintenance', 'Véhicules en maintenance'),
      value: vehicleStatus.maintenance || 0,
      icon: Car,
      color: 'text-yellow-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h2>
        <p className="text-muted-foreground">{t('welcomeMessage')}</p>
        {/* DEV ONLY: Admin revenue reset button */}
        {isDev && isAdmin() && (
          <div className="mt-4">
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-60"
              onClick={handleResetRevenue}
              disabled={resetLoading}
            >
              {resetLoading ? t('resettingRevenue') : t('resetRevenueBtn')}
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
          <div className="col-span-4 text-center py-8">Chargement...</div>
        ) : error ? (
          <div className="col-span-4 text-center text-red-500 py-8">{error}</div>
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

      {/* Charts Section - Placeholder for now */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('monthlyRevenue')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Graphique des revenus mensuels (à implémenter)
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('vehicleStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Graphique du statut des véhicules (à implémenter)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

