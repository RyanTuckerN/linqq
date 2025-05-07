import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: false,
  dts: true,
  clean: true,
  minify: true,
  keepNames: true,
  target: "es2020",
});
