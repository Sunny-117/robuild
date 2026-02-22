<script lang="ts">
  export const title: string = ''
  const className: string = ''
  export { className as class }
</script>

<div class="card {className}">
  {#if title}
    <div class="card-header">{title}</div>
  {/if}
  <div class="card-body">
    <slot />
  </div>
</div>

<style>
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }

  .card-header {
    padding: 12px 16px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    font-weight: 600;
  }

  .card-body {
    padding: 16px;
  }
</style>
