/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Wand2, 
  History,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiKeyProvider, useApiKey } from './context/ApiKeyContext';
import { ApiKeyGate } from './components/ApiKeyGate';
import { generateContent } from './services/gemini';
import { compressImage } from './utils/imageUtils';

// Utility for Tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditHistoryItem {
  id: string;
  originalImage: string;
  editedImage: string;
  instruction: string;
  timestamp: number;
}

function MainApp() {
  const { apiKey } = useApiKey();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EditHistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!originalImage || !instruction) return;

    setIsCompressing(true);
    setError(null);

    try {
      // Comprime a imagem antes de enviar
      const compressedImage = await compressImage(originalImage);
      setIsCompressing(false);
      setIsProcessing(true);

      const base64Data = compressedImage.split(',')[1];
      const mimeType = compressedImage.split(';')[0].split(':')[1];

      const response = await generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: instruction,
            },
          ],
        },
      }, apiKey);

      let newImageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          newImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (newImageUrl) {
        setEditedImage(newImageUrl);
        const newHistoryItem: EditHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          originalImage,
          editedImage: newImageUrl,
          instruction,
          timestamp: Date.now(),
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      } else {
        setError("A IA não conseguiu processar a imagem com essas instruções. Tente ser mais específico.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao processar a imagem. Por favor, tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `edited-product-${Date.now()}.png`;
    link.click();
  };

  const clearAll = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setInstruction('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Product Studio AI</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <History className="w-6 h-6 text-gray-600" />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Editor */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                {!originalImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Carregar foto do produto</h3>
                      <p className="text-sm text-gray-500 mt-1">Arraste e solte ou clique para procurar</p>
                      <p className="text-xs text-gray-400 mt-4">Suporta PNG, JPG, WebP</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Área de Trabalho</h3>
                      <button 
                        onClick={clearAll}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Limpar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Original</span>
                        <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200 relative group">
                          <img 
                            src={originalImage} 
                            alt="Original" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Resultado</span>
                        <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200 relative flex items-center justify-center">
                          {isCompressing ? (
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                              <p className="text-sm text-gray-500 animate-pulse">A preparar imagem...</p>
                            </div>
                          ) : isProcessing ? (
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                              <p className="text-sm text-gray-500 animate-pulse">A IA está a trabalhar a sua magia...</p>
                            </div>
                          ) : editedImage ? (
                            <img 
                              src={editedImage} 
                              alt="Editado" 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-center p-6">
                              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-400">A sua foto editada aparecerá aqui</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {editedImage && !isProcessing && !isCompressing && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <button 
                          onClick={downloadImage}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                          <Download className="w-5 h-5" />
                          Transferir Resultado
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Instruções</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    O que gostaria de fazer?
                  </label>
                  <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="ex: Remover o fundo e torná-lo branco puro, limpar qualquer pó ou riscos no produto."
                    className="w-full min-h-[120px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sugestões Rápidas</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Remover fundo",
                      "Tornar fundo branco",
                      "Melhorar cores",
                      "Limpar produto",
                      "Adicionar sombra suave"
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInstruction(suggestion)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!originalImage || !instruction || isProcessing || isCompressing}
                  onClick={processImage}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md",
                    !originalImage || !instruction || isProcessing || isCompressing
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
                  )}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      A preparar imagem...
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Aplicar Magia da IA
                    </>
                  )}
                </button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Como funciona
                </h4>
                <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                  <li>Carregue uma foto de alta qualidade do seu produto.</li>
                  <li>Descreva exactamente o que quer alterar.</li>
                  <li>A nossa IA analisará a imagem e aplicará as suas edições.</li>
                  <li>Transfira o resultado para a sua loja ou redes sociais.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* History Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Edições Recentes
                </h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500">Ainda não há edições. Comece a criar!</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="group bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 transition-all">
                      <div className="flex gap-4 mb-3">
                        <div className="w-20 h-20 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                          <img src={item.originalImage} alt="Original" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="w-5 h-5 text-gray-300" />
                        </div>
                        <div className="w-20 h-20 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                          <img src={item.editedImage} alt="Editado" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">"{item.instruction}"</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button 
                          onClick={() => {
                            setOriginalImage(item.originalImage);
                            setEditedImage(item.editedImage);
                            setInstruction(item.instruction);
                            setIsSidebarOpen(false);
                          }}
                          className="text-xs text-indigo-600 font-bold hover:underline"
                        >
                          Restaurar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200 mt-12">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Powered by Gemini AI • Built with React & Tailwind
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ApiKeyProvider>
      <ApiKeyGate>
        <MainApp />
      </ApiKeyGate>
    </ApiKeyProvider>
  );
}
