import { Transcricao, Resumo, RegistroAnalitico, PalavraCloud } from "@/types/data";

export const mockTranscricoes: Transcricao[] = [
  {
    id: "1",
    dataLigacao: "2024-01-15",
    idOperador: "OP001",
    idLigacao: "LIG001",
    tabulacao: "Acordo Fechado",
    acordo: true,
    duracaoSegundos: 420,
    palavras: 856,
    conteudo: [
      { autor: "operador", texto: "Bom dia! Meu nome é Carlos, estou ligando do setor de negociação do Itaú. Com quem eu falo?", timestamp: "00:00" },
      { autor: "cliente", texto: "Bom dia, aqui é o João Silva.", timestamp: "00:08" },
      { autor: "operador", texto: "Senhor João, tudo bem? Estou entrando em contato sobre uma pendência em seu cadastro. O senhor tem um momento para conversarmos?", timestamp: "00:15" },
      { autor: "cliente", texto: "Sim, pode falar. Eu sei que estou devendo, mas está difícil.", timestamp: "00:28" },
      { autor: "operador", texto: "Entendo perfeitamente, senhor João. Justamente por isso estou ligando. Temos condições especiais para regularizar sua situação. Posso apresentar algumas opções?", timestamp: "00:38" },
      { autor: "cliente", texto: "Pode sim, qual seria o valor?", timestamp: "00:52" },
      { autor: "operador", texto: "O valor total da dívida é de R$ 3.450,00, mas conseguimos um desconto especial de 40%. O senhor poderia quitar por R$ 2.070,00 à vista, ou parcelar em até 12x.", timestamp: "01:00" },
      { autor: "cliente", texto: "À vista fica difícil. Quanto ficaria parcelado?", timestamp: "01:20" },
      { autor: "operador", texto: "Parcelado em 12 vezes, ficaria R$ 230,00 por mês. Cabe no seu orçamento?", timestamp: "01:28" },
      { autor: "cliente", texto: "Consigo pagar R$ 200,00 por mês, seria possível?", timestamp: "01:42" },
      { autor: "operador", texto: "Deixa eu verificar aqui... Consegui autorização! Podemos fazer em 12x de R$ 200,00. A primeira parcela vence dia 20. Posso confirmar?", timestamp: "01:50" },
      { autor: "cliente", texto: "Sim, pode confirmar. Agradeço a paciência.", timestamp: "02:15" },
      { autor: "operador", texto: "Perfeito, senhor João! Acordo confirmado. O senhor receberá um SMS com os detalhes do pagamento. Muito obrigado e tenha um ótimo dia!", timestamp: "02:22" },
    ],
  },
  {
    id: "2",
    dataLigacao: "2024-01-15",
    idOperador: "OP002",
    idLigacao: "LIG002",
    tabulacao: "Cliente Ausente",
    acordo: false,
    duracaoSegundos: 45,
    palavras: 120,
    conteudo: [
      { autor: "operador", texto: "Bom dia! Meu nome é Ana, estou ligando do setor de negociação do Itaú. Com quem eu falo?", timestamp: "00:00" },
      { autor: "cliente", texto: "Aqui é a empregada, a dona Maria não está.", timestamp: "00:10" },
      { autor: "operador", texto: "Entendo. A senhora sabe quando ela retorna?", timestamp: "00:18" },
      { autor: "cliente", texto: "Só volta à noite, depois das 19h.", timestamp: "00:25" },
      { autor: "operador", texto: "Certo, vou registrar para retornarmos. Muito obrigada!", timestamp: "00:32" },
    ],
  },
  {
    id: "3",
    dataLigacao: "2024-01-16",
    idOperador: "OP001",
    idLigacao: "LIG003",
    tabulacao: "Promessa de Pagamento",
    acordo: false,
    duracaoSegundos: 380,
    palavras: 720,
    conteudo: [
      { autor: "operador", texto: "Boa tarde! Meu nome é Carlos, estou ligando do setor de negociação do Itaú. Falo com o senhor Pedro?", timestamp: "00:00" },
      { autor: "cliente", texto: "Sou eu mesmo. O que deseja?", timestamp: "00:10" },
      { autor: "operador", texto: "Senhor Pedro, estou entrando em contato sobre uma pendência financeira. Gostaria de apresentar algumas opções de negociação.", timestamp: "00:18" },
      { autor: "cliente", texto: "Olha, eu sei da dívida, mas esse mês não tenho como pagar nada.", timestamp: "00:32" },
      { autor: "operador", texto: "Compreendo. O senhor teria previsão de quando poderia iniciar os pagamentos?", timestamp: "00:42" },
      { autor: "cliente", texto: "Mês que vem eu recebo uma rescisão. Aí consigo pagar.", timestamp: "00:52" },
      { autor: "operador", texto: "Perfeito! Posso agendar um retorno para o dia 15 do próximo mês?", timestamp: "01:02" },
      { autor: "cliente", texto: "Pode sim, pode ligar que aí a gente negocia.", timestamp: "01:12" },
      { autor: "operador", texto: "Combinado, senhor Pedro. Registrei o agendamento. Tenha um ótimo dia!", timestamp: "01:20" },
    ],
  },
  {
    id: "4",
    dataLigacao: "2024-01-17",
    idOperador: "OP003",
    idLigacao: "LIG004",
    tabulacao: "Acordo Fechado",
    acordo: true,
    duracaoSegundos: 510,
    palavras: 920,
    conteudo: [
      { autor: "operador", texto: "Bom dia! Sou a Mariana, do setor de negociação Itaú. Falo com a senhora Carla?", timestamp: "00:00" },
      { autor: "cliente", texto: "Sim, sou eu. Já sei o motivo da ligação.", timestamp: "00:10" },
      { autor: "operador", texto: "Ótimo, senhora Carla. Temos ótimas condições hoje. Posso apresentar?", timestamp: "00:18" },
      { autor: "cliente", texto: "Pode, mas já adianto que não tenho muito dinheiro.", timestamp: "00:28" },
      { autor: "operador", texto: "Entendo perfeitamente. Sua dívida total é R$ 5.200,00. Conseguimos um desconto de 50% para pagamento à vista: R$ 2.600,00.", timestamp: "00:38" },
      { autor: "cliente", texto: "À vista não consigo. Tem como parcelar?", timestamp: "00:55" },
      { autor: "operador", texto: "Claro! Podemos fazer em até 18x de R$ 195,00. Ou 24x de R$ 155,00.", timestamp: "01:05" },
      { autor: "cliente", texto: "24 vezes fica melhor pra mim. Pode fazer.", timestamp: "01:20" },
      { autor: "operador", texto: "Perfeito! Vou confirmar: 24 parcelas de R$ 155,00, primeira vencendo dia 25. Está de acordo?", timestamp: "01:30" },
      { autor: "cliente", texto: "Está sim. Obrigada pela paciência.", timestamp: "01:45" },
      { autor: "operador", texto: "Nós que agradecemos! Enviarei os boletos por SMS. Tenha um excelente dia!", timestamp: "01:52" },
    ],
  },
  {
    id: "5",
    dataLigacao: "2024-01-18",
    idOperador: "OP002",
    idLigacao: "LIG005",
    tabulacao: "Recusa",
    acordo: false,
    duracaoSegundos: 180,
    palavras: 380,
    conteudo: [
      { autor: "operador", texto: "Boa tarde! Sou a Ana, da central de negociação Itaú. Posso falar com o senhor Roberto?", timestamp: "00:00" },
      { autor: "cliente", texto: "Sou eu. O que vocês querem?", timestamp: "00:10" },
      { autor: "operador", texto: "Senhor Roberto, estou ligando para oferecer condições especiais de negociação.", timestamp: "00:18" },
      { autor: "cliente", texto: "Não tenho interesse. Já disse que não vou pagar essa dívida.", timestamp: "00:28" },
      { autor: "operador", texto: "Entendo, senhor. Mas gostaria de informar que temos descontos de até 60%...", timestamp: "00:38" },
      { autor: "cliente", texto: "Não adianta. Não vou pagar e não quero mais ligações.", timestamp: "00:50" },
      { autor: "operador", texto: "Compreendo, senhor Roberto. Registro sua solicitação. Tenha um bom dia.", timestamp: "01:00" },
    ],
  },
];

export const mockResumos: Resumo[] = [
  {
    idLigacao: "LIG001",
    resumo: "Cliente João Silva mostrou-se receptivo à negociação desde o início. Apresentou dificuldade financeira temporária mas demonstrou interesse em regularizar a situação. Foi oferecido desconto de 40% no valor total da dívida. Após negociação, cliente aceitou parcelamento em 12x de R$ 200,00. Acordo fechado com sucesso.",
    pontosChave: [
      "Cliente receptivo à negociação",
      "Dificuldade financeira temporária",
      "Desconto de 40% oferecido",
      "Parcelamento em 12x aceito",
      "Valor final: R$ 200,00/mês",
    ],
    sentimento: "positivo",
    proximosPassos: "Enviar SMS com boletos e acompanhar primeiro pagamento.",
  },
  {
    idLigacao: "LIG002",
    resumo: "Ligação atendida por terceiro (empregada doméstica). A titular Maria não se encontrava em casa no momento. Informado que retorna apenas após as 19h. Necessário reagendamento para horário noturno.",
    pontosChave: [
      "Titular ausente",
      "Atendido por terceiro",
      "Retorno após 19h",
      "Necessário reagendamento",
    ],
    sentimento: "neutro",
    proximosPassos: "Reagendar ligação para período noturno.",
  },
  {
    idLigacao: "LIG003",
    resumo: "Cliente Pedro reconhece a dívida mas alega impossibilidade de pagamento no momento atual. Informou que receberá rescisão trabalhista no próximo mês e terá condições de negociar. Agendado retorno para dia 15 do próximo mês.",
    pontosChave: [
      "Cliente reconhece dívida",
      "Sem condições atuais de pagamento",
      "Aguardando rescisão trabalhista",
      "Retorno agendado",
    ],
    sentimento: "neutro",
    proximosPassos: "Retornar ligação dia 15 do próximo mês para nova tentativa de acordo.",
  },
  {
    idLigacao: "LIG004",
    resumo: "Cliente Carla já esperava a ligação e mostrou-se colaborativa. Dívida total de R$ 5.200,00 com desconto de 50% oferecido. Cliente optou por parcelamento mais longo em 24x de R$ 155,00 por questões de orçamento. Acordo fechado com sucesso.",
    pontosChave: [
      "Cliente colaborativa",
      "Dívida: R$ 5.200,00",
      "Desconto de 50% aplicado",
      "Parcelamento em 24x aceito",
      "Valor final: R$ 155,00/mês",
    ],
    sentimento: "positivo",
    proximosPassos: "Enviar boletos via SMS. Monitorar pagamento da primeira parcela.",
  },
  {
    idLigacao: "LIG005",
    resumo: "Cliente Roberto mostrou-se hostil desde o início da ligação. Recusou todas as ofertas de negociação e solicitou que não seja mais contatado. Mesmo com oferta de desconto de 60%, manteve a recusa.",
    pontosChave: [
      "Cliente hostil",
      "Recusa total de negociação",
      "Solicitou não ser contatado",
      "Desconto de 60% recusado",
    ],
    sentimento: "negativo",
    proximosPassos: "Registrar recusa e avaliar próximos passos com supervisão.",
  },
];

export const mockAnalitico: RegistroAnalitico[] = mockTranscricoes.map((t) => ({
  id: t.id,
  dataLigacao: t.dataLigacao,
  idOperador: t.idOperador,
  idLigacao: t.idLigacao,
  tabulacao: t.tabulacao,
  acordo: t.acordo,
  duracaoSegundos: t.duracaoSegundos,
  palavras: t.palavras,
  sentimento: mockResumos.find((r) => r.idLigacao === t.idLigacao)?.sentimento,
}));

export const gerarNuvemPalavras = (transcricoes: Transcricao[]): PalavraCloud[] => {
  const palavrasContagem: Record<string, number> = {};
  const stopWords = new Set([
    "a", "o", "e", "de", "da", "do", "que", "em", "um", "uma", "para", "com",
    "não", "é", "eu", "se", "na", "no", "os", "as", "por", "mais", "mas",
    "foi", "ao", "ele", "ela", "das", "dos", "ou", "ser", "quando", "muito",
    "nos", "já", "também", "só", "seu", "sua", "meu", "minha", "tem", "isso",
    "isso", "aqui", "está", "estou", "essa", "esse", "como", "me", "sim", "bem",
    "bom", "boa", "dia", "tarde", "noite", "pode", "vou", "vai", "ter", "sou",
  ]);

  transcricoes.forEach((t) => {
    t.conteudo.forEach((msg) => {
      const palavras = msg.texto
        .toLowerCase()
        .replace(/[.,!?;:()]/g, "")
        .split(/\s+/)
        .filter((p) => p.length > 2 && !stopWords.has(p));

      palavras.forEach((p) => {
        palavrasContagem[p] = (palavrasContagem[p] || 0) + 1;
      });
    });
  });

  return Object.entries(palavrasContagem)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
};
