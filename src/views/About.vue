<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from '../components/HelloWorld.vue'
</script>

<template>
  <HelloWorld msg="About" />
  <p class="text-center">
    <strong>Welcome to the Air Quality Project</strong>
  </p>
  <p class="text-center">Here is how to access the Air Quality Data</p>
  <div class="d-flex justify-content-center">
    <ol class="list-group list-group-numbered w-50">
      <li class="list-group-item">Open dropdown for Air Quality</li>
      <li class="list-group-item">Click on Cities page</li>
      <li class="list-group-item">Check for any cities in database</li>
      <li class="list-group-item">Can added city with 'Find New City' button</li>
      <li
        class="list-group-item"
      >Once there are cities Available in the database go to the air quality page from the dropdowns</li>
      <li
        class="list-group-item"
      >Click the green search button on the city you want the air quality data for</li>
    </ol>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
