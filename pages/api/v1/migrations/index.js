import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import migrator from "models/migrator.js";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();
  const migratedMigrationsHaveRun = migratedMigrations.length > 0;
  const statusCode = migratedMigrationsHaveRun ? 201 : 200;
  return response.status(statusCode).json(migratedMigrations);
}
