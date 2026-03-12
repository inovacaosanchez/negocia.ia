# Guia de Troubleshooting - Erro ERR_CONNECTION_REFUSED

## Problema
Erro `Failed to load resource: net::ERR_CONNECTION_REFUSED` ao tentar acessar o backend.

## Soluções

### 1. Verificar se o servidor está rodando

Execute no terminal:
```bash
netstat -ano | findstr :5000
```

Se não houver saída, o servidor não está rodando. Inicie com:
```bash
npm run start
```

### 2. Verificar se o servidor está respondendo

Teste com curl ou PowerShell:
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/debug/files
```

Ou no navegador, acesse:
```
http://localhost:5000/api/debug/files
```

### 3. Reiniciar o servidor

Se o servidor estiver travado:
1. Pare o servidor (Ctrl+C no terminal onde está rodando)
2. Inicie novamente:
```bash
npm run start
```

### 4. Verificar firewall

O Windows Firewall pode estar bloqueando a porta 5000:
1. Abra "Firewall do Windows Defender"
2. Clique em "Configurações Avançadas"
3. Verifique se há regras bloqueando a porta 5000

### 5. Limpar cache do navegador

1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Limpe o cache
4. Recarregue a página com `Ctrl + F5`

### 6. Verificar console do navegador

Abra o DevTools (F12) e verifique:
- Aba "Console" para erros JavaScript
- Aba "Network" para ver requisições falhando
- Verifique se há erros de CORS

### 7. Verificar variáveis de ambiente

Se estiver usando variável de ambiente `VITE_API_URL`, certifique-se de que está configurada corretamente.

Crie um arquivo `.env` na raiz do projeto:
```
VITE_API_URL=http://localhost:5000
```

Depois, reinicie o servidor de desenvolvimento do Vite.

### 8. Verificar se há múltiplas instâncias

Pode haver múltiplas instâncias do servidor rodando. Verifique:
```bash
Get-Process node | Select-Object Id, ProcessName
```

Encerre processos duplicados se necessário.

### 9. Verificar logs do servidor

Verifique o terminal onde o servidor está rodando para ver se há erros ou mensagens de inicialização.

### 10. Testar com IP da máquina

Se estiver acessando pela intranet, tente usar o IP da máquina:
```
http://172.25.0.19:5000/api/debug/files
```

E configure no `.env`:
```
VITE_API_URL=http://172.25.0.19:5000
```

## Status Atual

- ✅ Servidor está rodando na porta 5000 (processo detectado)
- ✅ Servidor responde a requisições HTTP
- ✅ CORS está configurado no servidor
- ⚠️ Verificar se o frontend está usando a URL correta

