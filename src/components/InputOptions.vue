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
  </ui-form>
</template>

<script>

import {BookletOptions} from "@/printlet";

export default {
  name: "InputOptions",
  data() {
    return {
      page_turn_direction: 0,
      rotate_even_pages: true,
      booklet_orientation: -1
    }
  },
  emits: {
    'updated': null
  },
  methods: {
    updated() {
      this.$emit('updated', this.bookletOptions);
    }
  },
  computed: {
    bookletOptions() {
      return new BookletOptions(this.page_turn_direction, this.booklet_orientation, this.rotate_even_pages);
    }
  }
}
</script>

<style scoped>

</style>