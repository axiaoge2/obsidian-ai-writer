import esbuild from "esbuild";

const isProd = process.argv[2] === "production";

const buildOptions = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "main.js",
  format: "cjs",
  target: "es2018",
  platform: "browser",
  external: ["obsidian"],
  sourcemap: isProd ? false : "inline",
  minify: isProd,
  treeShaking: true,
  logLevel: "info"
};

if (!isProd) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log("esbuild: watching (dev)");
} else {
  await esbuild.build(buildOptions);
  console.log("esbuild: built (production)");
}

