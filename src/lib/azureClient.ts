// azureClient.ts - para teste rápido no navegador
import OpenAI from "openai";

export const client = new OpenAI({
  apiKey: "3VY7eRqUKpUUR5ZiF7dUtANbuYkxxAMjafFagAegVoRernOdbOehJQQJ99BLACHYHv6XJ3w3AAAAACOGavjW", // ⚠️ só teste local
  dangerouslyAllowBrowser: true,
  azure: {
    apiKey: "3VY7eRqUKpUUR5ZiF7dUtANbuYkxxAMjafFagAegVoRernOdbOehJQQJ99BLACHYHv6XJ3w3AAAAACOGavjW",
    endpoint: "https://webmaster-6043-resource.openai.azure.com/openai/v1/chat/completions", // sem /openai/v1
    deploymentName: "gpt-5.1-chat",
  },
});
