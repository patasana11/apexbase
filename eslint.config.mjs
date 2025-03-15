import { readESLintConfig } from "@eslint/eslintrc";
import nextPlugin from "eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/*", ".next/*", "node_modules/*"],
  },
  {
    plugins: {
      next: nextPlugin,
      react: reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      // Disable typescript no-explicit-any rule
      "@typescript-eslint/no-explicit-any": "off",

      // Disable react-hooks exhaustive-deps rule
      "react-hooks/exhaustive-deps": "off",

      // Disable prefer-const
      "prefer-const": "off",

      // Include recommended rules but with lower severity
      "no-unused-vars": "warn",

      // Next.js specific rules (optional)
      "next/no-html-link-for-pages": "off",
    },
  },
  ...tseslint.configs.recommended,
];
