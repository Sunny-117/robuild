<script setup lang="ts">
import type { Chart } from 'chart.js'
import type { BenchmarkResults } from '~/composables/useBenchmarkData'
import { onMounted, ref } from 'vue'
import {

  useBenchmarkResults,
} from '~/composables/useBenchmarkData'

const benchmarkResults = ref<BenchmarkResults | null>(null)

interface Option {
  // biome-ignore lint/suspicious/noExplicitAny: Using any for flexibility in value types
  value: any
  label: string
  disabled?: boolean
}
const featureList: Option[] = [
  { value: 'default', label: 'Default' },
  { value: 'cjs', label: 'CommonJS' },
  { value: 'minify', label: 'Minification' },
  { value: 'sourcemap', label: 'Source Maps' },
  { value: 'dts', label: 'DTS' },
]
// biome-ignore lint/style/noNonNullAssertion: non-null
const selectedFeature = ref(featureList[0]!.value)

// Execution time bar chart
const executionTimeCanva = ref<HTMLCanvasElement | null>(null)
let executionTimeChart: Chart | null = null

onMounted(async () => {
  // Get benchmark results
  benchmarkResults.value = await useBenchmarkResults()

  // Render charts
  if (executionTimeCanva.value) {
    executionTimeChart = renderBarChart({
      canvas: executionTimeCanva.value,
      data: benchmarkResults.value,
      feature: 'default',
      measurement: 'executionTime',
    })
  }
})

watch(
  selectedFeature,
  (newFeature) => {
    if (!benchmarkResults.value)
      return

    // Update charts
    if (executionTimeChart) {
      updateBarChart({
        chart: executionTimeChart,
        data: benchmarkResults.value,
        feature: newFeature,
        measurement: 'executionTime',
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <main class="dark-mode">
    <h1>TS Bundler Benchmark</h1>
    <p>
      This benchmark compares the performance of popular TypeScript bundlers
      when bundling a thousand
      <Tooltip>
        <template #trigger>
          <span style="border-bottom: 1px dashed #ee711e; cursor: pointer;">functions</span>
        </template>
        <template #content>
          <p>This is the typical function used in the benchmark:</p>
          <NuxtImg src="/ts-function.png" alt="Example TypeScript function" width="600" />
        </template>
      </Tooltip> :
    </p>
    <ul>
      <li>
        <a href="https://github.com/Sunny-117/robuild" target="_blank">robuild</a> - Zero-config ESM/TS package builder powered by oxc and rolldown
      </li>
      <li>
        <a href="https://github.com/unjs/unbuild" target="_blank">unbuild</a>
      </li>
      <li><a href="https://tsup.egoist.dev/" target="_blank">tsup</a></li>
      <li>
        <a href="https://tsdown.dev/" target="_blank">tsdown</a> (both with oxc
        and tsc)
      </li>
      <li><a href="https://lib.rsbuild.dev/" target="_blank">rslib</a></li>
      <li><a href="https://bunup.dev/" target="_blank">bunup</a></li>
    </ul>
    <p>
      Benchmark was run on a MacBook M1 Max with 32GB of RAM, using Node.js
      v24.11.1 and Bun v1.3.0 (for bunup).
      <br>
      Source code for the benchmark is available on
      <a
        href="https://github.com/gugustinette/bundler-benchmark"
        target="_blank"
      >GitHub</a>.
    </p>

    <p>
      You can visualize the results by selecting a specific feature from the
      dropdown below. The charts will update to show execution time for the selected feature across different bundlers.
    </p>
    <Select
      v-model="selectedFeature"
      :options="featureList"
      placeholder="Select a feature to visualize"
      aria-label="Feature selection"
    />

    <!-- Execution time -->
    <h2>Execution time (less is better)</h2>
    <div class="chart-container">
      <canvas ref="executionTimeCanva" />
    </div>
  </main>
</template>

<style>
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 1rem;
  max-width: 800px;
  margin: 0 2rem;
}
.chart-container {
  position: relative;
  height: 40vh;
  width: 90%;
  max-width: 800px;
}
</style>
