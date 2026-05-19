import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Caracteres permitidos: consonantes + dígitos (sin vocales para evitar palabras ofensivas)
const CHARS = 'BCDFGHJKLMNPQRSTVWXYZ23456789';

function generateCode(): string {
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `SPOLT-${random}`;
}

async function getUniqueCode(): Promise<string> {
  let code: string;
  let exists = true;

  while (exists) {
    code = generateCode();
    const user = await prisma.usuario.findUnique({
      where: { codigo_usuario: code },
    });
    exists = !!user;
  }

  return code!;
}

async function main() {
  console.log('🔍 Buscando usuarios sin código...');

  const usersWithoutCode = await prisma.usuario.findMany({
    where: { codigo_usuario: null },
    select: { id_usuario: true, nombre_usuario: true },
  });

  if (usersWithoutCode.length === 0) {
    console.log('✅ Todos los usuarios ya tienen código. No hay nada que migrar.');
    return;
  }

  console.log(`📋 ${usersWithoutCode.length} usuario(s) sin código encontrados. Generando...`);

  for (const user of usersWithoutCode) {
    const code = await getUniqueCode();
    await prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: { codigo_usuario: code },
    });
    console.log(`  ✓ @${user.nombre_usuario} → ${code}`);
  }

  console.log('\n🎉 ¡Migración completada! Todos los usuarios tienen ahora un código Spolt.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
