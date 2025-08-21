import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Calendar, Car, User } from 'lucide-react';
import { reservationsAPI } from '../services/api';
import invoiceAPI from '../services/invoice';
import ReservationForm from './ReservationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
console.log('[ReservationManagement] module loaded');

const ReservationManagement = ({ triggerVehicleRefresh }) => {
  const { t } = useTranslation();
  useEffect(() => {
    console.log('[ReservationManagement] mount');
  }, []);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [showForm, setShowForm] = useState(false);
  const [editReservation, setEditReservation] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  // Téléchargement de la facture PDF
  const handleDownloadInvoice = async (reservation) => {
    try {
      const blob = await invoiceAPI.download(reservation._id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${reservation.reservationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement de la facture');
    }
  };

  const fetchReservations = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await reservationsAPI.getAll(params);
      setReservations(response.data.reservations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, showForm]);

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
  };

  const handleAdd = () => {
    console.log('[ReservationManagement] handleAdd called');
    setEditReservation(null);
    setShowForm(true);
    setTimeout(() => {
      console.log('[ReservationManagement] showForm after handleAdd:', true);
    }, 0);
  };

  const handleEdit = (reservation) => {
    console.log('[ReservationManagement] handleEdit called', reservation);
    setEditReservation(reservation);
    setShowForm(true);
    setTimeout(() => {
      console.log('[ReservationManagement] showForm after handleEdit:', true);
    }, 0);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await reservationsAPI.delete(deleteId);
      setDeleteId(null);
      fetchReservations();
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchReservations(page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    console.log('[ReservationManagement] render, showForm:', showForm, 'editReservation:', editReservation);
  });

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
          <h2 className="text-3xl font-bold tracking-tight">{t('reservationManagement')}</h2>
          <p className="text-muted-foreground">
            Gérez les réservations et locations
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          {t('addReservation')}
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
                  placeholder="Rechercher par numéro de réservation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['pending', 'confirmed', 'active', 'completed', 'cancelled'].map((status) => (
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

      {/* Reservations Grid */}
      <div className="grid gap-4">
        {reservations.map((reservation) => {
          return (
            <Card key={reservation._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      {reservation.reservationNumber}
                    </CardTitle>
                  </div>
                  <Badge className={statusColors[reservation.status]}>
                    {t(reservation.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Client Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4" />
                      Client
                    </div>
                    <div>
                      <div className="font-medium">
                        {reservation.client?.firstName} {reservation.client?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.client?.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.client?.phone}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Car className="h-4 w-4" />
                      Véhicule
                    </div>
                    <div>
                      <div className="font-medium">
                        {reservation.vehicle?.brand} {reservation.vehicle?.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.vehicle?.licensePlate}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.dailyRate} DH/jour
                      </div>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      Période
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-medium">Du:</span> {formatDate(reservation.startDate)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Au:</span> {formatDate(reservation.endDate)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {calculateDuration(reservation.startDate, reservation.endDate)} jour(s)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center p-3 rounded bg-gray-50 dark:bg-zinc-800">
                  <div className="text-sm">
                    <span className="text-muted-foreground dark:text-gray-300">Montant de base:</span>
                    <span className="ml-2 font-medium dark:text-white">{reservation.baseAmount} DH</span>
                  </div>
                  <div className="text-lg font-bold dark:text-white">
                    Total: {reservation.totalAmount} DH
                  </div>
                </div>

                {/* Additional Fees */}
                {reservation.additionalFees && reservation.additionalFees.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Frais supplémentaires:</div>
                    {reservation.additionalFees.map((fee, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{fee.description}</span>
                        <span>{fee.amount} DH</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Caution info et Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  {reservation.deposit?.amount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Caution :</span>
                      <span>{reservation.deposit.amount} DH</span>
                      {reservation.deposit.paid ? (
                        <span className="text-green-600 ml-2">Remboursée</span>
                      ) : (
                        <span className="text-orange-600 ml-2">Non remboursée</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(reservation)}>
                      <Edit className="h-4 w-4 mr-1" />
                      {t('edit')}
                    </Button>
                  {(reservation.status === 'active' || reservation.status === 'completed') && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 font-semibold"
                        style={{ textTransform: 'uppercase', letterSpacing: 1 }}
                        onClick={() => handleDownloadInvoice(reservation)}
                      >
                        {t('downloadInvoice', 'Télécharger facture')}
                      </Button>
                      {reservation.status === 'active' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 text-white font-semibold"
                          style={{ backgroundColor: '#e53935', textTransform: 'uppercase', letterSpacing: 1 }}
                          onClick={async () => {
                            if (!window.confirm('Confirmer la fin de location ?')) return;
                            try {
                              await reservationsAPI.update(reservation._id, { status: 'completed' });
                              fetchReservations();
                              if (typeof triggerVehicleRefresh === 'function') triggerVehicleRefresh();
                            } catch (err) {
                              alert('Erreur lors de la clôture de la réservation');
                            }
                          }}
                        >
                          Fin de location
                        </Button>
                      )}
                      {/* Bouton rembourser caution */}
                      {reservation.status === 'completed' && reservation.deposit?.amount > 0 && !reservation.deposit.paid && (
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-1 font-semibold"
                          style={{ backgroundColor: '#43a047', color: 'white', textTransform: 'uppercase', letterSpacing: 1 }}
                          onClick={async () => {
                            if (!window.confirm('Confirmer le remboursement de la caution ?')) return;
                            try {
                              await reservationsAPI.update(reservation._id, { deposit: { ...reservation.deposit, paid: true, paidDate: new Date() } });
                              fetchReservations();
                            } catch (err) {
                              alert('Erreur lors du remboursement de la caution');
                            }
                          }}
                        >
                          Rembourser caution
                        </Button>
                      )}
                    </>
                  )}
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleteId(reservation._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Formulaire d'ajout/édition */}
      <ReservationForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchReservations}
        initialData={editReservation}
      />

      {/* Dialog de confirmation suppression */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>Voulez-vous vraiment supprimer cette réservation ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteLoading}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {reservations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune réservation trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première réservation.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('addReservation')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReservationManagement;

