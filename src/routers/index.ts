import { Router } from "express";
import { Request, Response } from "express"
import { generateLargeFile } from "./generate";

export const router = Router()

/**
 * Rota principal que envia o conteúdo do arquivo como um stream,
 * simulando o efeito de digitação palavra por palavra.
 * Cada palavra é enviada com delay de 80ms e ao final de cada frase pula linha.
 * 
 * @param {Request} request - Objeto de requisição do Express
 * @param {Response} respose - Objeto de resposta do Express
 */

router.get("/", async (request: Request, respose: Response) => {
  respose.setHeader("Access-Control-Allow-Origin", "*")
  respose.setHeader("Content-Type", "text/event-stream; charset=utf-8")
  respose.setHeader("Cache-Control", "no-cache")
  respose.setHeader("Connection", "keep-alive")
 
  for await (const chunk of generateLargeFile()) {
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