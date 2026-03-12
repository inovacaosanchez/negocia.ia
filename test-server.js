// Script de teste do servidor
import fetch from 'node-fetch';

const testServer = async () => {
  try {
    console.log('Testando servidor em http://localhost:5000...');
    
    const response = await fetch('http://localhost:5000/api/debug/files');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor está respondendo!');
      console.log('Dados:', data);
    } else {
      console.error(`❌ Servidor retornou status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao servidor:', error.message);
    console.log('\nPossíveis causas:');
    console.log('1. O servidor não está rodando');
    console.log('2. O servidor está rodando em outra porta');
    console.log('3. Há um problema de firewall');
    console.log('\nPara iniciar o servidor, execute:');
    console.log('  npm run start');
  }
};

testServer();

