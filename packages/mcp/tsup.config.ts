import { defineConfig } from "tsup";
import { resolve } from "node:path";

// defineConfig 为 MCP 生成可直接发布到 npm 的自包含产物。
export default defineConfig({
  entry: ["src/index.ts", "src/stdio.ts"],
  format: ["esm"],
  platform: "node",
  target: "node18",
  outDir: "dist",
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  shims: false,
  noExternal: ["@alertdog/core", "@alertdog/cli"],
  esbuildOptions(options) {
    options.alias = {
      ...(options.alias ?? {}),
      "@alertdog/core": resolve(process.cwd(), "../core/dist/index.js"),
      "@alertdog/cli": resolve(process.cwd(), "../cli/dist/index.js"),
    };
  },
});
