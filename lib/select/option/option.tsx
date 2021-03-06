import { defineComponent, ref, toRef } from 'vue';
import { CdkSelectionItem } from '../../cdk/selection';
import { watchRef } from '../../cdk/hook';

export const Option = defineComponent({
  name: 'el-option',
  props: {
    value: {
      type: [String, Number],
      required: true,
    },
    label: {
      type: String,
      default: '',
      required: true,
    },
    created: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  setup(props, ctx) {
    const elDisabled = watchRef(toRef(props, 'disabled'));
    const hover = ref(false);
    const limitReached = ref(false);
    const selectedRef = ref(false);
    return () => (
      <CdkSelectionItem
        label={props.label}
        value={props.value}
        v-model={selectedRef.value}
      >
        <li
          onMouseenter={() => hover.value = true}
          onMouseleave={() => hover.value = false}
          onClick={() => selectedRef.value = true}
          class={['el-select-dropdown__item', {
            'selected': selectedRef.value,
            'is-disabled': elDisabled.value || limitReached.value,
            'hover': hover.value
          }]}
        >
          {ctx.slots.default ? ctx.slots.default?.() : props.label}
        </li>
      </CdkSelectionItem>
    );
  }
});