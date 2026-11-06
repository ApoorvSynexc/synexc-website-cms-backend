import crypto from 'crypto';
import bcrypt from 'bcrypt';
import initializeDatabase, { prisma } from '../config/database/index.js';
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  DEFAULT_SITE_SETTING,
} from '../assets/default/index.js';

/**
 * Idempotent: safe to run again after deploys. It creates what is missing and never overwrites what
 * people have edited (passwords, role permissions, site settings).
 *
 *   npm run seed
 */

const seedPermissions = async () => {
  for (const { action, subject } of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { uk_action_subject: { action: action as any, subject: subject as any } },
      create: { action: action as any, subject: subject as any, description: `${action} ${subject}` },
      update: {},
    });
  }
  console.log(`✓ ${DEFAULT_PERMISSIONS.length} permissions seeded`);
};

const seedRoles = async () => {
  for (const role of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: { name: role.name, description: role.description, isSystem: role.isSystem },
      update: {},
    });
  }
  console.log(`✓ ${DEFAULT_ROLES.length} roles seeded`);
};

const grant = async (roleId: string, permissionIds: string[]) => {
  for (const permissionId of permissionIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      create: { roleId, permissionId },
      update: {},
    });
  }
};

const seedRolePermissions = async () => {
  const permissions = await prisma.permission.findMany();
  const byKey = new Map(permissions.map((p) => [`${p.action}:${p.subject}`, p.id]));

  for (const def of DEFAULT_ROLES) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: def.name } });

    // Admin gets everything. Other starter roles get their defaults ONLY the first time — after that the team
    // edits them in the CMS and a re-seed must not undo it.
    if (def.isSystem) {
      await grant(role.id, permissions.map((p) => p.id));
    } else if ((await prisma.rolePermission.count({ where: { roleId: role.id } })) === 0) {
      await grant(
        role.id,
        def.permissions.map((key) => byKey.get(key)).filter((id): id is string => Boolean(id)),
      );
    }
  }
  console.log('✓ role permissions seeded');
};

const seedAdminUser = async () => {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@synexc.com').toLowerCase();

  if (await prisma.user.findUnique({ where: { email } })) {
    console.log(`✓ admin user ${email} already exists (password left unchanged)`);
    return;
  }

  // No hardcoded password: use SEED_ADMIN_PASSWORD, or generate one and show it once.
  const generated = !process.env.SEED_ADMIN_PASSWORD;
  const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
  const role = await prisma.role.findUniqueOrThrow({ where: { name: 'Admin' } });

  await prisma.user.create({
    data: { name: 'Synexc Admin', email, passwordHash: await bcrypt.hash(password, 12), roleId: role.id },
  });

  console.log(`✓ admin user created: ${email}`);
  if (generated) console.log(`  generated password (shown once, change it after logging in): ${password}`);
};

const seedSiteSetting = async () => {
  await prisma.siteSetting.upsert({
    where: { key: DEFAULT_SITE_SETTING.key },
    create: { ...DEFAULT_SITE_SETTING },
    update: {},
  });
  console.log('✓ site settings seeded');
};

const main = async () => {
  try {
    console.log(await initializeDatabase());
    await seedPermissions();
    await seedRoles();
    await seedRolePermissions();
    await seedAdminUser();
    await seedSiteSetting();
    console.log('\n✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

main();
