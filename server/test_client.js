// test_client.mjs
// Usa fetch nativo do Node 18+

async function testar() {
  try {
    const url = "http://localhost:3000/api/teste";

    console.log("Enviando requisição para:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✔ Resposta recebida:", data);

  } catch (err) {
    console.error("❌ Erro no teste:", err.message);
  }
}

testar();
