/**
 * esbuild configuration for server bundling
 */

const esbuild = require("esbuild");

const isProduction = process.env.NODE_ENV === "production";

const buildOptions = {
  entryPoints: ["src/server.ts"],
  bundle: true,
  outfile: "dist/server.js",
  platform: "node",
  target: "node20",
  format: "cjs",
  sourcemap: !isProduction,
  minify: isProduction,
  metafile: true,
  external: [
    // Prisma needs to be external (generates code at runtime)
    "@prisma/client",
    "prisma",
    // Express and related
    "express",
    "cors",
    "multer",
    "dotenv",
    // Hedera SDK packages (may have native dependencies)
    "@hashgraph/sdk",
    "@hiero-did-sdk/client",
    "@hiero-did-sdk/core",
    "@hiero-did-sdk/crypto",
    "@hiero-did-sdk/registrar",
    "@hiero-did-sdk/resolver",
    // Node.js built-ins
    "fs",
    "path",
    "crypto",
    "http",
    "https",
    "stream",
    "util",
    "events",
    "buffer",
    "url",
    "querystring",
    "os",
    "net",
    "tls",
    "zlib",
    "dns",
    "child_process",
    "cluster",
    "dgram",
    "module",
    "perf_hooks",
    "process",
    "readline",
    "repl",
    "string_decoder",
    "timers",
    "tty",
    "v8",
    "vm",
    "worker_threads",
  ],
  banner: isProduction
    ? undefined
    : {
        js: `require('source-map-support').install();`,
      },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },
};

// Build function
async function build() {
  try {
    console.log("Building server with esbuild...");
    const result = await esbuild.build(buildOptions);
    console.log("✓ Build successful");
    if (result.metafile) {
      const size =
        (result.metafile.outputs["dist/server.js"]?.bytes || 0) / 1024;
      console.log(`  Output: dist/server.js (${size.toFixed(2)} KB)`);
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

// Watch mode
if (process.argv.includes("--watch")) {
  const ctx = esbuild.context(buildOptions);
  ctx.then((context) => {
    context.watch();
    console.log("Watching for changes...");
  });
} else {
  build();
}
