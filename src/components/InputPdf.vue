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
                @change="updateForm"
                :items="[
                  {
                    icon: 'crop_portrait',
                    text: 'Portrait'
                  },
                  {
                    icon: 'crop_landscape',
                    text: 'Landscape'
                  }
                ]"
                single-select
            />
          </span>
    </ui-form-field>
  </div>
</template>

<script>
import {loadPdfFile, Orientation} from "@/printlet";

export default {
  name: "InputPdf",
  data() {
    return {
      pdf_orientation_manual: Orientation.UNKNOWN,
      pdf_file: null,
    }
  },
  emits: {
    'updated': null
  },
  methods: {
    async loadFile (event) {
      const file = event[0].sourceFile;
      this.pdf_file = await loadPdfFile(file);

      this.updateForm();
    },
    updateForm() {
      this.$emit('updated', this.pdfData)
    }
  },
  computed: {
    fileName() {
      return this.pdf_file?.file_name;
    },
    isPdfOrientationAmbiguous() {
      return this.pdf_file?.document !== null && this.pdf_file?.orientation < 0;
    },
    pdfOrientation() {
      return this.pdf_file.orientation >= 0 ? this.pdf_file.orientation : this.pdf_orientation_manual;
    },
    pdfData() {
      return {
        file: this.pdf_file,
        orientation: this.pdfOrientation
      }
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