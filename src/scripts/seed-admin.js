// scripts/seed-admin.js
// Run this script to create your first admin user
// Usage: node scripts/seed-admin.js your-email@example.com "Your Name"
// node scripts/seed-admin.js dirdhvataliya2003@gmail.com "Dirdh Vataliya"

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = process.argv[2];
  const name = process.argv[3];

  if (!email) {
    console.error('Usage: node scripts/seed-admin.js your-email@example.com "Your Name"');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.authorizedUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`User ${email} already exists with role: ${existingUser.role}`);
      
      // Update to admin if not already
      if (existingUser.role !== 'admin') {
        await prisma.authorizedUser.update({
          where: { email },
          data: { role: 'admin', isActive: true }
        });
        console.log(`Updated ${email} to admin role`);
      }
      return;
    }

    // Create new admin user
    const newAdmin = await prisma.authorizedUser.create({
      data: {
        email,
        name: name || null,
        role: 'admin',
        isActive: true,
        addedBy: 'system'
      }
    });

    console.log(`✅ Admin user created successfully:`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Name: ${newAdmin.name || 'Not provided'}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Status: ${newAdmin.isActive ? 'Active' : 'Inactive'}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();