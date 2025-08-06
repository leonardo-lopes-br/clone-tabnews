import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  const httpMethod = request.method;
  if (!allowedMethods.includes(httpMethod)) {
    return response.status(405).json({
      error: `Method "${request.method}" is not allowed`,
    });
  }
  let databaseClient = null;
  try {
    databaseClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient: databaseClient,
      dir: join("infra", "migrations"),
      direction: "up",
      dryRun: true,
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (httpMethod === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }
    if (httpMethod === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      const migratedMigrationsHaveRun = migratedMigrations.length > 0;
      if (migratedMigrationsHaveRun) {
        return response.status(201).json(migratedMigrations);
      }
      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await databaseClient?.end();
  }
}
