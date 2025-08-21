import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '../services/api';

const DocumentUploader = ({ clientId, type, label }) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const fetchDoc = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clients/${clientId}`);
      setDoc(res.data.documents && res.data.documents[type] ? res.data.documents[type] : null);
    } catch {
      setDoc(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
    // eslint-disable-next-line
  }, [clientId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    setLoading(true);
    try {
      await api.post(`/clients/${clientId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchDoc();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      alert('Erreur lors de l\'upload du document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce document ?')) return;
    setLoading(true);
    try {
      await api.delete(`/clients/${clientId}/documents/${type}`);
      setDoc(null);
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border p-2 rounded bg-gray-50">
      <div className="font-medium text-sm mb-1">{label}</div>
      {doc ? (
        <div className="flex items-center gap-3">
          <a href={`/api/clients/${clientId}/documents/${type}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Voir / Télécharger</a>
          <span className="text-xs text-gray-500">{doc.originalName}</span>
          <Button size="sm" variant="outline" onClick={handleDelete} disabled={loading}>Supprimer</Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input type="file" accept="image/*,application/pdf" onChange={handleUpload} ref={fileInputRef} disabled={loading} />
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
