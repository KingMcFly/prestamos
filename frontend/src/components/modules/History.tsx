import React, { useState, useRef, useEffect } from 'react';
import type { Loan } from '../../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DataTable } from '../ui/DataTable';
import { SignatureCanvas, type SignatureCanvasRef } from '../ui/SignatureCanvas';
import { generateLoanPDF } from '../../utils/pdfGenerator';
import { RotateCcw, CheckCircle, FileText, X, UserCheck, MessageSquare, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryProps {
  loans: Loan[];
  onReturn: (loanId: string, data: { receivedBy: string; observations: string; signature?: string }) => void;
}

export const History: React.FC<HistoryProps> = ({ loans, onReturn }) => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [receivedBy, setReceivedBy] = useState('');
  const [returnObs, setReturnObs] = useState('');
  
  const returnSigRef = useRef<SignatureCanvasRef>(null);

  const handleOpenReturnModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setReceivedBy('');
    setReturnObs('');
  };

  useEffect(() => {
    if (selectedLoan) {
      const timer = setTimeout(() => {
        if (returnSigRef.current) {
          returnSigRef.current.resize();
          returnSigRef.current.clear();
        }
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [selectedLoan]);

  const handleCloseModal = () => {
    setSelectedLoan(null);
  };

  const confirmReturn = () => {
    if (!selectedLoan) return;
    if (!receivedBy.trim()) {
      toast.error("Debe indicar quién recibe el equipo");
      return;
    }

    const signature = returnSigRef.current?.isEmpty() ? undefined : returnSigRef.current?.getDataURL();

    onReturn(selectedLoan.id, {
      receivedBy,
      observations: returnObs,
      signature
    });
    
    handleCloseModal();
  };

  const columns = [
    { header: "Fecha", accessor: "date", sortable: true, className: "text-slate-500 text-sm" },
    { 
      header: "Empleado", 
      accessor: (row: Loan) => (
        <div>
          <div className="font-semibold text-slate-900">{row.employeeSnapshot.name}</div>
          <div className="text-xs text-slate-400 font-mono">{row.employeeSnapshot.rut}</div>
        </div>
      ),
      sortable: true
    },
    {
      header: "Equipos",
      accessor: (row: Loan) => (
        <div className="flex flex-wrap gap-1">
          {row.items.map((i, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
              {i.equipmentSnapshot.type}
            </span>
          ))}
        </div>
      )
    },
    { 
      header: "Valor Total", 
      accessor: (row: Loan) => <span className="text-slate-700 font-medium">${row.totalValue.toLocaleString()}</span>,
      sortable: true
    },
    {
      header: "Estado",
      accessor: (row: Loan) => (
        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${
          row.status === 'activo' 
            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        }`}>
          {row.status === 'activo' ? 'EN PRÉSTAMO' : 'DEVUELTO'}
        </span>
      ),
      sortable: true
    },
    {
      header: "Documentos",
      accessor: (row: Loan) => (
        <div className="flex gap-2 justify-center">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                generateLoanPDF(row, 'ENTREGA');
                toast.success('Descargando...');
            }}
            className="text-tuniche-600 hover:text-tuniche-800 p-1.5 bg-tuniche-50 rounded-lg"
            title="PDF Entrega"
          >
            <FileText className="w-4 h-4" />
          </motion.button>
          {row.status === 'devuelto' && (
             <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                  generateLoanPDF(row, 'DEVOLUCION');
                  toast.success('Descargando...');
              }}
              className="text-emerald-600 hover:text-emerald-800 p-1.5 bg-emerald-50 rounded-lg"
              title="PDF Devolución"
            >
              <CheckCircle className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      ),
      className: "text-center w-[120px]"
    },
    {
      header: "Acciones",
      accessor: (row: Loan) => (
        <div className="flex justify-end">
          {row.status === 'activo' ? (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleOpenReturnModal(row)} 
              className="!text-tuniche-600 !border-tuniche-200 hover:!bg-tuniche-50 hover:!text-tuniche-700 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Devolver
            </Button>
          ) : (
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Finalizado
            </span>
          )}
        </div>
      ),
      className: "text-right min-w-[140px]"
    }
  ];

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Historial de Operaciones</h2>
        <p className="text-slate-500 text-sm">Registro completo de préstamos y devoluciones.</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/60 overflow-hidden">
        <DataTable 
          data={loans} 
          columns={columns as any}
          searchPlaceholder="Buscar por nombre, rut o equipo..."
        />
      </div>

      {/* Modal de Devolución con Framer Motion */}
      <AnimatePresence>
        {selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative z-10"
            >
              
              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
                    <RotateCcw className="w-5 h-5 text-tuniche-600" />
                  </div>
                  Registrar Devolución
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-sm text-slate-600 mb-2">
                  Devolviendo equipos de: <span className="font-bold text-slate-800">{selectedLoan.employeeSnapshot.name}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <UserCheck className="w-3 h-3" /> Recibido Por (IT)
                  </label>
                  <Input 
                    placeholder="Nombre del técnico" 
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Estado / Observaciones
                  </label>
                  <textarea 
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-tuniche-500 outline-none transition-shadow"
                    placeholder="Estado del equipo, comentarios..."
                    value={returnObs}
                    onChange={(e) => setReturnObs(e.target.value)}
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <PenLine className="w-3 h-3" /> Firma del Empleado
                    </label>
                    <button 
                      onClick={() => returnSigRef.current?.clear()}
                      className="text-xs text-tuniche-600 hover:underline"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-1 bg-slate-50 overflow-hidden">
                    <SignatureCanvas ref={returnSigRef} />
                  </div>
                </div>

              </div>

              {/* Footer Modal */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                <Button variant="ghost" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button onClick={confirmReturn} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20">
                  <CheckCircle className="w-4 h-4 mr-2" /> Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};