import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Para interpretar JSON
app.use(express.json());

app.get("/api/teste", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor funcionando"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});
