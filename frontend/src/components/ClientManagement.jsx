import DocumentUploader from './DocumentUploader';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Users, Phone, Mail } from 'lucide-react';
import { clientsAPI } from '../services/api';

const ClientManagement = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  // Ajoute ces états pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationalId: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    status: 'active',
    blacklistReason: '',
    notes: ''
  });
  // (supprimé, doublon)

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    blacklisted: 'bg-red-100 text-red-800',
    suspended: 'bg-yellow-100 text-yellow-800'
  };

  const [editClientId, setEditClientId] = useState(null);
  const [newlyCreatedClientId, setNewlyCreatedClientId] = useState(null);

  const fetchClients = async (page = 1) => {
    try {
      const params = {
        page,
        limit: pagination.limit,
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const response = await clientsAPI.getAll(params);
      setClients(response.data.clients);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchTerm, statusFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
  };

  const handlePageChange = (page) => {
    fetchClients(page);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editClientId) {
        await clientsAPI.update(editClientId, formData);
      } else {
        await clientsAPI.create(formData);
      }
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationalId: '',
        licenseNumber: '',
        licenseExpiryDate: '',
        status: 'active',
        blacklistReason: '',
        notes: ''
      });
      setEditClientId(null);
      fetchClients();
    } catch (error) {
      alert(
        error?.response?.data?.message ||
        (error?.response?.data?.errors && JSON.stringify(error.response.data.errors, null, 2)) ||
        (editClientId ? "Erreur lors de la modification du client" : "Erreur lors de l'ajout du client")
      );
    }
  };

  const handleEditClient = (client) => {
    setFormData({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone || '',
      dateOfBirth: client.dateOfBirth ? client.dateOfBirth.slice(0, 10) : '',
      nationalId: client.nationalId || '',
      licenseNumber: client.licenseNumber || '',
      licenseExpiryDate: client.licenseExpiryDate ? client.licenseExpiryDate.slice(0, 10) : '',
      status: client.status || 'active',
      blacklistReason: client.blacklistReason || '',
      notes: client.notes || ''
    });
    setEditClientId(client._id);
    setShowForm(true);
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
          <h2 className="text-3xl font-bold tracking-tight">{t('clientManagement')}</h2>
          <p className="text-muted-foreground">
            Gérez vos clients et leur historique
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          {t('addClient')}
        </Button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <Card>
          <CardContent>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <Input name="firstName" placeholder="Prénom" value={formData.firstName} onChange={handleFormChange} required />
              <Input name="lastName" placeholder="Nom" value={formData.lastName} onChange={handleFormChange} required />
              <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleFormChange} required />
              <Input name="phone" placeholder="Téléphone" value={formData.phone} onChange={handleFormChange} required />
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" placeholder="Date de naissance" value={formData.dateOfBirth} onChange={handleFormChange} required />
              </div>
              <Input name="nationalId" placeholder="CIN" value={formData.nationalId} onChange={handleFormChange} required />
              <Input name="licenseNumber" placeholder="Numéro de permis" value={formData.licenseNumber} onChange={handleFormChange} required />
              <div>
                <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiration du permis</label>
                <Input id="licenseExpiryDate" name="licenseExpiryDate" type="date" placeholder="Expiration permis" value={formData.licenseExpiryDate} onChange={handleFormChange} required />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select id="status" name="status" value={formData.status} onChange={handleFormChange} className="w-full border rounded px-3 py-2">
                  <option value="active">Actif</option>
                  <option value="blacklisted">Black-listé</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
              {formData.status === 'blacklisted' && (
                <Input name="blacklistReason" placeholder="Raison du blacklist" value={formData.blacklistReason} onChange={handleFormChange} />
              )}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Input id="notes" name="notes" placeholder="Notes" value={formData.notes} onChange={handleFormChange} />
              </div>


              {/* Section Documents (création ou édition) */}
              {(editClientId || newlyCreatedClientId) && (
                <div className="space-y-2 border-t pt-4 mt-4">
                  <div className="font-semibold mb-2">Documents du client</div>
                  <DocumentUploader clientId={editClientId || newlyCreatedClientId} type="nationalId" label="CIN" />
                  <DocumentUploader clientId={editClientId || newlyCreatedClientId} type="license" label="Permis de conduire" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit">{editClientId ? 'Modifier' : 'Ajouter'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditClientId(null); setNewlyCreatedClientId(null); setFormData({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', nationalId: '', licenseNumber: '', licenseExpiryDate: '', status: 'active', blacklistReason: '', notes: '' }); }}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
              {['active', 'blacklisted', 'suspended'].map((status) => (
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

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    {client.firstName} {client.lastName}
                  </CardTitle>
                </div>
                <Badge className={statusColors[client.status]}>
                  {t(client.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Âge:</span>
                  <div className="font-medium">{calculateAge(client.dateOfBirth)} ans</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Permis:</span>
                  <div className="font-medium">{client.licenseNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Locations:</span>
                  <div className="font-medium">{client.totalRentals}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total dépensé:</span>
                  <div className="font-medium">{client.totalSpent} DH</div>
                </div>
              </div>

              {client.status === 'blacklisted' && client.blacklistReason && (
                <div className="p-2 bg-red-50 rounded text-sm">
                  <span className="text-red-700 font-medium">Raison: </span>
                  <span className="text-red-600">{client.blacklistReason}</span>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditClient(client)}>
                  <Edit className="h-4 w-4 mr-1" />
                  {t('edit')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={async () => {
                    if (!window.confirm('Confirmer la suppression du client ?')) return;
                    try {
                      await clientsAPI.delete(client._id);
                      fetchClients();
                    } catch (err) {
                      alert('Erreur lors de la suppression du client');
                    }
                  }}
                >
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

      {clients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun client trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par ajouter votre premier client.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('addClient')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientManagement;

