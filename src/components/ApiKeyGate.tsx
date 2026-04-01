import React, { useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { validateApiKey } from '../services/gemini';
import { Wand2, Key, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function ApiKeyGate({ children }: { children: React.ReactNode }) {
  const hasServerKey = process.env.HAS_SERVER_KEY;
  const { apiKey, setApiKey } = useApiKey();
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mode A: Server key exists, or Mode B: User has provided a valid key
  if (hasServerKey || apiKey) {
    return <>{children}</>;
  }

  // Mode B: Prompt for key
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsValidating(true);
    setError(null);

    try {
      const isValid = await validateApiKey(inputValue.trim());
      if (isValid) {
        setApiKey(inputValue.trim());
      } else {
        setError('Chave inválida. Verifique e tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao validar a chave.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 selection:bg-indigo-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
            <Wand2 className="w-6 h-6 text-indigo-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Product Photo Studio AI
          </h1>
          
          <p className="text-gray-600 mb-6">
            Para utilizar esta aplicação, precisa de uma chave de API do Google Gemini. É gratuita.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                Chave de API (API Key)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="apiKey"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Cole a sua chave aqui..."
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!inputValue.trim() || isValidating}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A validar...
                </>
              ) : (
                'Começar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <a 
              href="https://aistudio.google.com/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
            >
              Obter a minha chave gratuita
            </a>
            
            <p className="text-xs text-gray-400">
              A sua chave é usada apenas no seu browser e nunca é enviada para o nosso servidor.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
