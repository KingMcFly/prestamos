import React, { useState, useRef, useEffect } from 'react';
import type { Employee, Equipment, Loan, LoanItem } from '../../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SignatureCanvas, type SignatureCanvasRef } from '../ui/SignatureCanvas';
import { formatRut, generateUUID } from '../../utils/formatters';
import { Search, Plus, Trash2, Calendar, User, ShoppingCart, X, Eraser, PackageCheck, ScanBarcode } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface NewLoanProps {
  employees: Employee[];
  equipment: Equipment[];
  onSaveLoan: (loan: Loan) => void;
  onCancel: () => void;
}

export const NewLoan: React.FC<NewLoanProps> = ({ employees, equipment, onSaveLoan, onCancel }) => {
  // State
  const [rutSearch, setRutSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Equipment Search State
  const [serialSearch, setSerialSearch] = useState('');
  const [showEquipSuggestions, setShowEquipSuggestions] = useState(false);
  const [selectedEquipId, setSelectedEquipId] = useState('');

  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [cart, setCart] = useState<LoanItem[]>([]);
  const [observations, setObservations] = useState('');
  const [generatedBy, setGeneratedBy] = useState('');
  
  const sigCanvasRef = useRef<SignatureCanvasRef>(null);

  const availableEquipment = equipment.filter(e => e.status === 'disponible');

  // Filtrado de Empleados
  const filteredEmployees = employees.filter(emp => {
    if (!rutSearch) return false;
    const searchLower = rutSearch.toLowerCase();
    return emp.rut.toLowerCase().includes(searchLower) || emp.name.toLowerCase().includes(searchLower);
  });

  // Filtrado de Equipos por Serial
  const filteredEquipment = availableEquipment.filter(eq => {
    if (!serialSearch) return false;
    const searchLower = serialSearch.toLowerCase();
    return eq.serial.toLowerCase().includes(searchLower);
  });

  const resetForm = () => {
    setRutSearch('');
    setSelectedEmployee(null);
    setCart([]);
    setObservations('');
    setGeneratedBy('');
    setSerialSearch('');
    setSelectedEquipId('');
    setLoanDate(new Date().toISOString().split('T')[0]);
    sigCanvasRef.current?.clear();
    toast.info("Formulario limpiado");
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length < rutSearch.length) {
       setRutSearch(val);
    } else {
       setRutSearch(formatRut(val));
    }
    setShowSuggestions(true);
    if (selectedEmployee) setSelectedEmployee(null);
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setRutSearch(emp.rut);
    setShowSuggestions(false);
    toast.success(`Empleado seleccionado: ${emp.name}`);
  };

  // Manejo de Selección de Equipo
  const handleSelectEquipment = (equip: Equipment) => {
    setSelectedEquipId(equip.id);
    setSerialSearch(equip.serial);
    setShowEquipSuggestions(false);
  };

  const addToCart = () => {
    // Intentar buscar por ID seleccionado o coincidencia exacta de serial
    let equipToAdd = availableEquipment.find(e => e.id === selectedEquipId);

    // Si no hay ID seleccionado pero hay texto, buscar coincidencia exacta de serial (útil para escáner)
    if (!equipToAdd && serialSearch) {
      equipToAdd = availableEquipment.find(e => e.serial.toLowerCase() === serialSearch.trim().toLowerCase());
    }

    if (!equipToAdd) {
      toast.error("Equipo no encontrado o no disponible");
      return;
    }

    if (cart.some(item => item.equipmentId === equipToAdd!.id)) {
      toast.warning('Este equipo ya está en la lista');
      setSerialSearch('');
      setSelectedEquipId('');
      return;
    }

    const newItem: LoanItem = {
      equipmentId: equipToAdd.id,
      quantity: 1,
      equipmentSnapshot: equipToAdd
    };

    setCart([...cart, newItem]);
    
    // Resetear campos de búsqueda de equipo
    setSelectedEquipId('');
    setSerialSearch('');
    toast.success("Equipo agregado");
  };

  // Manejador para teclas (Enter para agregar rápido con escáner)
  const handleEquipKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addToCart();
      setShowEquipSuggestions(false);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.equipmentId !== id));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.equipmentSnapshot.value, 0);

  const handleSubmit = () => {
    if (!selectedEmployee) {
      toast.error('Debe seleccionar un empleado válido');
      return;
    }
    if (cart.length === 0) {
      toast.error('Debe agregar al menos un equipo');
      return;
    }
    if (!generatedBy) {
      toast.error('Debe ingresar quién genera la entrega');
      return;
    }

    const signature = sigCanvasRef.current?.isEmpty() ? undefined : sigCanvasRef.current?.getDataURL();

    const newLoan: Loan = {
      id: generateUUID(),
      date: loanDate,
      employeeId: selectedEmployee.id,
      employeeSnapshot: selectedEmployee,
      items: cart,
      observations,
      totalValue: calculateTotal(),
      status: 'activo',
      generatedBy,
      signature
    };

    onSaveLoan(newLoan);
    resetForm();
    sigCanvasRef.current?.clear();
  };

  useEffect(() => {
    const handleClick = () => {
      setShowSuggestions(false);
      setShowEquipSuggestions(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24" onClick={(e) => e.stopPropagation()}>
      
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl shadow-soft border border-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="bg-tuniche-100 p-2 rounded-lg text-tuniche-600">
              <PackageCheck className="w-6 h-6" />
            </div>
            Nuevo Prestamo
          </h2>
          <p className="text-slate-500 text-sm md:ml-14 mt-1 md:mt-0">Complete el formulario para registrar un préstamo.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetForm} className="text-slate-400 hover:text-red-500 w-full sm:w-auto justify-center">
          <Eraser className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      </motion.div>

      {/* Grid: 1 columna (mobile/tablet-v), 12 columnas (desktop/tablet-h) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Left Column: Info & Equipment */}
        <motion.div 
          className="lg:col-span-8 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Employee & Date Section */}
          <div className="bg-white p-5 md:p-8 rounded-2xl shadow-soft border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <User className="w-4 h-4" /> Datos del Receptor
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-1.5 relative z-30">
                <label className="text-sm font-medium text-slate-700 ml-1">Buscar Empleado</label>
                <div className="relative">
                  <Input 
                    placeholder="RUT o Nombre..." 
                    value={rutSearch}
                    onChange={handleRutChange}
                    onFocus={() => setShowSuggestions(true)}
                    maxLength={12}
                    autoComplete="off"
                    className="pl-11"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />

                  <AnimatePresence>
                    {showSuggestions && rutSearch.length > 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute w-full bg-white mt-2 border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 overflow-hidden"
                      >
                        {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                          <div 
                            key={emp.id}
                            className="px-4 py-3.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                            onClick={() => handleSelectEmployee(emp)}
                          >
                            <div className="font-semibold text-slate-800 text-base">{emp.name}</div>
                            <div className="text-sm text-slate-500 flex justify-between mt-1">
                              <span>{emp.rut}</span>
                              <span className="text-tuniche-600 font-medium bg-tuniche-50 px-2 py-0.5 rounded-full text-xs">{emp.area}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="p-4 text-center text-sm text-slate-400">No encontrado</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Entrega</label>
                <div className="relative">
                  <input 
                    type="date"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base pl-11 focus:ring-2 focus:ring-tuniche-500 focus:border-transparent outline-none transition-shadow shadow-sm"
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                  />
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedEmployee && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-tuniche-50 to-white p-5 rounded-xl border border-tuniche-100 flex justify-between items-start relative group">
                    <div>
                      <div className="text-xs text-tuniche-600 font-bold uppercase mb-1">Empleado Seleccionado</div>
                      <div className="font-bold text-slate-900 text-xl">{selectedEmployee.name}</div>
                      <div className="text-sm text-slate-600 mt-2 flex flex-col sm:flex-row gap-1 sm:gap-3">
                        <span>{selectedEmployee.rut}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{selectedEmployee.area}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Turno {selectedEmployee.shift}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedEmployee(null); setRutSearch(''); }}
                      className="text-slate-300 hover:text-red-500 transition-colors p-2 bg-white rounded-full shadow-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Equipment Section */}
          <div className="bg-white p-5 md:p-8 rounded-2xl shadow-soft border border-slate-100 relative z-20">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Equipos a Prestar
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-stretch sm:items-center">
              <div className="flex-1 relative">
                <Input 
                  placeholder="Escanear o ingresar N° Serie..." 
                  value={serialSearch}
                  onChange={(e) => {
                    setSerialSearch(e.target.value);
                    setShowEquipSuggestions(true);
                    if (!e.target.value) setSelectedEquipId('');
                  }}
                  onFocus={() => setShowEquipSuggestions(true)}
                  onKeyDown={handleEquipKeyDown}
                  className="pl-11 font-mono"
                  autoComplete="off"
                />
                <ScanBarcode className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                
                {/* Sugerencias de Equipos */}
                <AnimatePresence>
                  {showEquipSuggestions && serialSearch.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute w-full bg-white mt-2 border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 overflow-hidden"
                    >
                      {filteredEquipment.length > 0 ? filteredEquipment.map(eq => (
                        <div 
                          key={eq.id}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex justify-between items-center"
                          onClick={() => handleSelectEquipment(eq)}
                        >
                          <div>
                            <div className="font-bold text-slate-800 font-mono text-sm">{eq.serial}</div>
                            <div className="text-xs text-slate-500">{eq.type} - {eq.brand} {eq.model}</div>
                          </div>
                          <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Disponible
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-sm text-slate-400">
                          No se encontró serial disponible
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button onClick={addToCart} className="h-12 w-full sm:w-auto px-6">
                <Plus className="w-5 h-5 mr-2" /> Agregar
              </Button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div 
                    key={item.equipmentId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <PackageCheck className="w-5 h-5 text-tuniche-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">
                          {item.equipmentSnapshot.type} {item.equipmentSnapshot.brand}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5 bg-slate-200/50 inline-block px-1.5 py-0.5 rounded">
                          SN: {item.equipmentSnapshot.serial}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-5 pl-14 sm:pl-0">
                      <span className="text-sm font-semibold text-slate-600">
                        ${item.equipmentSnapshot.value.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.equipmentId)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <ShoppingCart className="w-8 h-8 mb-2 opacity-50" />
                  <p>No hay equipos seleccionados</p>
                </div>
              )}

              {cart.length > 0 && (
                <div className="flex justify-between items-center pt-5 border-t border-slate-100 mt-6">
                  <span className="text-sm font-medium text-slate-500">Valor Total Estimado</span>
                  <span className="text-xl font-bold text-tuniche-600">${calculateTotal().toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Signature & Actions */}
        <motion.div 
          className="lg:col-span-4 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Eliminado h-full y flex-1 para que el contenedor tenga altura natural y no estire el espacio blanco */}
          <div className="bg-white p-5 md:p-8 rounded-2xl shadow-soft border border-slate-100 flex flex-col sticky top-24">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-tuniche-500"></span>
               Confirmación
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block ml-1">Observaciones</label>
                <textarea 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm h-32 resize-none focus:ring-2 focus:ring-tuniche-500 outline-none transition-shadow shadow-sm"
                  placeholder="Estado, accesorios, comentarios..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                ></textarea>
              </div>

              <div>
                <Input 
                  label="Generado Por" 
                  placeholder="Tu nombre completo" 
                  value={generatedBy}
                  onChange={(e) => setGeneratedBy(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Firma Receptor</label>
                  <button onClick={() => sigCanvasRef.current?.clear()} className="text-xs text-tuniche-600 hover:text-tuniche-800 font-medium">
                    Limpiar
                  </button>
                </div>
                {/* Altura explícita para el contenedor de la firma */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 hover:bg-slate-50/80 transition-colors h-48">
                  <SignatureCanvas ref={sigCanvasRef} />
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">Firmar dentro del recuadro</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
              <Button onClick={handleSubmit} size="lg" className="w-full shadow-lg shadow-tuniche-500/30 py-4 text-base">
                Confirmar Entrega
              </Button>
              <Button variant="ghost" onClick={onCancel} className="w-full py-3">
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};