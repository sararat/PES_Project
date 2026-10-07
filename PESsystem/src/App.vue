<script setup>
import navbar from "../src/frontend/views/navbar.vue"
</script>

<template>
  <div id="app">
    <navbar />

    <main class="pt-16">
      <router-view />
    </main>
  </div>
</template>
 
