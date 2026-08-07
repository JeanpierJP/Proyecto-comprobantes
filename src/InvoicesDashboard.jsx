import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'sonner';
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import api, { syncEmail } from './api';
import './InvoicesDashboard.css';

function InvoicesDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/invoices');
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading(`Procesando ${files.length} archivo(s)...`);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success('¡Procesamiento masivo completado!', { id: toastId });
      fetchInvoices();
    } catch (error) {
      toast.error('Hubo un error en la carga', { id: toastId });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSyncEmail = async () => {
    setSyncing(true);
    const toastId = toast.loading('Sincronizando correos... esto puede tardar unos segundos');
    try {
      await syncEmail();
      toast.success('¡Sincronización completada!', { id: toastId });
      fetchInvoices();
    } catch (error) {
      console.error(error);
      toast.error('Error al sincronizar el correo. Verifica tu conexión.', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r =>
      (r.nombre_razon_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.ruc || '').includes(searchTerm) ||
      (r.operacion || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  const stats = useMemo(() => {
    const total = records.reduce((acc, r) => acc + (parseFloat(r.importe) || 0), 0);
    const tax = records.reduce((acc, r) => acc + (parseFloat(r.monto_impuesto) || 0), 0);
    return { total, tax, count: records.length };
  }, [records]);

  const startEdit = (invoice) => {
    setEditingId(invoice.id);
    setEditForm({ ...invoice });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    try {
      await api.put(`/invoices/${editingId}`, editForm);
      toast.success('Cambios guardados');
      setEditingId(null);
      fetchInvoices();
    } catch (error) {
      toast.error('No se pudo actualizar');
    }
  };

  const exportExcel = () => {
    const data = filteredRecords.map(r => ({
      'Empresa': r.nombre_razon_social,
      'RUC': r.ruc,
      'Factura': r.operacion,
      'Fecha': r.fecha,
      'Periodo': r.periodo,
      'Impuesto (IGV)': r.monto_impuesto,
      'Importe Total': r.importe,
      'Enlace': r.file_url
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
    XLSX.writeFile(wb, 'Reporte_Facturas_IA.xlsx');
  };

  const clearAllRecords = async () => {
    if (!window.confirm('¿Estás seguro de que deseas vaciar todos los registros? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await api.delete('/invoices');
      toast.success('Todos los registros han sido eliminados');
      fetchInvoices();
    } catch (error) {
      toast.error('Error al vaciar los registros', {
        description: error.response?.data?.detail || 'No se pudo completar la operación.',
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" richColors />

      {/* Header & Actions */}
      <div className="upload-section">
        <div>
          <h1 className="text-3xl font-black tracking-tight">ComprobantePro <span className="text-emerald-500">AI</span></h1>
          <p className="text-slate-400 text-sm mt-1">Gestión inteligente de comprobantes fiscales</p>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchInvoices} className="btn-primary" style={{ background: '#1e293b' }}>
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <label className="btn-primary cursor-pointer">
            <CloudArrowUpIcon className="h-5 w-5" />
            {uploading ? 'Procesando...' : 'Subir Comprobantes'}
            <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>

          <button 
            onClick={handleSyncEmail} 
            className="btn-primary" 
            style={{ background: '#8b5cf6' }} 
            disabled={syncing}
          >
            <EnvelopeIcon className={`h-5 w-5 ${syncing ? 'animate-pulse' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Email'}
          </button>

          <button onClick={exportExcel} className="btn-primary" style={{ background: '#3b82f6' }}>
            <ArrowDownTrayIcon className="h-5 w-5" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <span className="text-muted text-xs uppercase font-bold">Importe Total</span>
          <span className="stat-value">S/ {stats.total.toLocaleString()}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="text-muted text-xs uppercase font-bold">Monto Impuesto Acumulado</span>
          <span className="stat-value" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text' }}>
            S/ {stats.tax.toLocaleString()}
          </span>
        </div>
        <div className="glass-card stat-card">
          <span className="text-muted text-xs uppercase font-bold">Cant. Comprobantes</span>
          <span className="stat-value">{stats.count}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="search-container">
              <MagnifyingGlassIcon className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por Empresa, RUC o Factura..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={clearAllRecords} 
              className="btn-primary text-sm" 
              style={{ background: 'linear-gradient(90deg, #dc2626, #9f1239)', padding: '0.45rem 1rem', minWidth: 'auto', height: '100%' }}
            >
              <TrashIcon className="h-4 w-4" />
              Vaciar Registros
            </button>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <FunnelIcon className="h-4 w-4" />
            <span>Filtrando {filteredRecords.length} de {records.length}</span>
          </div>
        </div>

        <div className="main-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Emisor / Razón Social</th>
                <th>RUC</th>
                <th>Operación</th>
                <th>Fecha</th>
                <th>Importe</th>
                <th>Monto Impuesto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-bold text-emerald-400">
                    {editingId === invoice.id ? (
                      <input className="edit-input-mini" value={editForm.nombre_razon_social || ''} onChange={(e) => handleEditChange('nombre_razon_social', e.target.value)} />
                    ) : (invoice.nombre_razon_social || '---')}
                  </td>
                  <td className="text-slate-300">
                    {editingId === invoice.id ? (
                      <input className="edit-input-mini" value={editForm.ruc || ''} onChange={(e) => handleEditChange('ruc', e.target.value)} />
                    ) : (invoice.ruc || '---')}
                  </td>
                  <td>
                    {editingId === invoice.id ? (
                      <input className="edit-input-mini" value={editForm.operacion || ''} onChange={(e) => handleEditChange('operacion', e.target.value)} />
                    ) : (<span className="badge badge-info">{invoice.operacion || 'S/N'}</span>)}
                  </td>
                  <td className="text-slate-400">
                    {editingId === invoice.id ? (
                      <input type="date" className="edit-input-mini" value={editForm.fecha || ''} onChange={(e) => handleEditChange('fecha', e.target.value)} />
                    ) : (invoice.fecha || '---')}
                  </td>
                  <td className="font-black">
                    {editingId === invoice.id ? (
                      <input type="number" className="edit-input-mini" value={editForm.importe || 0} onChange={(e) => handleEditChange('importe', e.target.value)} />
                    ) : `S/ ${parseFloat(invoice.importe || 0).toFixed(2)}`}
                  </td>
                  <td className="text-slate-400">
                    {editingId === invoice.id ? (
                      <input type="number" className="edit-input-mini" value={editForm.monto_impuesto || 0} onChange={(e) => handleEditChange('monto_impuesto', e.target.value)} />
                    ) : `S/ ${parseFloat(invoice.monto_impuesto || 0).toFixed(2)}`}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {editingId === invoice.id ? (
                        <>
                          <button onClick={saveEdit} className="text-emerald-500 hover:scale-110 transition-transform"><CheckIcon className="h-5 w-5" /></button>
                          <button onClick={cancelEdit} className="text-rose-500 hover:scale-110 transition-transform"><XMarkIcon className="h-5 w-5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(invoice)} className="text-slate-400 hover:text-white"><PencilSquareIcon className="h-5 w-5" /></button>
                          {invoice.file_url && (
                            <a href={invoice.file_url} target="_blank" rel="noreferrer" className="text-emerald-500 hover:scale-110 transition-transform"><DocumentTextIcon className="h-5 w-5" /></a>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-slate-500">
                    No se encontraron facturas. Comienza subiendo archivos o sincronizando tu correo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InvoicesDashboard;
