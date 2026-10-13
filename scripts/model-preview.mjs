/**
 * Run Next.js with the opt-in stock-model photography preview enabled.
 *
 * Loading the env file via Node's --env-file CLI flag would leak the flag into
 * Next's NODE_OPTIONS worker process and prevent production builds. Loading
 * it programmatically before spawning the Next CLI keeps workers compatible.
 */
import { spawn } from "node:child_process";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

loadEnvFile(fileURLToPath(new URL("../.env.model-preview", import.meta.url)));

const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [nextCli, ...process.argv.slice(2)], {
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
