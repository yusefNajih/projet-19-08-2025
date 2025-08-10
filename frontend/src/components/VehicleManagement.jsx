import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Car } from 'lucide-react';
import { vehiclesAPI } from '../services/api';

const VehicleManagement = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    rented: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    out_of_service: 'bg-red-100 text-red-800'
  };

  const fetchVehicles = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter
      };
      
      const response = await vehiclesAPI.getAll(params);
      setVehicles(response.data.vehicles);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [searchTerm, statusFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
  };

  const handlePageChange = (page) => {
    fetchVehicles(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('loading')}...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('vehicleManagement')}</h2>
          <p className="text-muted-foreground">
            Gérez votre flotte de véhicules
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('addVehicle')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['available', 'rented', 'maintenance', 'out_of_service'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusFilter(status)}
                >
                  {t(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    {vehicle.brand} {vehicle.model}
                  </CardTitle>
                </div>
                <Badge className={statusColors[vehicle.status]}>
                  {t(vehicle.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Plaque:</span>
                  <div className="font-medium">{vehicle.licensePlate}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Année:</span>
                  <div className="font-medium">{vehicle.year}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Carburant:</span>
                  <div className="font-medium">{vehicle.fuelType}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Prix/jour:</span>
                  <div className="font-medium">{vehicle.dailyPrice} DH</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Kilométrage:</span>
                  <div className="font-medium">{vehicle.mileage.toLocaleString()} km</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Places:</span>
                  <div className="font-medium">{vehicle.seats}</div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  {t('edit')}
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.current === 1}
            onClick={() => handlePageChange(pagination.current - 1)}
          >
            Précédent
          </Button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={pagination.current === page ? 'default' : 'outline'}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            disabled={pagination.current === pagination.pages}
            onClick={() => handlePageChange(pagination.current + 1)}
          >
            Suivant
          </Button>
        </div>
      )}

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun véhicule trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par ajouter votre premier véhicule à la flotte.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('addVehicle')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleManagement;

