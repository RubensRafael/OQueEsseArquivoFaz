const { createServer } = require("node:http");

const enderecoServidor = "127.0.0.1";
const porta = 3000;

const apiKey = ""; // Substitua pela sua chave da API do Gemini

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

        enviarParaGemini(conteudoArquivo)
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

async function enviarParaGemini(conteudoArquivo) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      // URL da API do Gemini
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Explique o que faz o seguinte código, explicando as principais variaveis e funções: \n\n${conteudoArquivo}`,
              },
            ],
          },
        ],
      }),
    }
  );

  const dados = await res.json();
  return dados.candidates[0].content.parts[0].text;
}

sever.listen(porta, enderecoServidor, () => {
  console.log(`Servidor rodando em http://${enderecoServidor}:${porta}/`);
});
