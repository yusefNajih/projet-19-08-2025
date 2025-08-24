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
        await api.put(`/vehicles/${selected.id}`, {
          brand: form.brand,
          model: form.model,
          licensePlate: form.licensePlate,
          fuelType: form.fuelType,
        });
        await api.put(`/vehicleAdmin/${selected.id}/documents`, {
          insurance: {
            company: form.insuranceCompany,
            expiryDate: form.insuranceExpiry,
          },
          vignette: { expiryDate: form.vignetteExpiry },
          inspection: { expiryDate: form.inspectionExpiry },
        });
      } else {
        await api.post(`/vehicles`, {
          brand: form.brand,
          model: form.model,
          licensePlate: form.licensePlate,
          fuelType: form.fuelType,
        });
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t("Suivi administratif du parc automobile")}</h2>
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

      {/* Liste en Cards */}
      {loading ? (
        <p>{t("Chargement...")}</p>
      ) : vehicles.length === 0 ? (
        <p>{t("Aucun véhicule")}</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <Card key={v.id} className="p-4 shadow-md border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  {v.brand} {v.model}
                </h3>
                <Badge className={statusColors[v.adminStatus] || ""}>
                  {v.adminStatus}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {t("Plaque")}: <span className="font-medium">{v.licensePlate}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {t("Carburant")}: <span className="font-medium">{v.fuelType}</span>
              </p>

              {/* Assurance */}
              <div className="mb-2">
                <h4 className="font-medium">{t("Assurance")}</h4>
                <p>{v.insurance.company}</p>
                <p>{t("Expire")}: {formatDate(v.insurance.expiryDate)}</p>
                {v.insurance.alert && <Badge color="red">{v.insurance.alert}</Badge>}
              </div>

              {/* Vignette */}
              <div className="mb-2">
                <h4 className="font-medium">{t("Vignette")}</h4>
                <p>{t("Expire")}: {formatDate(v.vignette.expiryDate)}</p>
                {v.vignette.alert && <Badge color="red">{v.vignette.alert}</Badge>}
              </div>

              {/* Visite technique */}
              <div className="mb-4">
                <h4 className="font-medium">{t("Visite technique")}</h4>
                <p>{t("Expire")}: {formatDate(v.inspection.expiryDate)}</p>
                {v.inspection.alert && <Badge color="red">{v.inspection.alert}</Badge>}
              </div>

              {/* Bouton modifier */}
              <div className="flex justify-end">
                <Button size="sm" onClick={() => openEdit(v)}>
                  {t("Modifier")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
