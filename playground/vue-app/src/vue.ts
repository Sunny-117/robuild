import { defineComponent, ref } from 'vue'
import MyButton from './components/MyButton.vue'

export { MyButton }

export const Counter = defineComponent({
  name: 'Counter',
  setup() {
    const count = ref(0)
    
    const increment = () => {
      count.value++
    }
    
    return {
      count,
      increment
    }
  },
  template: `
    <div>
      <p>Count: {{ count }}</p>
      <MyButton @click="increment">Increment</MyButton>
    </div>
  `
})

export const version = '1.0.0'
