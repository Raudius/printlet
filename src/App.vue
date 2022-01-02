<template id="app">
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

<style lang="scss">

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
  width: 240px !important;
  padding: 0 !important;
}

@keyframes tooltip_background {
  0%   {background-color: rgba(0,0,0,0);}
  100% {background-color: rgba(0,0,0,0.5);}
}

.mdc-tooltip--shown{
  background-color: rgba(0,0,0,0.5);
  animation-name: tooltip_background;
  animation-duration: 1s;
}

</style>
