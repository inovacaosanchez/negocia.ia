# Instruções para Acesso na Intranet

## Configuração do Projeto

O projeto está configurado para rodar na porta **3037** e aceitar conexões da rede local.

## Como Iniciar o Servidor

### 1. Iniciar o Backend (API)
```bash
npm run start
```
O servidor backend rodará na porta **5000** e mostrará o IP da máquina no console.

### 2. Iniciar o Frontend (Interface Web)
```bash
npm run dev
```
O servidor frontend rodará na porta **3037** e estará acessível na rede.

## Acesso na Intranet

### IP da Máquina Atual
- **IP:** 172.25.0.19

### URLs de Acesso

**Frontend (Interface Web):**
- Local: `http://localhost:3037`
- Intranet: `http://172.25.0.19:3037`

**Backend (API):**
- Local: `http://localhost:5000`
- Intranet: `http://172.25.0.19:5000`

## Notas Importantes

1. **Firewall:** Certifique-se de que o firewall do Windows permite conexões nas portas 3037 e 5000.

2. **Acesso na Rede:** Outros computadores na mesma rede podem acessar usando o IP `172.25.0.19:3037`.

3. **Produção:** Para produção, recomenda-se fazer o build do projeto:
   ```bash
   npm run build
   npm run preview
   ```

4. **Verificar IP:** Se o IP mudar, você pode verificar com:
   ```bash
   ipconfig
   ```
   Procure por "IPv4 Address" na interface de rede ativa.

## Configuração do Firewall (Windows)

Se necessário, abra as portas no firewall:

1. Abra o "Firewall do Windows Defender"
2. Clique em "Configurações Avançadas"
3. Clique em "Regras de Entrada" > "Nova Regra"
4. Selecione "Porta" > "TCP" > "Portas específicas locais"
5. Digite: `3037,5000`
6. Permita a conexão
7. Aplique para todos os perfis
8. Dê um nome (ex: "NEGOCIA IA - Portas 3037 e 5000")

