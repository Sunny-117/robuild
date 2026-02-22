<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary'
  export let disabled: boolean = false
</script>

<button
  class="btn btn-{variant}"
  {disabled}
  on:click
>
  <slot />
</button>

<style>
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .btn-primary {
    background-color: #ff3e00;
    color: white;
  }

  .btn-secondary {
    background-color: #f0f0f0;
    color: #333;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
