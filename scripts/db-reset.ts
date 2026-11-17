import "dotenv/config";
import { Client } from "pg";

const client = new Client({
 connectionString: process.env.DATABASE_URL,
});

async function reset() {
 console.log("Reseteando base de datos...");

 await client.connect();

 await client.query("DROP SCHEMA public CASCADE");
 await client.query("CREATE SCHEMA public");

 await client.end();

 //

 console.log("Base de datos limpia");
 console.log("Ejecutando migraciones...");

 /*execSync("npx drizzle-kit migrate", {
 stdio: "inherit",
 });*/

 console.log("Base de datos lista");
}

reset().catch((error) => {
 console.error("Error reseteando la base de datos:", error);
 process.exit(1);
});
