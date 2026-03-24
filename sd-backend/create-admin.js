const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const nombre = process.env.ADMIN_NAME || 'Super Administrador';

  if (!email || !password) {
    console.error('❌ Se requieren las variables ADMIN_EMAIL y ADMIN_PASSWORD');
    console.error('   Uso: ADMIN_EMAIL=tu@email.com ADMIN_PASSWORD=tuClave node create-admin.js');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ La contraseña debe tener al menos 8 caracteres');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', password: hashed },
    create: {
      email,
      nombre,
      password: hashed,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin creado/actualizado exitosamente:');
  console.log(`📧 Correo: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
