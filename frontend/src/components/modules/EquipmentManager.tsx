import React, { useState } from 'react';
import type { Equipment } from '../../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DataTable } from '../ui/DataTable';
import { generateUUID } from '../../utils/formatters';
import { Edit2, Trash2, Monitor, Save, X, Boxes } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../App';

interface EquipmentManagerProps {
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
}

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({ equipment, setEquipment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentEquip, setCurrentEquip] = useState<Partial<Equipment>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentEquip.serial || !currentEquip.type) {
      toast.error('Serie y Tipo son obligatorios');
      return;
    }

    setIsSaving(true);
    const equipToSave = {
        ...currentEquip,
        id: currentEquip.id || generateUUID(),
        status: currentEquip.status || 'disponible'
    } as Equipment;

    try {
        const res = await fetch(`${API_URL}/equipment.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipToSave)
        });

        if (res.ok) {
            if (currentEquip.id) {
                setEquipment(prev => prev.map(e => e.id === equipToSave.id ? equipToSave : e));
                toast.success('Equipo actualizado');
            } else {
                setEquipment(prev => [...prev, equipToSave]);
                toast.success('Equipo registrado');
            }
            setIsEditing(false);
            setCurrentEquip({});
        } else {
            throw new Error();
        }
    } catch (e) {
        toast.error('Error al guardar en el servidor');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('¿Eliminar equipo del inventario?')) {
      try {
          const res = await fetch(`${API_URL}/equipment.php?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            setEquipment(prev => prev.filter(e => e.id !== id));
            toast.success('Equipo eliminado');
          } else {
            throw new Error('Error al eliminar');
          }
      } catch (e) {
          toast.error('Error de conexión con el servidor');
      }
    }
  };

  const columns = [
    { header: "Serie", accessor: "serial", sortable: true, className: "font-mono text-slate-600 text-xs whitespace-nowrap" },
    { header: "Tipo", accessor: "type", sortable: true, className: "font-medium" },
    { 
      header: "Marca / Modelo", 
      accessor: (row: Equipment) => `${row.brand} ${row.model}`,
      sortable: true
    },
    { 
      header: "Valor", 
      accessor: (row: Equipment) => `$${row.value.toLocaleString()}`,
      sortable: true
    },
    { 
      header: "Estado", 
      accessor: (row: Equipment) => {
        const styles = {
          disponible: "bg-emerald-100 text-emerald-700 border-emerald-200",
          prestado: "bg-amber-100 text-amber-700 border-amber-200",
          mantenimiento: "bg-slate-100 text-slate-700 border-slate-200",
          baja: "bg-red-100 text-red-700 border-red-200"
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[row.status]}`}>
            {row.status.toUpperCase()}
          </span>
        );
      },
      sortable: true 
    },
    {
      header: "Acciones",
      accessor: (row: Equipment) => (
        <div className="flex justify-end gap-2">
           <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setCurrentEquip(row); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-tuniche-600 bg-transparent hover:bg-tuniche-50 rounded-lg transition-colors">
             <Edit2 className="w-4 h-4" />
           </motion.button>
           <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(row.id)} className="p-2 text-slate-400 hover:text-red-600 bg-transparent hover:bg-red-50 rounded-lg transition-colors">
             <Trash2 className="w-4 h-4" />
           </motion.button>
        </div>
      ),
      className: "text-right" 
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario de Equipos</h2>
          <p className="text-slate-500 text-sm">Controle el stock y estado de los activos tecnológicos.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
            <Boxes className="w-4 h-4 mr-2" /> Nuevo Equipo
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 mb-6 relative">
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 p-2"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-tuniche-500 rounded-full"></div>
                Detalles del Equipo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                <Input 
                  label="Número de Serie" 
                  placeholder="SN-XXXX"
                  value={currentEquip.serial || ''}
                  onChange={e => setCurrentEquip({...currentEquip, serial: e.target.value})}
                  className="font-mono"
                />
                <Input 
                  label="Tipo de Equipo" 
                  placeholder="Ej: Mouse, Monitor"
                  value={currentEquip.type || ''}
                  onChange={e => setCurrentEquip({...currentEquip, type: e.target.value})}
                />
                <Input 
                  label="Marca" 
                  placeholder="Logitech, Dell..."
                  value={currentEquip.brand || ''}
                  onChange={e => setCurrentEquip({...currentEquip, brand: e.target.value})}
                />
                <Input 
                  label="Modelo" 
                  value={currentEquip.model || ''}
                  onChange={e => setCurrentEquip({...currentEquip, model: e.target.value})}
                />
                <Input 
                  label="Valor (CLP)" 
                  type="number"
                  value={currentEquip.value || ''}
                  onChange={e => setCurrentEquip({...currentEquip, value: Number(e.target.value)})}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Estado</label>
                  <select 
                     className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-tuniche-500/20 focus:border-tuniche-500 bg-white shadow-sm transition-all"
                     value={currentEquip.status || 'disponible'}
                     onChange={e => setCurrentEquip({...currentEquip, status: e.target.value as any})}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="prestado">Prestado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="baja">De Baja</option>
                  </select>
                </div>
                <div className="md:col-span-2 xl:col-span-3">
                  <Input 
                    label="Descripción" 
                    placeholder="Detalles adicionales..."
                    value={currentEquip.description || ''}
                    onChange={e => setCurrentEquip({...currentEquip, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-50">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> Guardar Equipo
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/60 overflow-hidden">
        <DataTable 
          data={equipment} 
          columns={columns as any}
          searchPlaceholder="Buscar equipo..."
        />
      </div>
    </div>
  );
};