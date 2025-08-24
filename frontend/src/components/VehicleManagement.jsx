import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Car,
  X,
  Upload,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";

// API réelle pour communiquer avec votre backend
const vehiclesAPI = {
  getToken() {
    // Récupère le token JWT depuis localStorage (ou autre méthode selon ton app)
    return localStorage.getItem("token");
  },

  async getAll(params) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.search) searchParams.append("search", params.search);
    if (params.status) searchParams.append("status", params.status);
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);
    const url = `http://localhost:5001/api/vehicles?${searchParams.toString()}`;
    console.log("Fetching vehicles from:", url);
    const token = vehiclesAPI.getToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },

  async create(formData) {
    console.log("Envoi de données vers le serveur...");
    for (let pair of formData.entries()) {
      console.log(
        pair[0] +
          ": " +
          (pair[1] instanceof File ? `Fichier: ${pair[1].name}` : pair[1])
      );
    }
    const token = vehiclesAPI.getToken();
    const response = await fetch("http://localhost:5001/api/vehicles", {
      method: "POST",
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const responseText = await response.text();
    console.log("Réponse brute du serveur:", responseText);
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = {
          message: `Erreur HTTP ${response.status}: ${responseText}`,
        };
      }
      throw { response: { data: errorData, status: response.status } };
    }
    try {
      return JSON.parse(responseText);
    } catch {
      return { data: { message: "Véhicule créé avec succès" } };
    }
  },

  async update(id, formData) {
    console.log("Mise à jour du véhicule:", id);
    for (let pair of formData.entries()) {
      console.log(
        pair[0] +
          ": " +
          (pair[1] instanceof File ? `Fichier: ${pair[1].name}` : pair[1])
      );
    }
    const token = vehiclesAPI.getToken();
    const response = await fetch(`http://localhost:5001/api/vehicles/${id}`, {
      method: "PUT",
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const responseText = await response.text();
    console.log("Réponse brute du serveur:", responseText);
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = {
          message: `Erreur HTTP ${response.status}: ${responseText}`,
        };
      }
      throw { response: { data: errorData, status: response.status } };
    }
    try {
      return JSON.parse(responseText);
    } catch {
      return { data: { message: "Véhicule mis à jour avec succès" } };
    }
  },

  async delete(id) {
    console.log("Suppression du véhicule:", id);
    const token = vehiclesAPI.getToken();
    const response = await fetch(`http://localhost:5001/api/vehicles/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Erreur HTTP ${response.status}`,
      }));
      throw { response: { data: errorData, status: response.status } };
    }
    return await response.json();
  },
};

const VehicleManagement = ({ vehicleRefreshFlag = 0 }) => {
  // États pour les véhicules
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("brand");
  const [sortOrder, setSortOrder] = useState("asc");

  // États pour la pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // États pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [editVehicleId, setEditVehicleId] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    licensePlate: "",
    registrationNumber: "",
    fuelType: "",
    dailyPrice: "",
    mileage: "",
    seats: "",
    image: null,
    status: "available",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();

  // Configuration des statuts et couleurs
  const statusConfig = {
    available: { label: "Disponible", color: "bg-green-100 text-green-800" },
    rented: { label: "Loué", color: "bg-blue-100 text-blue-800" },
    maintenance: {
      label: "En maintenance",
      color: "bg-yellow-100 text-yellow-800",
    },
    out_of_service: { label: "Hors service", color: "bg-red-100 text-red-800" },
  };

  // Les valeurs doivent être en minuscules pour l'API
  const fuelTypes = [
    { label: "Essence", value: "essence" },
    { label: "Diesel", value: "diesel" },
    { label: "Hybride", value: "hybrid" },
    { label: "Électrique", value: "electric" },
  ];

  // Fonction pour charger les véhicules
  // error
  const fetchVehicles = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm,
        sortBy,
        sortOrder,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await vehiclesAPI.getAll(params);
      if (response?.vehicles) {
        // format { vehicles, pagination }
        setVehicles(response.vehicles);
        setPagination(response.pagination);
      } else if (Array.isArray(response)) {
        // format tableau direct
        setVehicles(response);
        setPagination({
          current: 1,
          pages: 1,
          total: response.length,
          limit: pagination.limit,
        });
      } else {
        console.error("Format de réponse inattendu:", response);
        setVehicles([]);
        setPagination({
          current: 1,
          pages: 1,
          total: 0,
          limit: pagination.limit,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des véhicules:", error);
      alert("Erreur lors du chargement des véhicules");
    } finally {
      setLoading(false);
    }
  };

  // Effet pour recharger les données
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVehicles();
    }, 300); // Debounce de 300ms pour la recherche

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sortBy, sortOrder, vehicleRefreshFlag]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim()) newErrors.brand = "La marque est requise";
    if (!formData.model.trim()) newErrors.model = "Le modèle est requis";
    if (
      !formData.year ||
      formData.year < 1900 ||
      formData.year > new Date().getFullYear() + 1
    ) {
      newErrors.year = "Année invalide";
    }
    if (!formData.licensePlate.trim())
      newErrors.licensePlate = "La plaque est requise";
    if (!formData.fuelType)
      newErrors.fuelType = "Le type de carburant est requis";
    if (!formData.dailyPrice || formData.dailyPrice <= 0)
      newErrors.dailyPrice = "Prix invalide";
    if (!formData.mileage || formData.mileage < 0)
      newErrors.mileage = "Kilométrage invalide";
    if (!formData.seats || formData.seats < 1 || formData.seats > 50)
      newErrors.seats = "Nombre de places invalide";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file) {
        // Validation du fichier
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB

        console.log("Fichier sélectionné:", {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        });

        if (!validTypes.includes(file.type.toLowerCase())) {
          alert(
            `Format d'image non supporté: ${file.type}. Utilisez JPG, PNG ou WebP.`
          );
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        if (file.size > maxSize) {
          alert(
            `L'image est trop volumineuse (${(file.size / 1024 / 1024).toFixed(
              2
            )}MB). Maximum 5MB.`
          );
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        // Mettre à jour l'état avec le fichier
        setFormData((prev) => ({ ...prev, image: file }));

        // Créer la prévisualisation
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log("Prévisualisation créée");
          setImagePreview(e.target.result);
        };
        reader.onerror = (e) => {
          console.error("Erreur lors de la lecture du fichier:", e);
          alert("Erreur lors de la lecture du fichier");
        };
        reader.readAsDataURL(file);
      } else {
        // Aucun fichier sélectionné
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
      }
    } else {
      // Autres champs
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Supprimer l'erreur pour ce champ
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  // Soumission du formulaire
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const data = new FormData();

      // Ajouter tous les champs texte
      data.append("brand", formData.brand);
      data.append("model", formData.model);
      data.append("year", formData.year.toString());
      data.append("licensePlate", formData.licensePlate);
      data.append("registrationNumber", formData.registrationNumber);
      data.append("fuelType", formData.fuelType.toLowerCase());
      data.append("dailyPrice", formData.dailyPrice.toString());
      data.append("mileage", formData.mileage.toString());
      data.append("seats", formData.seats.toString());
      data.append("status", formData.status);

      // Ajouter l'image si elle existe
      if (formData.image && formData.image instanceof File) {
        console.log(
          "Ajout de l'image:",
          formData.image.name,
          "Taille:",
          formData.image.size
        );
        data.append("image", formData.image, formData.image.name);
      }

      // Debug: Afficher le contenu de FormData
      console.log("Données à envoyer:");
      for (let pair of data.entries()) {
        console.log(
          pair[0] +
            ": " +
            (pair[1] instanceof File ? `Fichier: ${pair[1].name}` : pair[1])
        );
      }

      let response;
      if (editVehicleId) {
        response = await vehiclesAPI.update(editVehicleId, data);
        alert("Véhicule mis à jour avec succès!");
      } else {
        response = await vehiclesAPI.create(data);
        alert("Véhicule créé avec succès!");
      }

      console.log("Réponse du serveur:", response);

      handleFormReset();
      fetchVehicles();
    } catch (error) {
      console.error("Erreur complète:", error);
      console.error("Réponse du serveur:", error?.response?.data);

      let errorMessage = "Une erreur est survenue lors de ";
      errorMessage += editVehicleId ? "la modification" : "la création";
      errorMessage += " du véhicule.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).join(", ");
      } else if (error?.message) {
        errorMessage += ` Détail: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialisation du formulaire
  const handleFormReset = () => {
    setFormData({
      brand: "",
      model: "",
      year: "",
      licensePlate: "",
      fuelType: "",
      dailyPrice: "",
      mileage: "",
      seats: "",
      image: null,
      status: "available",
    });
    setImagePreview(null);
    setErrors({});
    setEditVehicleId(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Édition d'un véhicule
  const handleEditVehicle = (vehicle) => {
    setFormData({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      licensePlate: vehicle.licensePlate || "",
      fuelType: vehicle.fuelType || "",
      dailyPrice: vehicle.dailyPrice || "",
      mileage: vehicle.mileage || "",
      seats: vehicle.seats || "",
      image: null,
      status: vehicle.status || "available",
    });
    setEditVehicleId(vehicle._id);
    setShowForm(true);
    setImagePreview(
      vehicle.image
        ? `http://localhost:5001/${vehicle.image.replace(/\\/g, "/")}`
        : null
    );
  };

  // Suppression d'un véhicule
  const handleDelete = async (id, vehicleName) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer le véhicule "${vehicleName}" ?`
      )
    ) {
      return;
    }

    try {
      await vehiclesAPI.delete(id);
      alert("Véhicule supprimé avec succès!");
      fetchVehicles();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du véhicule");
    }
  };

  // Changement de statut rapide
  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await vehiclesAPI.update(vehicleId, { status: newStatus });
      fetchVehicles();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      alert("Erreur lors du changement de statut");
    }
  };

  // Tri des véhicules
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-lg">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestion des Véhicules
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez votre flotte de véhicules ({vehicles.length} véhicule
            {vehicles.length !== 1 ? "s" : ""})
          </p>
        </div>
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" />
          Ajouter un véhicule
        </Button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {editVehicleId
                  ? "Modifier le véhicule"
                  : "Ajouter un nouveau véhicule"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleFormReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Marque *
                  </label>
                  <Input
                    name="brand"
                    placeholder="Dacia, Renault, Mercedes..."
                    value={formData.brand}
                    onChange={handleFormChange}
                    className={errors.brand ? "border-red-500" : ""}
                    required
                  />
                  {errors.brand && (
                    <span className="text-red-500 text-xs">{errors.brand}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Modèle *
                  </label>
                  <Input
                    name="model"
                    placeholder="Logan, Express, Clio..."
                    value={formData.model}
                    onChange={handleFormChange}
                    className={errors.model ? "border-red-500" : ""}
                    required
                  />
                  {errors.model && (
                    <span className="text-red-500 text-xs">{errors.model}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Plaque d'immatriculation *
                  </label>
                  <Input
                    name="licensePlate"
                    placeholder="ABC-123"
                    value={formData.licensePlate}
                    onChange={handleFormChange}
                    className={errors.licensePlate ? "border-red-500" : ""}
                    style={{ textTransform: "uppercase" }}
                    required
                  />
                  {errors.licensePlate && (
                    <span className="text-red-500 text-xs">
                      {errors.licensePlate}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Année *
                  </label>
                  <Input
                    name="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder="2023"
                    value={formData.year}
                    onChange={handleFormChange}
                    className={errors.year ? "border-red-500" : ""}
                    required
                  />
                  {errors.year && (
                    <span className="text-red-500 text-xs">{errors.year}</span>
                  )}
                </div>



                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type de carburant *
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleFormChange}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.fuelType ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {fuelTypes.map((fuel) => (
                      <option key={fuel.value} value={fuel.value}>
                        {fuel.label}
                      </option>
                    ))}
                  </select>
                  {errors.fuelType && (
                    <span className="text-red-500 text-xs">
                      {errors.fuelType}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prix par jour (DH) *
                  </label>
                  <Input
                    name="dailyPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="250.00"
                    value={formData.dailyPrice}
                    onChange={handleFormChange}
                    className={errors.dailyPrice ? "border-red-500" : ""}
                    required
                  />
                  {errors.dailyPrice && (
                    <span className="text-red-500 text-xs">
                      {errors.dailyPrice}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kilométrage *
                  </label>
                  <Input
                    name="mileage"
                    type="number"
                    min="0"
                    placeholder="45000"
                    value={formData.mileage}
                    onChange={handleFormChange}
                    className={errors.mileage ? "border-red-500" : ""}
                    required
                  />
                  {errors.mileage && (
                    <span className="text-red-500 text-xs">
                      {errors.mileage}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre de places *
                  </label>
                  <Input
                    name="seats"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="5"
                    value={formData.seats}
                    onChange={handleFormChange}
                    className={errors.seats ? "border-red-500" : ""}
                    required
                  />
                  {errors.seats && (
                    <span className="text-red-500 text-xs">{errors.seats}</span>
                  )}
                </div>
              </div>

              {/* Upload d'image avec prévisualisation */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image du véhicule
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Input
                      ref={fileInputRef}
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFormChange}
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">
                      Formats acceptés: JPG, PNG, WebP. Taille max: 5MB
                    </p>
                  </div>
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Prévisualisation"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 h-6 w-6"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, image: null });
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editVehicleId ? "Mise à jour..." : "Création..."}
                    </>
                  ) : editVehicleId ? (
                    "Mettre à jour"
                  ) : (
                    "Créer le véhicule"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFormReset}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

    

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par marque, modèle ou plaque..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Bouton filtres */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres
                {showFilters ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Filtres étendus */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm font-medium text-gray-600 self-center">
                  Statut:
                </span>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setStatusFilter(statusFilter === status ? "" : status)
                    }
                    className={statusFilter === status ? "bg-blue-600" : ""}
                  >
                    {config.label}
                  </Button>
                ))}

                {statusFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter("")}
                    className="text-gray-500"
                  >
                    <X className="h-4 w-4" />
                    Effacer
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
       {/* Statistiques en bas de page */}
      {vehicles.length > 0 && (
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {vehicles.filter((v) => v.status === "available").length}
                </div>
                <div className="text-sm text-gray-600">Disponibles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {vehicles.filter((v) => v.status === "rented").length}
                </div>
                <div className="text-sm text-gray-600">Loués</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {vehicles.filter((v) => v.status === "maintenance").length}
                </div>
                <div className="text-sm text-gray-600">En maintenance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {vehicles.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Grille des véhicules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle._id}
            className="hover:shadow-lg transition-all duration-200 border hover:border-blue-300"
          >
            {/* Image du véhicule */}
            {vehicle.image ? (
              <img
                src={`http://localhost:5001/${vehicle.image.replace(
                  /\\/g,
                  "/"
                )}`}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <Car className="h-12 w-12 text-gray-400" />
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-lg">
                    {vehicle.brand} {vehicle.model}
                  </CardTitle>
                </div>
                <Badge
                  className={
                    statusConfig[vehicle.status]?.color ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {statusConfig[vehicle.status]?.label || vehicle.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Informations du véhicule */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Plaque:</span>
                  <div className="font-semibold">{vehicle.licensePlate}</div>
                </div>
                <div>
                  <span className="text-gray-500">Année:</span>
                  <div className="font-semibold">{vehicle.year}</div>
                </div>
                <div>
                  <span className="text-gray-500">Carburant:</span>
                  <div className="font-semibold">{vehicle.fuelType}</div>
                </div>
                <div>
                  <span className="text-gray-500">Prix/jour:</span>
                  <div className="font-semibold text-green-600">
                    {vehicle.dailyPrice} DH
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Kilométrage:</span>
                  <div className="font-semibold">
                    {vehicle.mileage?.toLocaleString()} km
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Places:</span>
                  <div className="font-semibold">{vehicle.seats}</div>
                </div>
              </div>

              {/* Changement de statut rapide */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Changer le statut:
                </label>
                <select
                  value={vehicle.status}
                  onChange={(e) =>
                    handleStatusChange(vehicle._id, e.target.value)
                  }
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleEditVehicle(vehicle)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() =>
                    handleDelete(
                      vehicle._id,
                      `${vehicle.brand} ${vehicle.model}`
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* État vide */}
      {vehicles.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
              {searchTerm || statusFilter
                ? "Aucun véhicule trouvé"
                : "Aucun véhicule dans la flotte"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter
                ? "Essayez de modifier vos critères de recherche ou vos filtres."
                : "Commencez par ajouter votre premier véhicule à la flotte."}
            </p>
            {!searchTerm && !statusFilter && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier véhicule
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={pagination.current === 1}
            onClick={() => fetchVehicles(pagination.current - 1)}
            size="sm"
          >
            Précédent
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.current <= 3) {
                pageNum = i + 1;
              } else if (pagination.current >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.current - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={
                    pagination.current === pageNum ? "default" : "outline"
                  }
                  onClick={() => fetchVehicles(pageNum)}
                  size="sm"
                  className={
                    pagination.current === pageNum ? "bg-blue-600" : ""
                  }
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            disabled={pagination.current === pagination.pages}
            onClick={() => fetchVehicles(pagination.current + 1)}
            size="sm"
          >
            Suivant
          </Button>
        </div>
      )}


      {/* Loading overlay pour les actions */}
      {loading && vehicles.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
// import { useState, useEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Plus, Search, Edit, Trash2, Car } from 'lucide-react';
// import { vehiclesAPI } from '../services/api';

// const VehicleManagement = ({ vehicleRefreshFlag }) => {
//   const { t } = useTranslation();
//   const [vehicles, setVehicles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pages: 1,
//     total: 0,
//     limit: 10
//   });
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     brand: '',
//     model: '',
//     year: '',
//     licensePlate: '',
//     fuelType: '',
//     dailyPrice: '',
//     mileage: '',
//     seats: '',
//     image: null
//   });
//   const [editVehicleId, setEditVehicleId] = useState(null);
//   const fileInputRef = useRef();

//   const statusColors = {
//     available: 'bg-green-100 text-green-800',
//     rented: 'bg-blue-100 text-blue-800',
//     maintenance: 'bg-yellow-100 text-yellow-800',
//     out_of_service: 'bg-red-100 text-red-800'
//   };

//   const fetchVehicles = async (page = 1) => {
//     try {
//       setLoading(true);
//       const params = {
//         page,
//         limit: pagination.limit,
//         search: searchTerm
//       };
//       if (statusFilter) {
//         params.status = statusFilter;
//       }
//       const response = await vehiclesAPI.getAll(params);
//       setVehicles(response.data.vehicles);
//       setPagination(response.data.pagination);
//     } catch (error) {
//       console.error('Error fetching vehicles:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVehicles();
//     // eslint-disable-next-line
//   }, [searchTerm, statusFilter, vehicleRefreshFlag]);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleStatusFilter = (status) => {
//     setStatusFilter(status === statusFilter ? '' : status);
//   };

//   const handlePageChange = (page) => {
//     fetchVehicles(page);
//   };

//   const handleAddClick = () => setShowForm(true);

//   const handleFormChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'image') {
//       setFormData({ ...formData, image: files[0] });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     const data = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (value && key !== 'image') data.append(key, value);
//     });
//     if (formData.image) data.append('image', formData.image);
//     try {
//       if (editVehicleId) {
//         await vehiclesAPI.update(editVehicleId, data);
//       } else {
//         await vehiclesAPI.create(data);
//       }
//       setShowForm(false);
//       setFormData({
//         brand: '',
//         model: '',
//         year: '',
//         licensePlate: '',
//         fuelType: '',
//         dailyPrice: '',
//         mileage: '',
//         seats: '',
//         image: null
//       });
//       setEditVehicleId(null);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//       fetchVehicles();
//     } catch (error) {
//       alert(
//         error?.response?.data?.message ||
//         (error?.response?.data?.errors && JSON.stringify(error.response.data.errors, null, 2))
//       );
//     }
//   };

//   const handleEditVehicle = (vehicle) => {
//     setFormData({
//       brand: vehicle.brand || '',
//       model: vehicle.model || '',
//       year: vehicle.year || '',
//       licensePlate: vehicle.licensePlate || '',
//       fuelType: vehicle.fuelType || '',
//       dailyPrice: vehicle.dailyPrice || '',
//       mileage: vehicle.mileage || '',
//       seats: vehicle.seats || '',
//       image: null // image editing is optional, user can re-upload
//     });
//     setEditVehicleId(vehicle._id);
//     setShowForm(true);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) return;
//     try {
//       await vehiclesAPI.delete(id);
//       // Recharge la liste après suppression
//       fetchVehicles();
//     } catch (error) {
//       alert("Erreur lors de la suppression du véhicule");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-lg">{t('loading')}...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">{t('vehicleManagement')}</h2>
//           <p className="text-muted-foreground">
//             Gérez votre flotte de véhicules
//           </p>
//         </div>
//         <Button className="flex items-center gap-2" onClick={handleAddClick}>
//           <Plus className="h-4 w-4" />
//           {t('addVehicle')}
//         </Button>
//       </div>

//       {/* Formulaire d'ajout/modification */}
//       {showForm && (
//         <Card>
//           <CardContent>
//             <form className="space-y-4" onSubmit={handleFormSubmit} encType="multipart/form-data">
//               <div className="grid grid-cols-2 gap-4">
//                 <Input name="brand" placeholder="Marque" value={formData.brand} onChange={handleFormChange} required />
//                 <Input name="model" placeholder="Modèle" value={formData.model} onChange={handleFormChange} required />
//                 <Input name="year" type="number" placeholder="Année" value={formData.year} onChange={handleFormChange} required />
//                 <Input name="licensePlate" placeholder="Plaque" value={formData.licensePlate} onChange={handleFormChange} required />
//                 <Input name="fuelType" placeholder="Carburant" value={formData.fuelType} onChange={handleFormChange} required />
//                 <Input name="dailyPrice" type="number" placeholder="Prix/jour" value={formData.dailyPrice} onChange={handleFormChange} required />
//                 <Input name="mileage" type="number" placeholder="Kilométrage" value={formData.mileage} onChange={handleFormChange} required />
//                 <Input name="seats" type="number" placeholder="Places" value={formData.seats} onChange={handleFormChange} required />
//                 <Input name="image" type="file" accept="image/*" onChange={handleFormChange} ref={fileInputRef} />
//               </div>
//               <div className="flex gap-2 pt-2">
//                 <Button type="submit">{editVehicleId ? 'Modifier' : t('addVehicle')}</Button>
//                 <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditVehicleId(null); setFormData({ brand: '', model: '', year: '', licensePlate: '', fuelType: '', dailyPrice: '', mileage: '', seats: '', image: null }); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
//                   Annuler
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}

//       {/* Filters */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder={t('search')}
//                   value={searchTerm}
//                   onChange={handleSearch}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               {['available', 'rented', 'maintenance', 'out_of_service'].map((status) => (
//                 <Button
//                   key={status}
//                   variant={statusFilter === status ? 'default' : 'outline'}
//                   size="sm"
//                   onClick={() => handleStatusFilter(status)}
//                 >
//                   {t(status)}
//                 </Button>
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Vehicles Grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {vehicles.map((vehicle) => (
//           <Card key={vehicle._id} className="hover:shadow-md transition-shadow">
//             {vehicle.image && (
//               <img
//                 src={`http://localhost:5001/${vehicle.image.replace(/\\/g, '/')}`}
//                 alt={`${vehicle.brand} ${vehicle.model}`}
//                 className="w-full h-40 object-cover rounded mb-2"
//               />
//             )}
//             <CardHeader className="pb-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Car className="h-5 w-5 text-muted-foreground" />
//                   <CardTitle className="text-lg">
//                     {vehicle.brand} {vehicle.model}
//                   </CardTitle>
//                 </div>
//                 <Badge className={statusColors[vehicle.status]}>
//                   {t(vehicle.status)}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <div>
//                   <span className="text-muted-foreground">Plaque:</span>
//                   <div className="font-medium">{vehicle.licensePlate}</div>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Année:</span>
//                   <div className="font-medium">{vehicle.year}</div>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Carburant:</span>
//                   <div className="font-medium">{vehicle.fuelType}</div>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Prix/jour:</span>
//                   <div className="font-medium">{vehicle.dailyPrice} DH</div>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Kilométrage:</span>
//                   <div className="font-medium">{vehicle.mileage.toLocaleString()} km</div>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Places:</span>
//                   <div className="font-medium">{vehicle.seats}</div>
//                 </div>
//               </div>

//               <div className="flex flex-col gap-2 pt-2">
//                 <div className="flex gap-2">
//                   <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditVehicle(vehicle)}>
//                     <Edit className="h-4 w-4 mr-1" />
//                     {t('edit')}
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="text-red-600 hover:text-red-700"
//                     onClick={() => handleDelete(vehicle._id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 {/* Changement de statut */}
//                 <div className="flex gap-2 items-center">
//                   <span className="text-xs text-muted-foreground">Statut :</span>
//                   <select
//                     value={vehicle.status}
//                     onChange={async (e) => {
//                       try {
//                         await vehiclesAPI.update(vehicle._id, { status: e.target.value });
//                         fetchVehicles();
//                       } catch (err) {
//                         alert('Erreur lors du changement de statut');
//                       }
//                     }}
//                     className="border rounded px-2 py-1 text-xs"
//                   >
//                     <option value="available">Disponible</option>
//                     <option value="rented">Loué</option>
//                     <option value="maintenance">En maintenance</option>
//                     <option value="out_of_service">Hors service</option>
//                   </select>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Pagination */}
//       {pagination.pages > 1 && (
//         <div className="flex justify-center gap-2">
//           <Button
//             variant="outline"
//             disabled={pagination.current === 1}
//             onClick={() => handlePageChange(pagination.current - 1)}
//           >
//             Précédent
//           </Button>
//           {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
//             <Button
//               key={page}
//               variant={pagination.current === page ? 'default' : 'outline'}
//               onClick={() => handlePageChange(page)}
//             >
//               {page}
//             </Button>
//           ))}
//           <Button
//             variant="outline"
//             disabled={pagination.current === pagination.pages}
//             onClick={() => handlePageChange(pagination.current + 1)}
//           >
//             Suivant
//           </Button>
//         </div>
//       )}

//       {vehicles.length === 0 && (
//         <Card>
//           <CardContent className="text-center py-8">
//             <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//             <h3 className="text-lg font-medium mb-2">Aucun véhicule trouvé</h3>
//             <p className="text-muted-foreground mb-4">
//               Commencez par ajouter votre premier véhicule à la flotte.
//             </p>
//             <Button>
//               <Plus className="h-4 w-4 mr-2" />
//               {t('addVehicle')}
//             </Button>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default VehicleManagement;
