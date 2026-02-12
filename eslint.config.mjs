import antfu from '@antfu/eslint-config'

export default antfu(
  {
    rules: {
      'no-lone-blocks': 'off',
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'no-console': 'off',
    },
    ignores: ['docs', 'dist/**', 'bundler-benchmark'],
  },

  // 👇 单独给 src 加规则
  {
    files: ['src/**/*.{js,ts,jsx,tsx}'],
    rules: {
      'no-console': 'warn',
    },
  },
)
