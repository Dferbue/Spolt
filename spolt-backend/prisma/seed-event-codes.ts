import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function generateUniqueCode(): string {
  // Generar 6 bytes aleatorios y convertirlos a base64
  const randomBytes = crypto.randomBytes(6).toString('base64');

  // Limpiar el string para que sea alfanumérico y fácil de leer
  // Excluimos las vocales (A,E,I,O,U) y letras/números confusos (0, O, I, 1)
  const cleanString = randomBytes
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .replace(/[AEIOU01]/g, '');

  // Tomamos los primeros 6 caracteres
  const uniqueCode = cleanString.substring(0, 6);

  // Si por casualidad quedan menos de 6 caracteres, rellenamos
  const finalCode = uniqueCode.padEnd(6, 'X');

  return `SPEV-${finalCode}`;
}

async function main() {
  console.log('Iniciando migración de códigos de evento...');

  const eventosSinCodigo = await prisma.eventoDeportivo.findMany({
    where: {
      codigo_evento: null,
    },
  });

  console.log(`Se encontraron ${eventosSinCodigo.length} eventos sin código.`);

  let actualizados = 0;

  for (const evento of eventosSinCodigo) {
    let codigo = generateUniqueCode();
    let isUnique = false;

    // Asegurar que es único en la base de datos
    while (!isUnique) {
      const existing = await prisma.eventoDeportivo.findUnique({
        where: { codigo_evento: codigo },
      });
      if (existing) {
        codigo = generateUniqueCode(); // Generar otro si existe
      } else {
        isUnique = true;
      }
    }

    await prisma.eventoDeportivo.update({
      where: { id_evento: evento.id_evento },
      data: { codigo_evento: codigo },
    });
    
    console.log(`Evento ID ${evento.id_evento} actualizado con código: ${codigo}`);
    actualizados++;
  }

  console.log(`Migración completada. ${actualizados} eventos actualizados.`);
}

main()
  .catch((e) => {
    console.error('Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
