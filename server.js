const { createServer } = require("node:http");

const enderecoServidor = "127.0.0.1";
const porta = 3000;

const apiKey = "";

const sever = createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const bodyJSON = JSON.parse(body);
        const conteudoArquivo = bodyJSON.arquivo;

        enviarParaChatGPT(conteudoArquivo)
          .then((response) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ explicacao: response }));
          })
          .catch((erro) => {
            console.error("Erro ao processar a requisição:", erro);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ erro: "Erro ao processar a requisição" }));
          });
      } catch (erro) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ erro: "Formato de JSON inválido" }));
      }
    });
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Rota não encontrada");
  }
});

async function enviarParaChatGPT(conteudoArquivo) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Explique o que faz o seguinte código, explicando as principais variaveis e funções: \n\n${conteudoArquivo}`,
        },
      ],
      max_tokens: 150,
    }),
  });

  const dados = await res.json();

  return dados;
}

sever.listen(porta, enderecoServidor, () => {
  console.log(`Servidor rodando em http://${enderecoServidor}:${porta}/`);
});
