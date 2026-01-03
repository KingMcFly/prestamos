import React, { useState, useEffect } from 'react';
import type { TabView, Employee, Equipment, Loan } from '../types';
import { NewLoan } from './components/modules/NewLoan';
import { EmployeeManager } from './components/modules/EmployeeManager';
import { EquipmentManager } from './components/modules/EquipmentManager';
import { History } from './components/modules/History';
import { Login } from './components/modules/Login';
import { Users, Monitor, History as HistoryIcon, PlusCircle, LayoutGrid, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// CONFIGURACIÓN DE LA API
// Usa la variable de entorno. Si no existe, usa localhost por defecto
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8012/tuniche_api';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>('new-loan');
  
  // Estado de carga para feedback visual
  const [loadingData, setLoadingData] = useState(false);

  // Estados de datos (inician vacíos, se llenan desde MySQL)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  // Función para recargar todos los datos desde el servidor
  const refreshData = async () => {
    setLoadingData(true);
    try {
      const [empRes, eqRes, loanRes] = await Promise.all([
        fetch(`${API_URL}/employees.php`),
        fetch(`${API_URL}/equipment.php`),
        fetch(`${API_URL}/loans.php`)
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(Array.isArray(empData) ? empData : []);
      }
      
      if (eqRes.ok) {
        const eqData = await eqRes.json();
        setEquipment(Array.isArray(eqData) ? eqData : []);
      }

      if (loanRes.ok) {
        const loanData = await loanRes.json();
        setLoans(Array.isArray(loanData) ? loanData : []);
      }
      
    } catch (error) {
      console.error("Error conectando a la API", error);
      toast.error("Error de conexión. Asegúrate que XAMPP (Apache/MySQL) esté corriendo.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem('isLoggedIn');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      refreshData(); // Cargar datos al iniciar si está logueado
    }
    setIsAuthChecking(false);
  }, []);

  // Efecto para recargar datos cuando se autentica
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
    toast.info('Sesión cerrada');
  };

  // Guardar Nuevo Préstamo en BD
  const handleSaveLoan = async (newLoan: Loan) => {
    try {
      const res = await fetch(`${API_URL}/loans.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoan)
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      
      await refreshData(); // Recargar todo para actualizar stocks y lista
      toast.success('Entrega registrada y guardada en base de datos');
      setActiveTab('history');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar en el servidor');
    }
  };

  // Registrar Devolución en BD
  const handleReturnLoan = async (loanId: string, returnData: { receivedBy: string; observations: string; signature?: string }) => {
    try {
      const payload = {
        id: loanId,
        returnDate: new Date().toISOString().split('T')[0],
        receivedBy: returnData.receivedBy,
        returnObservations: returnData.observations,
        returnSignature: returnData.signature
      };

      const res = await fetch(`${API_URL}/loans.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error al actualizar');

      await refreshData();
      toast.success('Devolución registrada correctamente');
    } catch (error) {
      toast.error('Error al registrar devolución en el servidor');
    }
  };

  const tabs = [
    { id: 'new-loan', label: 'Nueva Entrega', icon: PlusCircle },
    { id: 'employees', label: 'Empleados', icon: Users },
    { id: 'equipment', label: 'Inventario', icon: Monitor },
    { id: 'history', label: 'Historial', icon: HistoryIcon },
  ];

  if (isAuthChecking) return null;

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" richColors theme="light" closeButton />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-green-100">
      <Toaster position="top-center" richColors theme="light" closeButton />
      
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#dcfce7,transparent)]"></div>
      </div>

      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="bg-gradient-to-tr from-tuniche-600 to-emerald-500 p-2 rounded-xl shadow-lg shadow-tuniche-600/20">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Sistema de Préstamo</h1>
                <p className="text-slate-500 text-xs font-medium">Tuniche Fruits · Tecnología</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-3">
              {loadingData && (
                <span className="flex items-center gap-2 text-xs text-tuniche-600 font-medium bg-tuniche-50 px-2 py-1 rounded-full animate-pulse border border-tuniche-100">
                  <div className="w-2 h-2 bg-tuniche-500 rounded-full"></div>
                  Sincronizando...
                </span>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-soft border border-slate-200/60 overflow-x-auto max-w-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabView)}
                  className={`relative flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors z-10 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-tuniche-600 rounded-xl shadow-md shadow-tuniche-600/25 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : ''}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[600px] relative">
          <AnimatePresence mode="wait">
             <motion.div
               key="new-loan-wrapper"
               initial={false}
               animate={{ 
                 display: activeTab === 'new-loan' ? 'block' : 'none',
                 opacity: activeTab === 'new-loan' ? 1 : 0,
                 y: activeTab === 'new-loan' ? 0 : 20
               }}
               transition={{ duration: 0.3 }}
             >
                <NewLoan 
                  employees={employees} 
                  equipment={equipment} 
                  onSaveLoan={handleSaveLoan}
                  onCancel={() => setActiveTab('history')}
                />
             </motion.div>

            {activeTab === 'employees' && (
              <motion.div key="employees" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <EmployeeManager employees={employees} setEmployees={setEmployees} />
              </motion.div>
            )}

            {activeTab === 'equipment' && (
              <motion.div key="equipment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <EquipmentManager equipment={equipment} setEquipment={setEquipment} />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <History loans={loans} onReturn={handleReturnLoan} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-12 py-8 text-center text-slate-400 text-sm border-t border-slate-200/50">
        <p>&copy; {new Date().getFullYear()} Tuniche Fruits.</p>
        <p className="text-xs mt-1 opacity-70">Sistema de Gestión Interna</p>
      </footer>
    </div>
  );
};

export default App;