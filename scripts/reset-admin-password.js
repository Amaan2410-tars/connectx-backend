require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetAdminPassword() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const email = "admin@connectx.com";
    const newPassword = process.env.ADMIN_PASSWORD || "admin123";

    // Find the admin
    const userResult = await client.query(
      'SELECT id, email FROM "User" WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log("❌ Admin user not found with email:", email);
      await client.query("ROLLBACK");
      return;
    }

    const userId = userResult.rows[0].id;
    console.log("✅ Found admin user:", email, "ID:", userId);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("🔐 Password hashed successfully");

    // Update the password
    await client.query(
      'UPDATE "User" SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    await client.query("COMMIT");

    console.log("\n✅ Admin password reset successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 New Password:", newPassword);
    console.log("\n⚠️  You can now login with these credentials.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error resetting password:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetAdminPassword();


