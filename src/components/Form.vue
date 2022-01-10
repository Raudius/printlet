<template>
  <div class="form">
    <h1>Printlet</h1>
    <p>Create printable booklets from your browser!</p>
    <p>For questions and feature requests open an issue on <a href="http://github.com/Raudius/printlet/issues">Github</a></p>
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
import {Orientation, OutputFormats} from "@/printlet";
import {createBooklets, createBookletsSinglePdf} from "@/booklet_maker";
import {createZip} from "@/file_utils";

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
      if (!this.pdf_file || this.pdf_file.orientation === Orientation.UNKNOWN) {
        alert('PDF file is missing!');
        return;
      }

      const output_name = this.pdf_file.getBaseName() + '_booklet';

      if (this.booklet_options.output_format === OutputFormats.ZIP) {
        const booklet_pdfs = await createBooklets(this.pdf_file, this.booklet_options);
        const file = await createZip(this.pdf_file.getBaseName(), booklet_pdfs);

        download(file, output_name + '.zip', 'application/zip');
      } else {
        const file = await createBookletsSinglePdf(this.pdf_file, this.booklet_options);

        download(file, output_name + '.pdf', 'application/pdf');
      }
      this.booklet_options.save();
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

h1 {
  text-align: left;
}
</style>
