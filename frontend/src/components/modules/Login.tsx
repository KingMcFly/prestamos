import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { User, Lock, LayoutGrid, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Validación simple (Hardcoded para demo)
    if (username === 'admin' && password === '1234') {
      toast.success('Bienvenido al sistema');
      onLogin();
    } else {
      toast.error('Credenciales incorrectas');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#dcfce7,transparent)]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8">
          <div className="flex flex-col items-center mb-8">
            {/* Gradiente actualizado a Verdes */}
            <div className="bg-gradient-to-tr from-tuniche-600 to-emerald-500 p-4 rounded-2xl shadow-lg shadow-tuniche-600/30 mb-4">
              <LayoutGrid className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Tuniche Fruits</h1>
            <p className="text-slate-500 text-sm">Sistema de Gestión de Activos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-tuniche-500 focus:border-transparent outline-none transition-all bg-slate-50/50 focus:bg-white"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-tuniche-500 focus:border-transparent outline-none transition-all bg-slate-50/50 focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-3.5 mt-2 text-base shadow-xl shadow-tuniche-600/20" 
              isLoading={isLoading}
            >
              Iniciar Sesión <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Versión 2.0.1 · Departamento de TI
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};