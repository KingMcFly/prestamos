import React, { useState } from 'react';
import type { Employee } from '../../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DataTable } from '../ui/DataTable';
import { formatRut, generateUUID } from '../../utils/formatters';
import { Edit2, Trash2, UserPlus, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../App';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, setEmployees }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (emp: Employee) => {
    setCurrentEmployee(emp);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este empleado?')) {
      try {
        const res = await fetch(`${API_URL}/employees.php?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setEmployees(prev => prev.filter(e => e.id !== id));
          toast.success('Empleado eliminado');
        } else {
          throw new Error('Error al eliminar');
        }
      } catch (e) {
        toast.error('Error de conexión con el servidor');
      }
    }
  };

  const handleSave = async () => {
    if (!currentEmployee.name || !currentEmployee.rut) {
      toast.error('Nombre y RUT son obligatorios');
      return;
    }

    setIsSaving(true);
    const empToSave = {
        ...currentEmployee,
        id: currentEmployee.id || generateUUID()
    } as Employee;

    try {
        const res = await fetch(`${API_URL}/employees.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(empToSave)
        });

        if (res.ok) {
            if (currentEmployee.id) {
                setEmployees(prev => prev.map(e => e.id === empToSave.id ? empToSave : e));
                toast.success('Empleado actualizado');
            } else {
                setEmployees(prev => [...prev, empToSave]);
                toast.success('Empleado creado');
            }
            setIsEditing(false);
            setCurrentEmployee({});
        } else {
            throw new Error();
        }
    } catch (e) {
        toast.error('Error al guardar en el servidor');
    } finally {
        setIsSaving(false);
    }
  };

  const columns = [
    { header: "Nombre", accessor: "name", sortable: true, className: "font-medium text-slate-700 min-w-[150px]" },
    { header: "RUT", accessor: "rut", sortable: true, className: "whitespace-nowrap" },
    { header: "Área", accessor: "area", sortable: true },
    { 
      header: "Turno", 
      accessor: (row: Employee) => (
        <span className="px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          {row.shift}
        </span>
      ),
      sortable: true
    },
    {
      header: "Acciones",
      accessor: (row: Employee) => (
        <div className="flex justify-end gap-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(row)} className="p-2 text-slate-400 hover:text-tuniche-600 bg-transparent hover:bg-tuniche-50 rounded-lg transition-colors">
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
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Empleados</h2>
          <p className="text-slate-500 text-sm">Administre el personal autorizado para préstamos.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
            <UserPlus className="w-4 h-4 mr-2" /> Nuevo Empleado
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
                {currentEmployee.id ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
                <Input 
                  label="Nombre Completo" 
                  value={currentEmployee.name || ''} 
                  onChange={e => setCurrentEmployee({...currentEmployee, name: e.target.value})}
                />
                <Input 
                  label="RUT" 
                  placeholder="12.345.678-9"
                  value={currentEmployee.rut || ''} 
                  onChange={e => setCurrentEmployee({...currentEmployee, rut: formatRut(e.target.value)})}
                  maxLength={12}
                />
                <Input 
                  label="Área / Departamento" 
                  value={currentEmployee.area || ''} 
                  onChange={e => setCurrentEmployee({...currentEmployee, area: e.target.value})}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Turno</label>
                  <select 
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-tuniche-500/20 focus:border-tuniche-500 bg-white transition-all shadow-sm"
                    value={currentEmployee.shift || 'A'}
                    onChange={e => setCurrentEmployee({...currentEmployee, shift: e.target.value as any})}
                  >
                    <option value="A">Turno A</option>
                    <option value="B">Turno B</option>
                    <option value="C">Turno C</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-50">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> Guardar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/60 overflow-hidden">
        <DataTable 
          data={employees} 
          columns={columns as any} 
          searchPlaceholder="Buscar por nombre o RUT..." 
        />
      </div>
    </div>
  );
};