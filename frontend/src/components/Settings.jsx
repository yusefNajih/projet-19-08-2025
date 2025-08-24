import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Eye, EyeOff, Edit, Save, X } from "lucide-react";
import { authAPI } from "../services/api";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour l'édition
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    currentPassword: ""
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Récupération des données utilisateur...");
        const response = await authAPI.getMe();
        console.log("Réponse API:", response);
        
        // Vérifier la structure de la réponse
        const userData = response.data?.user || response.data || response;
        console.log("Données utilisateur:", userData);
        
        setUser(userData);
        setEditData({
          username: userData.username || "",
          email: userData.email || "",
          currentPassword: ""
        });
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        console.error("Détails de l'erreur:", err.response?.data || err.message);
        setError(`Erreur: ${err.response?.data?.message || err.message || "Erreur inconnue"}`);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fonction pour commencer l'édition
  const startEditProfile = () => {
    setIsEditingProfile(true);
    setEditData({
      username: user.username || "",
      email: user.email || "",
      currentPassword: ""
    });
    setUpdateSuccess("");
    setError(null);
  };

  // Fonction pour annuler l'édition
  const cancelEdit = () => {
    setIsEditingProfile(false);
    setEditData({
      username: user.username || "",
      email: user.email || "",
      currentPassword: ""
    });
    setError(null);
    setShowPassword(false);
  };

  // Fonction pour gérer les changements dans les inputs
  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour sauvegarder les modifications
  const saveChanges = async () => {
    setUpdateLoading(true);
    setError(null);
    setUpdateSuccess("");

    try {
      // Validations
      if (!editData.username.trim()) {
        setError("Le nom d'utilisateur ne peut pas être vide");
        setUpdateLoading(false);
        return;
      }

      if (!editData.email.trim()) {
        setError("L'email ne peut pas être vide");
        setUpdateLoading(false);
        return;
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        setError("Veuillez saisir un email valide");
        setUpdateLoading(false);
        return;
      }

      // Vérifier si quelque chose a changé
      const hasChanges = editData.username !== user.username || editData.email !== user.email;
      
      if (hasChanges && !editData.currentPassword) {
        setError("Veuillez saisir votre mot de passe actuel pour confirmer les modifications");
        setUpdateLoading(false);
        return;
      }

      if (!hasChanges) {
        setError("Aucune modification détectée");
        setUpdateLoading(false);
        return;
      }

      // Préparer les données à envoyer
      const updateData = {
        username: editData.username.trim(),
        email: editData.email.trim(),
        currentPassword: editData.currentPassword
      };

      // Appel API pour mettre à jour
      const response = await authAPI.updateProfile(updateData);
      
      // Mettre à jour l'état local
      const updatedUser = response.data?.user || response.data;
      setUser(updatedUser);
      
      // Réinitialiser les états d'édition
      setIsEditingProfile(false);
      setEditData({
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        currentPassword: ""
      });
      setShowPassword(false);
      setUpdateSuccess("Profil mis à jour avec succès !");
      
      // Effacer le message de succès après 5 secondes
      setTimeout(() => setUpdateSuccess(""), 5000);

    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Debug: afficher l'état actuel
  console.log("État actuel - Loading:", loading, "Error:", error, "User:", user);

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      {/* Section Informations du profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Informations du profil
            {!isEditingProfile && user && (
              <Button
                onClick={startEditProfile}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {updateSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {updateSuccess}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span>Chargement...</span>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Mode Édition */}
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold text-sm">Nom d'utilisateur *</Label>
                      <Input
                        type="text"
                        value={editData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        className="mt-1"
                        placeholder="Nom d'utilisateur"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-sm">Email *</Label>
                      <Input
                        type="email"
                        value={editData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="mt-1"
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="font-semibold text-sm">Mot de passe actuel *</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={editData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        className="pr-10"
                        placeholder="Saisissez votre mot de passe actuel pour confirmer"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Requis pour confirmer les modifications de sécurité
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={saveChanges}
                      disabled={updateLoading}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>{updateLoading ? "Sauvegarde..." : "Sauvegarder"}</span>
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      disabled={updateLoading}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Annuler</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Mode Affichage */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="font-semibold text-sm text-gray-600">Prénom</Label>
                    <p className="mt-1 text-gray-900">{user.firstName || "Non défini"}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm text-gray-600">Nom</Label>
                    <p className="mt-1 text-gray-900">{user.lastName || "Non défini"}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm text-gray-600">Nom d'utilisateur</Label>
                    <p className="mt-1 text-gray-900">{user.username || "Non défini"}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm text-gray-600">Email</Label>
                    <p className="mt-1 text-gray-900">{user.email || "Non défini"}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm text-gray-600">Rôle</Label>
                    <Badge className="mt-1">{user.role || "Non défini"}</Badge>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm text-gray-600">Dernière connexion</Label>
                    <p className="mt-1 text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : "Non définie"}
                    </p>
                  </div>
                  {user.preferences && (
                    <>
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">Langue</Label>
                        <p className="mt-1 text-gray-900">{user.preferences.language || "Non définie"}</p>
                      </div>
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">Thème</Label>
                        <p className="mt-1 text-gray-900">{user.preferences.theme || "Non défini"}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Aucune donnée utilisateur trouvée</div>
          )}
        </CardContent>
      </Card>

      {/* Section Sécurité */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-semibold">Mot de passe</Label>
                <p className="text-sm text-gray-600">Dernière modification: Non disponible</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-mono text-gray-400">••••••••</span>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-semibold">Authentification à deux facteurs</Label>
                <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
              </div>
              <Button variant="outline" size="sm">
                Configurer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default Settings;