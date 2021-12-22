<template>
  <Form></Form>
</template>

<script>

import Form from "@/components/Form";

export default {
  name: 'App',
  components: {
    Form
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


label {
  width: 200px !important;
  padding: 0 !important;
}
</style>
