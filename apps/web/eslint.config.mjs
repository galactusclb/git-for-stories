import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import importX from 'eslint-plugin-import-x';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  {
    plugins: { 
      boundaries,
      "import-x": importX
    },
    settings: {
      "boundaries/elements": [
        {
          type: "feature",
          pattern: "src/features/!(views)/*",
          mode: "folder",
          capture: ["elementName"], 
        },
        {
          type: "views",
          pattern: "src/features/views/*/*",
          mode: "folder",
          capture: ["viewGroup", "elementName"],
        },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error", 
        {
          // disallow all cross-element imports by default
          default: "disallow",
          // checkInternals: false,
          rules: [
            {
              // ✅ features can import their local files
              from: { type: "feature" },
              allow: {
                to: { type: "feature", captured: { elementName: "{{ elementName }}" } },
              },
            },
            {
              // ✅ views can import their local files
              from: { type: "views" },
              allow: {
                to: { type: "views", captured: { viewGroup: "{{ viewGroup }}" } },
              },
            },
            {
              // ✅ features can import other features (via barrel only)
              from: { type: "feature" },
              allow: {
                to: { type: "feature", internalPath: [null, "index.server"] },
              },
            },
            {
              // ✅ views can import features (via barrel only)
              from: { type: "views" },
              allow: {
                to: { type: "feature", internalPath: [null, "index.server"] },
              },
            },
          ]
        }
      ],
      "no-restricted-imports": ["error", {
        patterns: [
          {
            // block deep feature imports from anywhere
            group: ["@/features/*/**", "!@/features/views/**", "!@/features/*/index.server"],
            message: "Use the feature entry-point (barrel import) (@/features/<name>) instead of deep imports.",
          },
          {
            // block deep view imports from anywhere
            group: ["@/features/views/*/*/**", "!@/features/views/*/*/index.server"],
            message: "Use the view entry-point (@/features/views/<group>/<name>) instead of deep imports.",
          },
        ]
      }],
      "import-x/order": ["warn", 
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "after" }
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
