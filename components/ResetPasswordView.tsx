import React, { useState, useEffect } from 'react';
import { LayoutGrid, AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../lib/api';

interface ResetPasswordViewProps {
  token: string;
  onBackToLogin: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token, onBackToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const result = await api.auth.validateResetToken(token);
        setTokenValid(result.valid);
        if (!result.valid && result.message) {
          setValidationError(result.message);
        }
      } catch (err: any) {
        setTokenValid(false);
        setValidationError(err.message || 'Token inválido ou expirado');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-6">
          <LayoutGrid className="w-8 h-8" />
        </div>
        <p className="text-gray-600">Validando link...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Link inválido</h1>
        <p className="text-gray-600 text-center max-w-sm mb-6">
          {validationError || 'Este link de redefinição de senha é inválido ou expirou. Solicite um novo link.'}
        </p>
        <Button onClick={onBackToLogin}>
          Voltar ao login
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Senha alterada!</h1>
        <p className="text-gray-600 text-center max-w-sm mb-6">
          Sua senha foi redefinida com sucesso. Você já pode fazer login com sua nova senha.
        </p>
        <Button onClick={onBackToLogin}>
          Ir para o login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="mb-6">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <LayoutGrid className="w-8 h-8" />
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight mb-2">Redefinir senha</h1>
        <p className="text-[#64748B] text-sm max-w-[280px] mx-auto leading-relaxed">
          Crie uma nova senha para sua conta.
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-3 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nova senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar nova senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={isLoading}
            className="py-6 text-base font-bold"
          >
            {isLoading ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full mt-4 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Voltar ao login
        </button>
      </div>

      <p className="mt-8 text-gray-400 text-xs font-medium">
        © 2025 AgendaFácil. Todos os direitos reservados.
      </p>
    </div>
  );
};
