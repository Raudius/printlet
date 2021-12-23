<template>
  <ui-form nowrap item-margin-bottom="16">
    <ui-form-field>
      <label>Booklet orientation:</label>
      <span>
            <ui-segmented-buttons
                v-model="booklet_orientation"
                @change="updated"
                :items="[
                  {
                    icon: 'border_vertical',
                    text: 'Vertical fold'
                  },
                  {
                    icon: 'border_horizontal',
                    text: 'Horizontal fold'
                  }
                ]"
                single-select
            />
          </span>
    </ui-form-field>

    <ui-form-field>
      <label>Page-turn direction:</label>
      <span>
            <ui-segmented-buttons
                v-model="page_turn_direction"
                @change="updated"
                :items="[
                  {
                    icon: 'east',
                    text: 'Left to right'
                  },
                  {
                    icon: 'west',
                    text: 'Right to left'
                  },
                ]"
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

export default {
  name: "InputSettings",
  data() {
    return {
      page_turn_direction: 0,
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