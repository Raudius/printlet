<template>
  <ui-form nowrap item-margin-bottom="16">
    <ui-form-field>
      <label>Booklet orientation:</label>
      <span>
            <ui-segmented-buttons
                v-model="options.orientation"
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
                v-model="options.page_turn_direction"
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
          v-model="options.rotate_even_pages"
          @change="updated"
          input-id="basic-switch-custom"
          class="demo-switch--custom"
      />
    </ui-form-field>
  </ui-form>
</template>

<script>

import {BookletOptions} from "@/printlet";

export default {
  name: "InputOptions",
  data() {
    return {
      options: new BookletOptions(1,0,true)
    }
  },
  emits: {
    'updated': null
  },
  methods: {
    updated() {
      this.$emit('updated', this.options);
    }
  },
  mounted() {
    this.updated();
  }
}
</script>

<style scoped>

</style>