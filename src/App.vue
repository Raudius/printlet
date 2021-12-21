<template>
  <InputForm></InputForm>
</template>

<script>

import InputForm from "@/components/InputFile";

export default {
  name: 'App',
  components: {
    InputForm
  }
}
</script>

<style>
body {
  background-color: #efefef;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
W