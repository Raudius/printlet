<template>
  <div class="upload_container">
    <div>
      <ui-file accept="application/pdf" @change="loadFile"></ui-file>
      <div v-if="fileName" class="upload_container_file_name">
        {{fileName}}
      </div>
    </div>
  </div>

  <br/>

  <div v-if="isPdfOrientationAmbiguous">
    <ui-alert class="no_top_margin" state="warning">
      Looks like this document contains both landscape and portrait pages.
    </ui-alert>
    <ui-form-field>
      <label class="min_width_m">Select orientation:</label>
      <span>
            <ui-segmented-buttons
                v-model="pdf_orientation_manual"
                :items="pdf_orientations"
                single-select
            />
          </span>
    </ui-form-field>
  </div>
</template>

<script>
import download from "downloadjs";
import {PDFDocument} from "pdf-lib";

const ORIENTATION_PORTRAIT = 0;
const ORIENTATION_LANDSCAPE = 1;

const pdf_orientations = [
  {
    icon: 'crop_portrait',
    text: 'Portrait'
  },
  {
    icon: 'crop_landscape',
    text: 'Landscape'
  }
];

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const detectPageOrientation = (page) => {
  const { width, height } = page.getSize()
  const rotated = (page.getRotation().angle / 90) % 2 !== 0;
  const landscape = width > height;

  return (landscape && !rotated) || (!landscape && rotated)
      ? ORIENTATION_LANDSCAPE
      : ORIENTATION_PORTRAIT;
}

const detectPdfOrientation = (pdf_document) => {
  const pages = pdf_document.getPages();

  let orientation = detectPageOrientation(pages[0]);
  for (let i=0; i<pages.length; i++) {
    const page = pages[i];
    const page_orientation = detectPageOrientation(page)

    if (orientation !== page_orientation) {
      return -1; // undefined page orientation.
    }
  }
  return orientation;
}

export default {
  name: "InputPdf",
  data() {
    return {
      pdf_orientations,
      pdf_orientation: -1,
      pdf_orientation_manual: -1,
      pdf_document: null,
      file_name: null
    }
  },
  methods: {
    async loadFile (event) {
      const file = event[0].sourceFile;
      this.file_name = file.name;
      this.pdf_document = await PDFDocument.load(await toBase64(file));
      this.pdf_orientation = detectPdfOrientation(this.pdf_document);
    },
    async submitForm () {
      const pdf = this.pdf_document.save();
      download(pdf, 'test.pdf', 'application/pdf');
    }
  },
  computed: {
    isPdfOrientationAmbiguous() {
      return this.pdf_document !== null && this.pdf_orientation < 0;
    }
  }
}
</script>

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

.upload_container_file_name {
  margin-top: 10px;
}

</style>