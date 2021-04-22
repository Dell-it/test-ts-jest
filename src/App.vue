<template>
  <div id="app">
    <search-input v-model.trim="search" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import SearchInput from "@/components/SearchInput/index.vue";

export default Vue.extend({
  name: "App",

  components: {
    SearchInput,
  },

  data() {
    return {
      search: "" as string,
    };
  },
});
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  background: #e5e5e5;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
