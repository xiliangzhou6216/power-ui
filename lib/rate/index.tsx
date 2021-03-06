import { vmodelRef } from '../cdk/hook';
import { isObject, List, renderCondition } from '../cdk/utils';
import { computed, defineComponent, ExtractPropTypes, reactive, Ref, renderList, toRef, VNode } from 'vue';

export type RateSection = {
  [k in number]: { value: string, excluded: boolean } | string
}

type Test = ExtractPropTypes<InstanceType<typeof Rate>['$props']>;


export const Rate = defineComponent({
  name: 'el-rate',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    lowThreshold: {
      type: Number,
      default: 2
    },
    highThreshold: {
      type: Number,
      default: 4
    },
    max: {
      type: Number,
      default: 5
    },
    colors: {
      type: [Array, Object],
      default: () => ['#99A9BF', '#F7BA2A', '#FF9900']
    },
    voidColor: {
      type: String,
      default: '#C6D1DE'
    },
    disabledVoidColor: {
      type: String,
      default: '#EFF2F7'
    },
    iconClasses: {
      type: [List<string>(), Object],
      default: () => ['el-icon-star-on', 'el-icon-star-on', 'el-icon-star-on']
    },
    voidIconClass: {
      type: String,
      default: 'el-icon-star-off'
    },
    disabledVoidIconClass: {
      type: String,
      default: 'el-icon-star-on'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    allowHalf: {
      type: Boolean,
      default: false
    },
    showText: {
      type: Boolean,
      default: true
    },
    showScore: {
      type: Boolean,
      default: false
    },
    textColor: {
      type: String,
      default: '#1f2d3d'
    },
    texts: {
      type: List<string>(),
      default: () => ['极差', '失望', '一般', '满意', '惊喜']
    },
    scoreTemplate: {
      type: String,
      default: '{value}'
    }
  },

  setup(props, ctx) {
    const currentValue = vmodelRef(toRef(props, 'modelValue'), value => {
      ctx.emit('update:modelValue', value);
    });

    const state = reactive({
      hoverIndex: -1,
      movingValue: props.modelValue,
      pointerAtLeftHalf: false,
    });

    const text = computed(() => {
      if (props.showScore) {
        return props.scoreTemplate.replace(/\{\s*value\s*\}/, `${state.movingValue}`);
      } else if (props.showText) {
        const current = state.movingValue;
        return props.texts[Math.ceil(current) - 1];
      }
      return '';
    });

    const setCurrentValue = (value: number, event: MouseEvent) => {
      if (props.disabled) {
        return;
      }
      if (props.allowHalf) {
        const target = (event.target as Element);
        let width = target.clientWidth;
        if (target.classList.contains('el-rate__item')) {
          width = target.querySelector('.el-rate__icon')?.clientWidth ?? 0;
        }
        if (target.classList.contains('el-rate__decimal')) {
          width = (target.parentNode as Element)?.clientWidth ?? 0;
        }

        state.pointerAtLeftHalf = event.offsetX * 2 <= width;
        state.movingValue = state.pointerAtLeftHalf ? value - 0.5 : value;
      } else {
        state.movingValue = value;
      }
      state.hoverIndex = value;
    };

    const resetCurrentValue = () => {
      state.hoverIndex = -1;
      state.movingValue = currentValue.value;
    };

    const selectValue = (value: number) => {
      if (props.disabled) {
        return;
      }
      if (props.allowHalf && state.pointerAtLeftHalf) {
        currentValue.value = state.movingValue;
        ctx.emit('change', state.movingValue);
      } else {
        currentValue.value = value;
        ctx.emit('change', value);
      }
    };

    const computeSection = (valueRef: Ref<string[] | RateSection>) => {
      return computed(() => {
        const target = valueRef.value;
        return Array.isArray(target)
          ? {
            [props.lowThreshold!]: target[0],
            [props.highThreshold!]: { value: target[1], excluded: true },
            [props.max!]: target[2]
          } : target;
      });
    };

    const colorSection = computeSection(toRef(props, 'colors'));
    const iconsSection = computeSection(toRef(props, 'iconClasses'));

    const getValueFromSection = (value: number, section: RateSection) => {
      const matchedKeys = Object.keys(section)
        .map(Number)
        .filter(key => {
          const val = section[key];
          const excluded = isObject(val) ? val.excluded : false;
          return excluded ? value < key : value <= key;
        })
        .sort((a, b) => a - b);
      const matchedValue = section[matchedKeys[0]];
      return isObject(matchedValue) ? matchedValue.value : (matchedValue || '');
    };

    const activeColor = computed(() => getValueFromSection(state.movingValue, colorSection.value));
    const activeClass = computed(() => getValueFromSection(state.movingValue, iconsSection.value));
    const decimalIconClass = computed(() => getValueFromSection(currentValue.value, iconsSection.value));
    const voidClass = computed(() => props.disabled ? props.disabledVoidIconClass : props.voidIconClass);

    const classes = computed(() => {
      const result = [];
      let threshold = state.movingValue;
      if (props.allowHalf && threshold !== Math.floor(threshold)) {
        threshold--;
      }
      for (let i = 0; i < threshold; i++) {
        result.push(activeClass.value);
      }
      for (let i = 0; i < props.max - threshold; i++) {
        result.push(voidClass.value);
      }
      return result;
    });

    const valueDecimal = computed(() => {
      const current = state.movingValue;
      return current * 100 - Math.floor(current) * 100;
    });

    const decimalStyle = computed(() => {
      return {
        color: activeColor.value,
        width: props.disabled ? `${valueDecimal.value}%` : props.allowHalf ? '50%' : ''
      };
    });


    const showDecimalIcon = (item: number) => {
      const { allowHalf } = props;
      const disabled = props.disabled;
      const current = currentValue.value;
      const showWhenDisabled = disabled && valueDecimal.value > 0 && item - 1 < current && item > current;
      const showWhenAllowHalf = allowHalf &&
        state.pointerAtLeftHalf &&
        item - 0.5 <= state.movingValue &&
        item > state.movingValue;
      return showWhenDisabled || showWhenAllowHalf;
    };

    const getIconStyle = (item: number) => {
      const voidColor = props.disabled ? props.disabledVoidColor : props.voidColor;
      return {
        color: item <= state.movingValue ? activeColor.value : voidColor
      };
    };

    const handleKey = () => {
      // TODO: handle Keyboard Event
    };

    return () => (
      <div
        class="el-rate"
        role="slider"
        onKeydown={handleKey}
        aria-valuenow={currentValue.value}
        aria-valuetext={text.value}
        aria-valuemin={0}
        aria-valuemax={props.max}
        tabindex={0}
      >
        {...renderList(props.max, (item, key) => {
          return <span
            class="el-rate__item"
            onMousemove={($event) => setCurrentValue(item, $event)}
            onMouseleave={resetCurrentValue}
            onClick={() => selectValue(item)}
            style={{ cursor: props.disabled ? 'auto' : 'pointer' }}
            key={key}
          >
            <i
              class={['el-rate__icon', classes.value[item - 1], { 'hover': state.hoverIndex === item }]}
              style={getIconStyle(item)}
            >
              {renderCondition(showDecimalIcon(item),
                <i
                  class={['el-rate__decimal', decimalIconClass.value]}
                  style={decimalStyle.value}
                />
              )}
            </i>
          </span> as VNode;
        })}
        {renderCondition(
          props.showText || props.showScore,
          <span class="el-rate__text" style={{ color: props.textColor }}>{text.value}</span>
        )}
      </div>
    );
  },
});
