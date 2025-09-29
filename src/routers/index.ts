import { Router } from "express";
import { Request, Response } from "express"
import { generateLargeFile } from "./generate";

import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import csvtojson from "csv-parser";

export const router = Router()

/**
 * Rota principal que envia o conteúdo do arquivo como um stream,
 * simulando o efeito de digitação palavra por palavra.
 * Cada palavra é enviada com delay de 80ms e ao final de cada frase pula linha.
 * 
 * @param {Request} request - Objeto de requisição do Express
 * @param {Response} respose - Objeto de resposta do Express
 */

// 📌 Exemplo de rota que simula digitação palavra por palavra como se fosse um chat
router.get("/", async (request: Request, respose: Response) => {
  respose.setHeader("Access-Control-Allow-Origin", "*")
  respose.setHeader("Content-Type", "text/event-stream; charset=utf-8")
  respose.setHeader("Cache-Control", "no-cache")
  respose.setHeader("Connection", "keep-alive")
 
  for await (const chunk of generateLargeFile('poema')) {
    // Simula envio de dados em partes menores, palavra por palavra igual a uma digitação
    const phrases = chunk.split('\n') // separa por frase
    for (const phrase of phrases) {
      const words = phrase.split(' ') // separa por palavra
      for (const word of words) {
        respose.write(`${word} `) // envia palavra
        await new Promise(resolve => setTimeout(resolve, 80)) // espera 80ms
      }
      respose.write('\n') // pula linha ao terminar frase
      await new Promise(resolve => setTimeout(resolve, 80)) // espera 80ms entre frases
    }
  }

  respose.end()
})

/**
 * Rota /log que transmite o conteúdo do arquivo 'log.txt' via streaming.
 * 
 * Utiliza o formato 'text/event-stream' para enviar os dados em tempo real,
 * permitindo que o cliente receba o conteúdo do arquivo em partes (chunks).
 * 
 * @param {Request} request - Objeto de requisição do Express
 * @param {Response} respose - Objeto de resposta do Express
 * @returns {void}
 */

// 📌 Exemplo de rota que manda em chunks o conteúdo de um arquivo grande
router.get("/log", async (request: Request, respose: Response) => {
  respose.setHeader("Access-Control-Allow-Origin", "*")
  respose.setHeader("Content-Type", "text/event-stream; charset=utf-8")
  respose.setHeader("Cache-Control", "no-cache")
  respose.setHeader("Connection", "keep-alive")

   for await (const chunk of generateLargeFile('log')) {
     respose.write(chunk) // envia o chunk
   }

   respose.end()
})

/**
 * Rota /csv que processa o arquivo 'data.csv' via streaming.
 *
 * Lê o arquivo CSV, converte cada linha para JSON, filtra apenas os registros
 * cujo campo 'favorite_os' seja igual a 'macos' e salva o resultado em formato JSONL.
 *
 * Ao final do processamento, retorna uma mensagem de sucesso.
 *
 * @param {Request} request - Objeto de requisição do Express
 * @param {Response} response - Objeto de resposta do Express
 * @returns {Promise<void>}
 */

router.get("/csv", async (request: Request, response: Response) => {
  await pipeline (
    createReadStream("./doc/data.csv"),
    csvtojson(),
    async function* (source) {
      for await (const chunk of source) {
        if(chunk.favorite_os !== 'macos') continue
        yield JSON.stringify(chunk) + "\n"
      }
    },

    createWriteStream("./doc/outputfile.jsonl")
  )

  response.status(200).json({ message: "CSV processado com sucesso!" })
})