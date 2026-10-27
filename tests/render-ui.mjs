import { registerHooks, createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, dirname, extname } from "node:path";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const nextModules = new Map(["next/link", "next/navigation"].map(specifier => [specifier, pathToFileURL(require.resolve(specifier)).href]));

// Render real components in Node without bundling. CSS has no behavior under test.
registerHooks({
  resolve(specifier, context, nextResolve) {
    let path;
    if (specifier.startsWith("@/")) path = resolve(root, "src", specifier.slice(2));
    else if (specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root).href)) {
      path = resolve(dirname(fileURLToPath(context.parentURL)), specifier);
    }
    if (path) {
      const found = [path, `${path}.ts`, `${path}.tsx`, `${path}/index.ts`].find(candidate => existsSync(candidate) && extname(candidate));
      if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
    }
    if (nextModules.has(specifier)) return { url: nextModules.get(specifier), shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.startsWith(pathToFileURL(root).href) || url.includes("/node_modules/")) return nextLoad(url, context);
    if (url.endsWith(".css")) return { format: "module", source: "export default {};", shortCircuit: true };
    if (url.endsWith(".json")) {
      return { format: "module", source: `export default ${readFileSync(new URL(url), "utf8")};`, shortCircuit: true };
    }
    if (/\.tsx?$/.test(url)) {
      const result = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
        fileName: fileURLToPath(url),
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      });
      return { format: "module", source: result.outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
