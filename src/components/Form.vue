<template>
  <div class="form">
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
    <InputPdf @updated="setPdfData" />

    <h2>2. Settings</h2>
    <InputSettings @updated="setBookletData" />

    <h2>3. Download booklet</h2>

    <ui-alert v-if="bookletTypeTip" class="no_top_margin" state="info">
      {{ bookletTypeTip }}
    </ui-alert>
    <br/>
    <ui-button raised icon="download_for_offline" @click="submitForm">
      Download
    </ui-button>
  </div>
</template>

<script>
import InputPdf from "@/components/InputPdf";
import InputSettings from "@/components/InputSettings";
import {vTooltip} from "balm-ui";
import download from "downloadjs";

export default {
  name: 'Form',
  components: {InputSettings, InputPdf},
  data() {
    return {
      booklet_data: {},
      pdf_data: {}
    }
  },
  methods: {
    setBookletData(booklet_data) {
      this.booklet_data = booklet_data;
    },
    setPdfData(pdf_data) {
      this.pdf_data = pdf_data;
    },
    async submitForm () {
      const doc = this.pdf_data?.pdf_document;
      if (!doc) {
        alert('No pdf loaded.');
        return;
      }

      const pdf = await doc.save();
      download(pdf, 'test.pdf', 'application/pdf');
    }
  },
  computed: {
    bookletTypeTip() {
      const pdf_orientation = this.pdf_data?.pdf_orientation ?? -1;
      const booklet_orientation = this.booklet_data?.booklet_orientation ?? -1
      if (pdf_orientation < 0 || booklet_orientation < 0) {
        return null;
      }
      const pages = booklet_orientation === pdf_orientation ? 2 : 4;
      return "Each booklet page will contain " + pages + " PDF pages.";
    }
  },
  directives: {
    'tooltip': vTooltip
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@media (orientation: landscape) {
  .form {
    margin-right: 30%;
    margin-left: 30%;
  }
}
.form {
  text-align: left;
}
</style>
