
import React, { useState } from 'react';
import { LayoutGrid, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { MOCK_USERS } from '../constants';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulação de latência de rede para realismo de UX
    setTimeout(() => {
      // Comparação case-insensitive para o e-mail
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Lógica de senha simulada (admin123 para admin, colab123 para colab)
      const validPassword = foundUser?.role === 'admin' ? 'admin123' : 'colab123';

      if (foundUser && password === validPassword) {
        onLogin(foundUser);
      } else {
        setError('E-mail ou senha incorretos. Tente novamente.');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 animate-fade-in">
      {/* Logo Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <LayoutGrid className="w-8 h-8" />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight mb-2">Bem-vindo de volta</h1>
        <p className="text-[#64748B] text-sm max-w-[280px] mx-auto leading-relaxed">
          Entre com suas credenciais para acessar.
        </p>
      </div>

      {/* Login Card */}
      <div className={`w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border ${error ? 'border-[#FEE2E2]' : 'border-gray-100'} p-8 transition-all duration-300`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message - Adjusted to match screenshot styling */}
          {error && (
            <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">E-mail Corporativo</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if(error) setError(null);
                }}
                placeholder="admin@empresa.com"
                className={`w-full px-4 py-3 border ${error ? 'border-[#FCA5A5]' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-dark placeholder:text-gray-400`}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Senha</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if(error) setError(null);
                }}
                placeholder="••••••••"
                className={`w-full px-4 py-3 border ${error ? 'border-[#FCA5A5]' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-dark placeholder:text-gray-400`}
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                Esqueceu a senha?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            fullWidth 
            size="lg"
            disabled={isLoading}
            className="py-6 text-base font-bold bg-primary hover:bg-primary-hover shadow-blue-200 shadow-lg disabled:opacity-70 transition-all rounded-xl"
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </Button>
        </form>
      </div>

      {/* Helper Info for Test */}
      <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-center max-w-sm">
        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Dica de Acesso (Teste)</p>
        <p className="text-[11px] text-blue-500">Admin: admin@empresa.com (admin123)</p>
        <p className="text-[11px] text-blue-500">Colab: colab@empresa.com (colab123)</p>
      </div>

      {/* Footer Branding */}
      <p className="mt-8 text-gray-400 text-xs font-medium">
        © 2025 RoomBooker Corporate. Todos os direitos reservados.
      </p>
    </div>
  );
};
