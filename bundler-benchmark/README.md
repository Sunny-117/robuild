# bundler-benchmark

Benchmark some popular TS bundlers:

- [robuild](https://github.com/Sunny-117/robuild) - Zero-config ESM/TS package builder powered by oxc and rolldown
- [tsdown](https://tsdown.dev/)
- [tsup](https://tsup.egoist.dev/)
- [unbuild](https://github.com/unjs/unbuild)
- [rslib](https://lib.rsbuild.dev/)
- [bunup](https://bunup.dev/)

Results are available at [gugustinette.github.io/bundler-benchmark](https://gugustinette.github.io/bundler-benchmark/).

### Development

- Install dependencies

```bash
npm install
```

- Generate the benchmark data

```bash
npm run generate
```

- Build the benchmark code

```bash
npm run build
```

- Run the benchmark

```bash
npm run benchmark
```
