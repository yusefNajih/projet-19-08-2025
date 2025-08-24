import React, { useEffect, useState } from "react";
import { Dialog } from "./ui/dialog";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import api from "../services/api";
import { t } from "i18next";

const statusColors = {
  "🟢 Conforme": "bg-green-100 text-green-800",
  "🟡 À régulariser": "bg-yellow-100 text-yellow-800",
  "🔴 Non conforme": "bg-red-100 text-red-800",
};

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}

export default function VehicleAdminTable() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gestion formulaire
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    brand: "",
    model: "",
    licensePlate: "",
    fuelType: "",
    insuranceCompany: "",
    insuranceExpiry: "",
    vignetteExpiry: "",
    inspectionExpiry: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get("/vehicleAdmin/status");
      setVehicles(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function resetForm() {
    setForm({
      brand: "",
      model: "",
      licensePlate: "",
      fuelType: "",
      insuranceCompany: "",
      insuranceExpiry: "",
      vignetteExpiry: "",
      inspectionExpiry: "",
    });
    setSelected(null);
    setEditMode(false);
  }

  function openAdd() {
    resetForm();
    setEditMode(false);
    setOpenDialog(true);
  }

  function openEdit(vehicle) {
    setSelected(vehicle);
    setEditMode(true);
    setForm({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      licensePlate: vehicle.licensePlate || "",
      fuelType: vehicle.fuelType || "",
      insuranceCompany: vehicle.insurance?.company || "",
      insuranceExpiry: vehicle.insurance?.expiryDate
        ? vehicle.insurance.expiryDate.slice(0, 10)
        : "",
      vignetteExpiry: vehicle.vignette?.expiryDate
        ? vehicle.vignette.expiryDate.slice(0, 10)
        : "",
      inspectionExpiry: vehicle.inspection?.expiryDate
        ? vehicle.inspection.expiryDate.slice(0, 10)
        : "",
    });
    setOpenDialog(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editMode && selected) {
        // 1. Mettre à jour les infos générales du véhicule
        await api.put(`/vehicles/${selected.id}`, {
          brand: form.brand,
          model: form.model,
          licensePlate: form.licensePlate,
          fuelType: form.fuelType,
        });
        // 2. Mettre à jour les documents administratifs
        await api.put(`/vehicleAdmin/${selected.id}/documents`, {
          insurance: {
            company: form.insuranceCompany,
            expiryDate: form.insuranceExpiry,
          },
          vignette: { expiryDate: form.vignetteExpiry },
          inspection: { expiryDate: form.inspectionExpiry },
        });
      } else {
        // Création véhicule (les documents seront ajoutés après édition)
        await api.post(`/vehicles`, {
          brand: form.brand,
          model: form.model,
          licensePlate: form.licensePlate,
          fuelType: form.fuelType,
        });
        // Optionnel : recharger la liste pour permettre l’édition immédiate
      }
      setOpenDialog(false);
      resetForm();
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t("Suivi administratif du parc automobile")}</h2>
        <Button onClick={openAdd}>{t("Ajouter un véhicule")}</Button>
      </div>

      {/* Dialog Formulaire */}
      {openDialog && (
        <Dialog onClose={() => setOpenDialog(false)}>
          <Card className="p-4 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editMode ? t("Modifier un véhicule") : t("Ajouter un véhicule")}
            </h3>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div>
                <label>{t("Marque")}</label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>{t("Modèle")}</label>
                <Input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>{t("Plaque")}</label>
                <Input
                  value={form.licensePlate}
                  onChange={(e) =>
                    setForm({ ...form, licensePlate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>{t("Carburant")}</label>
                <Input
                  value={form.fuelType}
                  onChange={(e) =>
                    setForm({ ...form, fuelType: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>{t("Compagnie assurance")}</label>
                <Input
                  value={form.insuranceCompany}
                  onChange={(e) =>
                    setForm({ ...form, insuranceCompany: e.target.value })
                  }
                />
              </div>
              <div>
                <label>{t("Expiration assurance")}</label>
                <Input
                  type="date"
                  value={form.insuranceExpiry}
                  onChange={(e) =>
                    setForm({ ...form, insuranceExpiry: e.target.value })
                  }
                />
              </div>
              <div>
                <label>{t("Expiration vignette")}</label>
                <Input
                  type="date"
                  value={form.vignetteExpiry}
                  onChange={(e) =>
                    setForm({ ...form, vignetteExpiry: e.target.value })
                  }
                />
              </div>
              <div>
                <label>{t("Expiration visite technique")}</label>
                <Input
                  type="date"
                  value={form.inspectionExpiry}
                  onChange={(e) =>
                    setForm({ ...form, inspectionExpiry: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2 flex gap-2 mt-2">
                <Button type="submit">
                  {editMode ? t("Enregistrer") : t("Ajouter")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    resetForm();
                    setOpenDialog(false);
                  }}
                >
                  {t("Annuler")}
                </Button>
              </div>
            </form>
          </Card>
        </Dialog>
      )}

      {/* Tableau de suivi */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th>{t("Marque")}</th>
              <th>{t("Modèle")}</th>
              <th>{t("Plaque")}</th>
              <th>{t("Carburant")}</th>
              <th>{t("Assurance")}</th>
              <th>{t("Vignette")}</th>
              <th>{t("Visite technique")}</th>
              <th>{t("Statut administratif")}</th>
              <th>{t("Alertes")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10}>{t("Chargement...")}</td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={10}>{t("Aucun véhicule")}</td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} className="border-b">
                  <td>{v.brand}</td>
                  <td>{v.model}</td>
                  <td>{v.licensePlate}</td>
                  <td>{v.fuelType}</td>
                  <td>
                    {v.insurance.company && <div>{v.insurance.company}</div>}
                    <div>{t("Expire")}: {formatDate(v.insurance.expiryDate)}</div>
                    {v.insurance.status && <div>{v.insurance.status}</div>}
                    {v.insurance.alert && (
                      <Badge color="red">{v.insurance.alert}</Badge>
                    )}
                  </td>
                  <td>
                    <div>{t("Expire")}: {formatDate(v.vignette.expiryDate)}</div>
                    {v.vignette.status && <div>{v.vignette.status}</div>}
                    {v.vignette.alert && (
                      <Badge color="red">{v.vignette.alert}</Badge>
                    )}
                  </td>
                  <td>
                    <div>{t("Expire")}: {formatDate(v.inspection.expiryDate)}</div>
                    {v.inspection.status && <div>{v.inspection.status}</div>}
                    {v.inspection.alert && (
                      <Badge color="red">{v.inspection.alert}</Badge>
                    )}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded ${
                        statusColors[v.adminStatus] || ""
                      }`}
                    >
                      {v.adminStatus}
                    </span>
                  </td>
                  <td>{v.adminAlert}</td>
                  <td>
                    <Button onClick={() => openEdit(v)}>{t("Modifier")}</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
