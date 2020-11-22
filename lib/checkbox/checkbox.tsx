import { vmodelRef } from '@/cdk/hook';
import { Enum, renderCondition } from '@/cdk/utils';
import { ElSize } from '@/types';
import { computed, defineComponent, ref, toRef } from 'vue';

export const Checkbox = defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    size: {
      type: Enum<ElSize>(),
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    name: String,
    label: {
      type: String,
      default: ''
    },
    trueLabel: [String, Number],
    falseLabel: [String, Number]
  },
  setup(props, ctx) {
    const modelRef = vmodelRef(toRef(props, 'modelValue'), (value) => {
      ctx.emit('update:modelValue', value);
    });

    const activeStyle = computed(() => {
      return {};
    });


    const focus = ref(false);
    const handleChange = () => {

    };

    const handleBlur = () => {
      focus.value = false;
    };

    const handleFocus = () => {
      focus.value = true;
    };

    return () => (
      <label
        class={['el-checkbox-button',
          props.size ? 'el-checkbox-button--' + props.size : '',
          { 'is-disabled': props.disabled },
          { 'is-checked': props.modelValue },
          { 'is-focus': focus },
        ]}
        role="checkbox"
        aria-checked={props.modelValue}
        aria-disabled={props.disabled}
      >
        {renderCondition(
          props.trueLabel || props.falseLabel,
          <input
            class="el-checkbox-button__original"
            type="checkbox"
            name={props.name}
            disabled={props.disabled}
            true-value={props.trueLabel}
            false-value={props.falseLabel}
            v-model={modelRef.value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />,
          <input
            v-else
            class="el-checkbox-button__original"
            type="checkbox"
            name={props.name}
            disabled={props.disabled}
            value={props.label}
            v-model={modelRef.value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}
        {renderCondition(
          ctx.slots.default || props.label,
          <span
            class="el-checkbox-button__inner"
            style={modelRef.value ? activeStyle.value : undefined}
          >
            {ctx.slots.default?.()}
            {props.label}
          </span>
        )}
      </label>
    );
  }
});