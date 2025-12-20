/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.tsx",
    dialect: 'postgresql',
    dbCredentials: {
      // Read DB URL from environment so you can push to the correct database.
      // Set DRIZZLE_DB_URL in your .env.local or export it in your shell.
      url: process.env.DRIZZLE_DB_URL || process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
    }
  };
  