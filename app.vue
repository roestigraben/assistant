<template>
  <div>
   <h1>Hi Peter</h1>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const Authorization =  `Bearer ${config.OPENAI_API_KEY}`
console.log(Authorization)
</script>
