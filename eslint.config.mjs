import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended"
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      react,
      prettier,
      import: importPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
        },
      ],
      "no-unused-vars": "warn",
      "no-console": "off",
      "react/react-in-jsx-scope": "off",
      "import/order": [
        // import 순서 정렬 규칙 추가
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          // Node.js 기본모듈, 외부 라이브러리, 프로젝트 내부 경로, 상대 경로 기준의 모듈
          pathGroups: [
            // 특정 패키지(react) 위치 정의
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          // 그룹 간 줄바꿈 여부
          alphabetize: {
            // 알파벳 순서 오름차순 정렬
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    // webpack.config.js에 대한 별도 설정
    files: ["webpack.config.js"],

    languageOptions: {
      globals: {
        ...globals.node, // Node.js 전역 변수 허용
      },

      ecmaVersion: "latest",
      sourceType: "commonjs", // CommonJS 모듈 스타일
    },

    rules: {
      "@typescript-eslint/no-require-imports": "off", // require() 허용
      "no-unused-vars": "warn", // 사용하지 않는 변수 경고
      "@typescript-eslint/no-unused-vars": "warn", // TypeScript에서도 경고
    },
  },
  {
    files: ["**/.eslintrc.{js,cjs}"],

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 5,
      sourceType: "commonjs",
    },
  },
];
