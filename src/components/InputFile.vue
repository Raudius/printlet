<template>
  <div class="form_upload">
    <ui-file accept="application/pdf" @change="loadFile" multiple="false"></ui-file>
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
  props: {
    msg: String
  },
  methods: {
    loadFile: async (event) => {
      const file = event[0].sourceFile;
      const file_bytes = await toBase64(file);
      console.log(file_bytes);

      const pdfDoc = await PDFDocument.load(file_bytes, {ignoreEncryption: true});

      const pdfBytes = await pdfDoc.save()
      download(pdfBytes, "pdf-lib_pdf_page_embedding_example.pdf", "application/pdf");
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.form_upload {
  border: dashed darkgray;
  border-radius: 25px;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
