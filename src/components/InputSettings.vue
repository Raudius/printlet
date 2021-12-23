<template>
  <ui-form nowrap item-margin-bottom="16">
    <ui-form-field>
      <label>Booklet orientation:</label>
      <span>
            <ui-segmented-buttons
                v-model="booklet_orientation"
                @change="updated"
                :items="booklet_orientations"
                single-select
            />
          </span>
    </ui-form-field>

    <ui-form-field>
      <label>Rotate alternate pages 180°:</label>
      <ui-switch
          v-model="rotate_even_pages"
          @change="updated"
          input-id="basic-switch-custom"
          class="demo-switch--custom"
      />

    </ui-form-field>

    <ui-form-field>
      <label>Ignore pages:</label>
      <ui-textfield v-model="ignore_pages" @change="updated"></ui-textfield>
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
      pdf_document: null,
      file_name: null
    }
  },
  emits: {
    'updated': null
  },
  methods: {
    updated() {
      this.$emit('updated', this.bookletSettings);
    }
  },
  computed: {
    fileName() {
      return this.file_name;
    },
    bookletSettings() {
      return {...this.$data};
    }
  }
}
</script>

<style scoped>

</style>