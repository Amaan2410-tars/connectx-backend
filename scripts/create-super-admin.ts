import "dotenv/config";
import prisma from "../src/config/prisma";
import bcrypt from "bcrypt";

async function createSuperAdmin() {
  try {
    // First, get or create a college
    let college = await prisma.college.findFirst();
    
    if (!college) {
      console.log("No college found. Creating default college...");
      college = await prisma.college.create({
        data: {
          name: "Default College",
          slug: "default-college",
        },
      });
      console.log("✅ Default college created:", college.id);
    }

    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@connectx.com" },
    });

    if (existingAdmin) {
      console.log("⚠️  Super admin already exists with email: admin@connectx.com");
      console.log("   You can login with this account or create a new one with a different email.");
      return;
    }

    // Hash password (default: admin123)
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        username: "superadmin",
        email: "admin@connectx.com",
        phone: "+1234567890",
        password: hashedPassword,
        role: "super_admin",
        collegeId: college.id,
        batch: "2024-2028",
        emailVerified: true,
        phoneVerified: true,
        verifiedStatus: "approved",
        bypassVerified: true,
      } as any, // Type assertion to bypass TypeScript check
    });

    console.log("✅ Super Admin created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", password);
    console.log("🌐 Access URL: http://localhost:5173/admin");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();

