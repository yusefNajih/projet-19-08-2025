import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, Calendar, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();

  // Mock data - will be replaced with real API data later
  const stats = [
    {
      title: t('totalVehicles'),
      value: '24',
      icon: Car,
      color: 'text-blue-600'
    },
    {
      title: t('activeRentals'),
      value: '8',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: t('totalRevenue'),
      value: '45,230 DH',
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      title: t('totalClients'),
      value: '156',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h2>
        <p className="text-muted-foreground">
          {t('welcomeMessage')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
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
        })}
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

