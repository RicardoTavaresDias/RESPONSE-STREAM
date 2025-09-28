import fs from 'node:fs'

/**
 * Gerador assíncrono que lê um arquivo grande em chunks.
 * Cada chunk é retornado após um delay de 1 segundo.
 * 
 * @param {string} fileName - Nome do arquivo (sem extensão) a ser lido da pasta ./doc.
 * @async
 * @generator
 * @yields {string} Chunk do arquivo lido
 */

async function* generateLargeFile(fileName: string) {
  const stream = fs.createReadStream(`./doc/${fileName}.txt`, {
    encoding: 'utf-8',
      /**
     * highWaterMark: 16 * 1024
     * 
     * Define o tamanho do buffer de leitura do arquivo em bytes.
     * Neste caso, 16 * 1024 equivale a 16KB.
     * Isso significa que cada chunk lido do arquivo terá até 16KB.
     * Um valor maior lê mais dados por vez, enquanto um valor menor lê menos.
     * É útil para controlar o desempenho e o uso de memória ao processar arquivos grandes em streaming.
     */
    highWaterMark: 16 * 1024 // 16kb por vez
  })  

  for await (const chunk of stream) {

      /**
     * O comando 'yield' dentro de uma função geradora (function*) 
     * retorna o valor do chunk para quem está consumindo o generator.
     * 
     * Ao usar 'yield', a execução da função é pausada até que o próximo valor seja solicitado.
     * Isso permite processar grandes arquivos em partes, sem carregar tudo na memória,
     * tornando o processamento mais eficiente e escalável.
     */

    if(chunk) yield chunk
  }
}

export { generateLargeFile }