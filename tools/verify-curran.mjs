// Reconciliation check for the Joe Curran Electrical demo data. Run: node tools/verify-curran.mjs
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
const out = join(tmpdir(), "curran-verify.mjs");
await build({ entryPoints: ["tools/verify-entry.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error" });
await import(pathToFileURL(out).href);
