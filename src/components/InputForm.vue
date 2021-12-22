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

    <br/>

    <div v-if="isPdfOrientationAmbiguous">
      <ui-alert class="no_top_margin" state="warning" closable>Looks like this document contains both landscape and portrait pages.</ui-alert>
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


    <h2>2. Settings</h2>
    <ui-form nowrap item-margin-bottom="16">
        <ui-form-field>
          <label>Booklet orientation:</label>
          <span>
            <ui-segmented-buttons
                v-model="booklet_orientation"
                :items="booklet_orientations"
                single-select
            />
            <br/>
            {{bookletTypeTooltip}}
          </span>
        </ui-form-field>

        <ui-form-field>
          <label>Rotate even pages 180°:</label>
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
    <ui-button raised icon="download_for_offline" @click="submitForm">
      Download
    </ui-button>
  </div>

  <div>
    {{this.pdf_orientation_manual}}
  </div>
</template>

<script>
import {PDFDocument} from "pdf-lib";
import download from "downloadjs"

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

const booklet_orientations = [
  {
    icon: 'border_vertical',
    text: 'Vertical fold'
  },
  {
    icon: 'border_horizontal',
    text: 'Horizontal fold'
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

  return (landscape || rotated) && !(landscape && rotated)
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
  name: 'InputForm',
  data() {
    return {
      booklet_orientations,
      pdf_orientations,
      rotate_even_pages: true,
      ignore_pages: '',
      pdf_base64: '',
      booklet_orientation: -1,
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
    fileName() {
      return this.file_name;
    },
    bookletTypeTooltip() {
      if (this.booklet_orientation < 0 || this.pdf_orientation < 0) {
        return "";
      }
      const pages = this.booklet_orientation === this.pdf_orientation ? 2 : 4;
      return "Each booklet page will contain " + pages + " PDF pages.";
    },
    isPdfOrientationAmbiguous() {
      return this.pdf_document !== null && this.pdf_orientation < 0;
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

label {
  width: 200px;
}

</style>
