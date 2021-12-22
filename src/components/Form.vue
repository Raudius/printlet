<template>
  <div class="printlet_form">
    <h2>
      1. Load PDF
      <ui-icon
          v-tooltip="'No files are uploaded, all processing is done locally inside the browser!'"
          aria-describedby="tooltip-load-pdf"
          :size="18"
      >
        info
      </ui-icon>
    </h2>
    <InputPdf />

    <h2>2. Settings</h2>
    <InputSettings />

    <h2>3. Download booklet</h2>
    <ui-button raised icon="download_for_offline" @click="submitForm">
      Download
    </ui-button>
  </div>
</template>

<script>
import InputPdf from "@/components/InputPdf";
import InputSettings from "@/components/InputSettings";

export default {
  name: 'Form',
  components: {InputSettings, InputPdf}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.printlet_form {
  margin-right: 30%;
  margin-left: 30%;
  text-align: left;
}
</style>
