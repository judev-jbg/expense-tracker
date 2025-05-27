module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "18.2",
    },
  },
  plugins: ["react-refresh"],
  rules: {
    // React specific rules
    "react/prop-types": "off", // We're not using PropTypes
    "react/react-in-jsx-scope": "off", // React 17+ doesn't require React import
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],

    // General JavaScript/TypeScript rules
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error",

    // React Hooks rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Code style rules
    indent: ["error", 2, { SwitchCase: 1 }],
    quotes: ["error", "single", { avoidEscape: true }],
    semi: ["error", "never"],
    "comma-dangle": ["error", "never"],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "max-len": ["warn", { code: 100, ignoreUrls: true, ignoreStrings: true }],

    // Import rules
    "no-duplicate-imports": "error",

    // Accessibility rules
    "jsx-a11y/alt-text": "warn",
  },
  overrides: [
    {
      files: ["**/*.jsx", "**/*.tsx"],
      rules: {
        // JSX specific rules
        "react/jsx-indent": ["error", 2],
        "react/jsx-indent-props": ["error", 2],
        "react/jsx-closing-bracket-location": "error",
        "react/jsx-closing-tag-location": "error",
        "react/jsx-curly-spacing": ["error", "never"],
        "react/jsx-equals-spacing": ["error", "never"],
        "react/jsx-first-prop-new-line": ["error", "multiline-multiprop"],
        "react/jsx-max-props-per-line": [
          "error",
          { maximum: 1, when: "multiline" },
        ],
        "react/jsx-no-duplicate-props": "error",
        "react/jsx-no-undef": "error",
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
      },
    },
  ],
};
