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
      console.log("   You can login with this account.");
      await client.query("ROLLBACK");
      return;
    }

    // Hash password
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check what columns exist in User table
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY column_name
    `);

    const columnNames = columns.rows.map((r) => r.column_name);
    console.log("📋 Available columns:", columnNames.join(", "));

    // Build insert query based on available columns
    const baseFields = {
      name: "Super Admin",
      email: "admin@connectx.com",
      phone: "+1234567890",
      password: hashedPassword,
      role: "super_admin",
      collegeId: collegeId,
      batch: "2024-2028",
    };

    // Add optional fields if they exist
    if (columnNames.includes("username")) {
      baseFields.username = "superadmin";
    }
    if (columnNames.includes("emailVerified")) {
      baseFields.emailVerified = true;
    }
    if (columnNames.includes("phoneVerified")) {
      baseFields.phoneVerified = true;
    }
    if (columnNames.includes("verifiedStatus")) {
      baseFields.verifiedStatus = "approved";
    }
    if (columnNames.includes("bypassVerified")) {
      baseFields.bypassVerified = true;
    }

    // Generate a simple ID (cuid-like)
    const generateId = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 15);
      return `c${timestamp}${random}`.substring(0, 25);
    };

    baseFields.id = generateId();

    // Build SQL query
    const fields = Object.keys(baseFields);
    const values = Object.values(baseFields);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    const fieldNames = fields.map((f) => `"${f}"`).join(", ");

    const insertQuery = `
      INSERT INTO "User" (${fieldNames}, "createdAt")
      VALUES (${placeholders}, NOW())
      RETURNING id, name, email, role
    `;

    const result = await client.query(insertQuery, values);
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
    if (error.detail) {
      console.error("   Detail:", error.detail);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createSuperAdmin();

