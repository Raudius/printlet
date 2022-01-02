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
    <InputPdf @updated="setPdfFile" />

    <h2>2. Settings</h2>
    <InputOptions @updated="setBookletOptions" />

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
import InputOptions from "@/components/InputOptions";
import {vTooltip} from "balm-ui";
import download from "downloadjs";
import {createZip, Orientation} from "@/printlet";
import {createBooklets} from "@/booklet_maker";

export default {
  name: 'Form',
  components: {InputOptions, InputPdf},
  data() {
    return {
      booklet_options: null,
      pdf_file: null
    }
  },
  methods: {
    setBookletOptions(booklet_data) {
      this.booklet_options = booklet_data;
    },
    setPdfFile(pdf_data) {
      this.pdf_file = pdf_data;
    },
    async submitForm () {
      if (!this.pdf_file || !this.booklet_options) {
        alert('Missing pdf or booklet options.');
        return;
      }

      const pdfs = await createBooklets(this.pdf_file, this.booklet_options);
      if (pdfs.length === 1) {
        download(pdfs[0], 'test.pdf', 'application/pdf');
      } else {
        const zip = await createZip(pdfs);
        download(zip, 'test.zip', 'application/zip');
      }
    }
  },
  computed: {
    bookletTypeTip() {
      const pdf_orientation = this.pdf_file?.getOrientation() ?? Orientation.UNKNOWN;
      const booklet_orientation = this.booklet_options?.orientation ?? Orientation.UNKNOWN;
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
