import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatValidationReport, validateRolesFile } from "./role-data-validation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rolesPath = join(__dirname, "..", "src", "data", "roles.js");

try {
  const result = await validateRolesFile(rolesPath);
  console.log(formatValidationReport(result));
  if (result.errors.length) process.exitCode = 1;
} catch (error) {
  console.error(`ERROR [module-load]: ${error.message}`);
  process.exitCode = 1;
}
