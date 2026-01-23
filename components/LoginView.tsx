
import React, { useState, useEffect } from 'react';
import { LayoutGrid, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../lib/api';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const getOAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'domain_not_allowed':
      return 'Acesso permitido apenas para e-mails @ekan.com.br';
    case 'google_auth_denied':
      return 'Autenticação Google foi cancelada ou negada';
    case 'auth_init_failed':
      return 'Falha ao iniciar autenticação com Google';
    case 'auth_failed':
      return 'Falha na autenticação. Tente novamente.';
    case 'no_auth_code':
      return 'Código de autenticação não recebido';
    default:
      return 'Erro na autenticação. Tente novamente.';
  }
};

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get('error');
    
    if (errorCode) {
      setError(getOAuthErrorMessage(errorCode));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.auth.login(email, password);
      const apiUser = response.user;
      const user: User = {
        id: String(apiUser.id),
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role as 'admin' | 'colaborador',
        status: apiUser.status as 'ativo' | 'inativo',
        avatar: apiUser.avatar || undefined,
        cpf: apiUser.cpf || undefined,
      };
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
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

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => {
              setIsGoogleLoading(true);
              setError(null);
              window.location.href = '/api/auth/google';
            }}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all disabled:opacity-70"
          >
            <GoogleIcon />
            {isGoogleLoading ? 'Redirecionando...' : 'Entrar com Google'}
          </button>
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
