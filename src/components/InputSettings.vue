<template>
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
            {{ bookletTypeTip }}
          </span>
    </ui-form-field>

    <ui-form-field>
      <label>Rotate alternate pages 180°:</label>
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
</template>

<script>
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

export default {
  name: "InputSettings",
  data() {
    return {
      booklet_orientations,
      rotate_even_pages: true,
      ignore_pages: '',
      booklet_orientation: -1,
      pdf_orientation: -1,
      pdf_orientation_manual: -1,
      pdf_document: null,
      file_name: null
    }
  },
  computed: {
    fileName() {
      return this.file_name;
    },
    bookletTypeTip() {
      if (this.booklet_orientation < 0 || this.pdf_orientation < 0) {
        return "";
      }
      const pages = this.booklet_orientation === this.pdf_orientation ? 2 : 4;
      return "Each booklet page will contain " + pages + " PDF pages.";
    }
  }
}
</script>

<style scoped>

</style>