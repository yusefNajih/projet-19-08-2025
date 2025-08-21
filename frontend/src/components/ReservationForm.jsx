console.log('[ReservationForm] module loaded');
import { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { clientsAPI, vehiclesAPI, reservationsAPI } from '../services/api';

const ReservationForm = ({ open, onClose, onSuccess, initialData }) => {
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    client: '',
    vehicle: '',
    startDate: '',
    endDate: '',
    pickupLocation: '',
    returnLocation: '',
    notes: '',
    status: 'pending',
    depositAmount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[ReservationForm] mount, open:', open, 'initialData:', initialData);
    clientsAPI.getAll().then(res => {
      setClients(res.data.clients || []);
      console.log('[ReservationForm] clients loaded:', res.data.clients);
    });
    vehiclesAPI.getAll().then(res => {
      // Ne garder que les véhicules disponibles
      const availableVehicles = (res.data.vehicles || []).filter(v => v.status === 'available');
      setVehicles(availableVehicles);
      console.log('[ReservationForm] vehicles loaded:', availableVehicles);
    });
    if (initialData) {
      setForm({
        client: initialData.client || '',
        vehicle: initialData.vehicle || '',
        startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
        endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : '',
        pickupLocation: initialData.pickupLocation || '',
        returnLocation: initialData.returnLocation || '',
        notes: initialData.notes || '',
        status: initialData.status || 'pending',
        depositAmount: initialData.deposit?.amount?.toString() || '',
      });
      console.log('[ReservationForm] initialData set in form:', initialData);
    }
  }, [initialData, open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    console.log('[ReservationForm] handleChange', e.target.name, e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Only send fields expected by backend
    const payload = {
      client: form.client,
      vehicle: form.vehicle,
      startDate: form.startDate,
      endDate: form.endDate,
      pickupLocation: form.pickupLocation,
      returnLocation: form.returnLocation,
      notes: form.notes,
      status: form.status,
      deposit: { amount: form.depositAmount ? Number(form.depositAmount) : 0 },
    };
    console.log('[ReservationForm] handleSubmit', payload);
    try {
      if (initialData && initialData._id) {
        await reservationsAPI.update(initialData._id, payload);
        console.log('[ReservationForm] update reservation', initialData._id, payload);
      } else {
        await reservationsAPI.create(payload);
        console.log('[ReservationForm] create reservation', payload);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      let msg = 'An error occurred while saving the reservation.';
      if (err.response && err.response.data) {
        if (err.response.data.message) msg = err.response.data.message;
        else if (err.response.data.errors) msg = err.response.data.errors.map(e => e.msg).join(' | ');
      }
      setError(msg);
      console.error('[ReservationForm] error saving reservation', err, msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[ReservationForm] render, open:', open);
  });
  return (
    <Dialog open={open} onOpenChange={val => { console.log('[ReservationForm] Dialog onOpenChange', val); onClose(val); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Modifier' : 'Ajouter'} une réservation</DialogTitle>
        </DialogHeader>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Client</label>
            <Select value={form.client} onValueChange={val => setForm(f => ({ ...f, client: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c._id} value={c._id}>{c.firstName} {c.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label>Véhicule</label>
            <Select value={form.vehicle} onValueChange={val => setForm(f => ({ ...f, vehicle: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un véhicule" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(v => (
                  <SelectItem key={v._id} value={v._id}>{v.brand} {v.model} ({v.licensePlate})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="startDate" className="font-medium">Date de début (départ/location)</label>
            <Input id="startDate" type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="endDate" className="font-medium">Date de fin (retour)</label>
            <Input id="endDate" type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
          </div>
          {/*
          <div>
            <label>Tarif journalier</label>
            <Input type="number" name="dailyRate" value={form.dailyRate} onChange={handleChange} required />
          </div>
          */}
          <div>
            <label>Lieu de prise en charge</label>
            <Input type="text" name="pickupLocation" value={form.pickupLocation} onChange={handleChange} />
          </div>
          <div>
            <label>Lieu de retour</label>
            <Input type="text" name="returnLocation" value={form.returnLocation} onChange={handleChange} />
          </div>
          <div>
            <label>Montant de la caution (DH)</label>
            <Input type="number" name="depositAmount" min="0" value={form.depositAmount} onChange={handleChange} required />
          </div>
          <div>
            <label>Notes</label>
            <Input type="text" name="notes" value={form.notes} onChange={handleChange} />
          </div>
          <div>
            <label>Statut</label>
            <Select value={form.status} onValueChange={val => setForm(f => ({ ...f, status: val }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReservationForm;
      
