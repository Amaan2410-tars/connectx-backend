require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createSuperAdmin() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // First, get or create a college
    let collegeResult = await client.query(
      'SELECT id FROM "College" LIMIT 1'
    );

    let collegeId;
    if (collegeResult.rows.length === 0) {
      console.log("No college found. Creating default college...");
      const newCollege = await client.query(
        'INSERT INTO "College" (name, slug, "createdAt") VALUES ($1, $2, NOW()) RETURNING id',
        ["Default College", "default-college"]
      );
      collegeId = newCollege.rows[0].id;
      console.log("✅ Default college created:", collegeId);
    } else {
      collegeId = collegeResult.rows[0].id;
      console.log("✅ Using existing college:", collegeId);
    }

    // Check if super admin already exists
    const existingAdmin = await client.query(
      'SELECT id FROM "User" WHERE email = $1',
      ["admin@connectx.com"]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("⚠️  Super admin already exists with email: admin@connectx.com");
      console.log("   You can login with this account or create a new one with a different email.");
      await client.query("ROLLBACK");
      return;
    }

    // Hash password (default: admin123)
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin - check if username column exists
    const tableInfo = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'username'
    `);

    let insertQuery;
    let insertValues;

    if (tableInfo.rows.length > 0) {
      // Username column exists
      insertQuery = `
        INSERT INTO "User" (
          name, username, email, phone, password, role, "collegeId", batch,
          "emailVerified", "phoneVerified", "verifiedStatus", "bypassVerified", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING id, name, email, role
      `;
      insertValues = [
        "Super Admin",
        "superadmin",
        "admin@connectx.com",
        "+1234567890",
        hashedPassword,
        "super_admin",
        collegeId,
        "2024-2028",
        true,
        true,
        "approved",
        true,
      ];
    } else {
      // Username column doesn't exist - create without it
      insertQuery = `
        INSERT INTO "User" (
          name, email, phone, password, role, "collegeId", batch,
          "emailVerified", "phoneVerified", "verifiedStatus", "bypassVerified", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING id, name, email, role
      `;
      insertValues = [
        "Super Admin",
        "admin@connectx.com",
        "+1234567890",
        hashedPassword,
        "super_admin",
        collegeId,
        "2024-2028",
        true,
        true,
        "approved",
        true,
      ];
    }

    const result = await client.query(insertQuery, insertValues);
    const admin = result.rows[0];

    await client.query("COMMIT");

    console.log("\n✅ Super Admin created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", password);
    console.log("🌐 Access URL: http://localhost:5173/admin");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error creating super admin:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createSuperAdmin();

