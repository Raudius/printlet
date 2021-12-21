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
    <div class="upload_container">
      <div>
        <ui-file accept="application/pdf" @change="loadFile"></ui-file>
        <div v-if="fileName" class="upload_container_file_name">
          {{fileName}}
        </div>
      </div>
    </div>

    <h2>2. Settings</h2>
    <ui-form nowrap item-margin-bottom="16" label-width="200">
        <ui-form-field>
          <label>
            Rotate even pages 180°:
          </label>
          <ui-switch
              v-model="rotate_even_pages"
              input-id="basic-switch-custom"
              class="demo-switch--custom"
              @selected="balmUI.onChange('toggle2Label', $event)"
          />

        </ui-form-field>

        <ui-form-field>
          <label>Ignore pages:</label>
          <ui-textfield v-model="ignore_pages"></ui-textfield>
        </ui-form-field>
    </ui-form>

    <h2>3. Download booklet</h2>
    <ui-button raised icon="download_for_offline">
      Download
    </ui-button>
  </div>
</template>

<script>
import {PDFDocument} from "pdf-lib";
import download from "downloadjs"

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});


export default {
  name: 'InputForm',
  data() {
    return {
      rotate_even_pages: true,
      pdf_base64: '',
      file: null
    }
  },
  methods: {
    async loadFile (event) {
      const file = event[0].sourceFile;
      this.file = event[0].sourceFile;
      this.pdf_base64 = await toBase64(file);

      const document = await PDFDocument.load(this.pdf_base64);
      const pdf = document.save();
      download(pdf, 'test.pdf', 'application/pdf');
    },
  },
  computed: {
    fileName: function() {
      return this.file?.name;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.upload_container {
  border: dashed darkgray;
  border-radius: 25px;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.printlet_form {
  margin-right: 30%;
  margin-left: 30%;
  text-align: left;
}

.upload_container_file_name {
  margin-top: 10px;
}
</style>
