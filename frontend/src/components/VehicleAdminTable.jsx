
import React, { useEffect, useState } from 'react';
import { Dialog } from './ui/dialog';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import api from '../services/api';
import { t } from 'i18next';

const statusColors = {
  '🟢 Conforme': 'bg-green-100 text-green-800',
  '🟡 À régulariser': 'bg-yellow-100 text-yellow-800',
  '🔴 Non conforme': 'bg-red-100 text-red-800',
};

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
}

export default function VehicleAdminTable() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '',
    brand: '',
    model: '',
    licensePlate: '',
    fuelType: '',
    insuranceCompany: '',
    insuranceExpiry: '',
    vignetteExpiry: '',
    inspectionExpiry: '',
  });
  const [allVehicles, setAllVehicles] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchData();
    // Charger tous les véhicules pour le select
    api.get('/vehicles').then(res => {
      setAllVehicles(res.data.vehicles || res.data);
    });
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get('/vehicles/admin-status');
      setVehicles(res.data);
    } catch (e) {
      // handle error
    }
    setLoading(false);
  }

  function openEdit(vehicle) {
    setSelected(vehicle);
    setEditMode(true);
    setForm({
      vehicleId: vehicle.id,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      licensePlate: vehicle.licensePlate || '',
      fuelType: vehicle.fuelType || '',
      insuranceCompany: vehicle.insurance.company || '',
      insuranceExpiry: vehicle.insurance.expiryDate ? vehicle.insurance.expiryDate.slice(0, 10) : '',
      vignetteExpiry: vehicle.vignette.expiryDate ? vehicle.vignette.expiryDate.slice(0, 10) : '',
      inspectionExpiry: vehicle.inspection.expiryDate ? vehicle.inspection.expiryDate.slice(0, 10) : '',
    });
  }

  function resetForm() {
    setForm({
      vehicleId: '',
      brand: '',
      model: '',
      licensePlate: '',
      fuelType: '',
      insuranceCompany: '',
      insuranceExpiry: '',
      vignetteExpiry: '',
      inspectionExpiry: '',
    });
    setSelected(null);
    setEditMode(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editMode && selected) {
        await api.put(`/vehicles/${selected.id}`, {
          brand: form.brand,
          model: form.model,
          licensePlate: form.licensePlate,
          fuelType: form.fuelType,
          insurance: { company: form.insuranceCompany, expiryDate: form.insuranceExpiry },
          vignette: { expiryDate: form.vignetteExpiry },
          inspection: { expiryDate: form.inspectionExpiry },
        });
      } else {
        await api.put(`/vehicles/${form.vehicleId}/admin-status`, {
          insurance: { company: form.insuranceCompany, expiryDate: form.insuranceExpiry },
          vignette: { expiryDate: form.vignetteExpiry },
          inspection: { expiryDate: form.inspectionExpiry },
        });
      }
      resetForm();
      fetchData();
    } catch (e) {
      // handle error
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{t('Suivi administratif du parc automobile')}</h2>

      {/* Formulaire d'ajout/modification */}
      <Card className="p-4 mb-6 max-w-2xl">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          {!editMode && (
            <div className="col-span-2">
              <label>{t('Sélectionner un véhicule')}</label>
              <Select value={form.vehicleId} onValueChange={val => {
                const v = allVehicles.find(v => v._id === val || v.id === val);
                setForm(f => ({
                  ...f,
                  vehicleId: val,
                  brand: v?.brand || '',
                  model: v?.model || '',
                  licensePlate: v?.licensePlate || '',
                  fuelType: v?.fuelType || '',
                }));
              }} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('Choisir un véhicule...')} />
                </SelectTrigger>
                <SelectContent>
                  {allVehicles.map(v => (
                    <SelectItem key={v._id || v.id} value={v._id || v.id}>
                      {v.brand} {v.model} - {v.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label>{t('Marque')}</label>
            <Input value={form.brand} disabled required />
          </div>
          <div>
            <label>{t('Modèle')}</label>
            <Input value={form.model} disabled required />
          </div>
          <div>
            <label>{t('Plaque')}</label>
            <Input value={form.licensePlate} disabled required />
          </div>
          <div>
            <label>{t('Carburant')}</label>
            <Input value={form.fuelType} disabled required />
          </div>
          <div>
            <label>{t('Compagnie assurance')}</label>
            <Input value={form.insuranceCompany} onChange={e => setForm(f => ({ ...f, insuranceCompany: e.target.value }))} />
          </div>
          <div>
            <label>{t('Expiration assurance')}</label>
            <Input type="date" value={form.insuranceExpiry} onChange={e => setForm(f => ({ ...f, insuranceExpiry: e.target.value }))} />
          </div>
          <div>
            <label>{t('Expiration vignette')}</label>
            <Input type="date" value={form.vignetteExpiry} onChange={e => setForm(f => ({ ...f, vignetteExpiry: e.target.value }))} />
          </div>
          <div>
            <label>{t('Expiration visite technique')}</label>
            <Input type="date" value={form.inspectionExpiry} onChange={e => setForm(f => ({ ...f, inspectionExpiry: e.target.value }))} />
          </div>
          <div className="col-span-2 flex gap-2 mt-2">
            <Button type="submit">{editMode ? t('Enregistrer les modifications') : t('Ajouter')}</Button>
            {editMode && <Button variant="secondary" type="button" onClick={resetForm}>{t('Annuler')}</Button>}
          </div>
        </form>
      </Card>

      {/* Tableau de suivi */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th>{t('Marque')}</th>
              <th>{t('Modèle')}</th>
              <th>{t('Plaque')}</th>
              <th>{t('Carburant')}</th>
              <th>{t('Assurance')}</th>
              <th>{t('Vignette')}</th>
              <th>{t('Visite technique')}</th>
              <th>{t('Statut administratif')}</th>
              <th>{t('Alertes')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10}>{t('Chargement...')}</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan={10}>{t('Aucun véhicule')}</td></tr>
            ) : vehicles.map(v => (
              <tr key={v.id} className="border-b">
                <td>{v.brand}</td>
                <td>{v.model}</td>
                <td>{v.licensePlate}</td>
                <td>{v.fuelType}</td>
                <td>
                  {v.insurance.company && <div>{v.insurance.company}</div>}
                  <div>{t('Expire')}: {formatDate(v.insurance.expiryDate)}</div>
                  <div>{v.insurance.status}</div>
                  {v.insurance.alert && <Badge color="red">{v.insurance.alert}</Badge>}
                </td>
                <td>
                  <div>{t('Expire')}: {formatDate(v.vignette.expiryDate)}</div>
                  <div>{v.vignette.status}</div>
                  {v.vignette.alert && <Badge color="red">{v.vignette.alert}</Badge>}
                </td>
                <td>
                  <div>{t('Expire')}: {formatDate(v.inspection.expiryDate)}</div>
                  <div>{v.inspection.status}</div>
                  {v.inspection.alert && <Badge color="red">{v.inspection.alert}</Badge>}
                </td>
                <td><span className={`px-2 py-1 rounded ${statusColors[v.adminStatus]}`}>{v.adminStatus}</span></td>
                <td>{v.adminAlert}</td>
                <td><Button onClick={() => openEdit(v)}>{t('Modifier')}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
