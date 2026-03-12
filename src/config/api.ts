// Configuração da API Backend
// Em desenvolvimento, usa localhost
// Em produção, pode ser configurado via variável de ambiente
const getApiUrl = () => {
  // Se estiver rodando na intranet, pode usar o IP da máquina
  // Caso contrário, usa localhost
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detecta se está rodando em produção ou desenvolvimento
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // Em produção, tenta usar o mesmo host da aplicação
    return window.location.origin.replace(/:\d+$/, ':5000');
  }
  
  // Em desenvolvimento, usa localhost
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();

