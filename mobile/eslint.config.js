// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // Expo's packages resolve through package exports, but the legacy
      // eslint-import resolver reports these valid native imports as missing.
      'import/no-unresolved': 'off',
      // These rules currently flag supported React Native patterns: updating
      // state after an async effect and reading Animated.Value refs in styles.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
    },
  },
]);
