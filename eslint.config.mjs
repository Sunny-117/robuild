import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-lone-blocks': 'off', // 忽略“嵌套块是多余的”错误
    'node/prefer-global/process': 'off',
    'node/prefer-global/buffer': 'off',
    'no-console': 'off',
  },
  ignores: ['docs', 'dist/**'],
})
