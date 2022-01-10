<template>
  <ui-form nowrap item-margin-bottom="16">
    <ui-form-field>
      <label>
        Booklet type:
        <ui-icon
          v-tooltip="'Fit 2 input pages per booklet page by selecting the \'double page\' option.'"
          :size="18"
          aria-describedby="tooltip_booklet_type">info</ui-icon>
      </label>
      <span>
        <ui-segmented-buttons
            :model-value="this.options.pages_per_page-1"
            @update:modelValue="updatePagesPerPage"
            single-select
            :items="[
              { text: 'Single page', icon: 'rectangle' },
              { text: 'Double page', icon: 'view_agenda' }
            ]"
        />
      </span>
    </ui-form-field>

  </ui-form>

  <ui-collapse with-icon ripple>
    <template #toggle>
      <div>Advanced options</div>
    </template>
    <ui-form nowrap item-margin-bottom="16">
      <ui-form-field>
        <label>Text read direction:</label>
        <span>
            <ui-segmented-buttons
                v-model="options.text_read_direction"
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
        <label>Print page size:</label>
        <span>
        <ui-select
            v-model="options.page_size"
            :options="PageSizeOptions"
            @change="updated"
        ></ui-select>
      </span>
      </ui-form-field>

      <ui-form-field>
        <label>
          Create multiple booklets:
          <ui-icon
              v-tooltip="'For large PDF files it is often easier to create multiple smaller booklets.'"
              :size="18"
              aria-describedby="tooltip_multiple_booklets">info</ui-icon>
        </label>
        <ui-switch
            v-model="options.multiple_booklets"
            @change="updated"
            input-id="input_booklet_size"
            :true-value="4"
            :false-value="0"
        />
      </ui-form-field>

      <ui-form-field v-if="options.multiple_booklets">
        <label>Sheets per booklet:</label>
        <ui-textfield input-type="number" v-model="options.booklet_size"></ui-textfield>
      </ui-form-field>

      <ui-form-field>
        <label>
          Rotate alternate pages 180°:
          <ui-icon
              v-tooltip="'Some printers may flip the back of a double-sided print. You can correct this behaviour by ticking this option.'"
              :size="18"
              aria-describedby="tooltip_rotate_pages">info</ui-icon>
        </label>
        <ui-switch v-model="options.rotate_even_pages" @change="updated" />
      </ui-form-field>

      <ui-form-field>
        <label>Output format:</label>
        <ui-select
            v-model="this.options.output_format"
            @change="updated"
            :options="OutputFormatOptions"
        />
      </ui-form-field>
    </ui-form>
  </ui-collapse>
</template>

<script>
import {loadBookletOptions, OutputFormats} from "@/printlet";
import {PageSizes} from "pdf-lib";
import {vTooltip} from "balm-ui";

const PageSizeOptions = Object.keys(PageSizes).map((key) => {
  return { label: key, value: key }
});

const OutputFormatOptions = [
  { label: "Single PDF file", value: OutputFormats.PDF },
  { label: "Zipped PDF files", value: OutputFormats.ZIP }
]

export default {
  name: "InputOptions",
  data() {
    return {
      PageSizeOptions,
      OutputFormatOptions,
      options: loadBookletOptions(),
      multiple_booklets: false
    }
  },
  emits: {
    'updated': null
  },
  methods: {
    updated() {
      this.$emit('updated', this.options);
    },
    updatePagesPerPage(value) {
      this.options.pages_per_page = value + 1;
      this.updated();
    }
  },
  mounted() {
    this.updated();
  },
  directives: {
    'tooltip': vTooltip
  }
}
</script>

<style scoped>
</style>