import { defineComponent, reactive } from 'vue';
import { CdkSelection } from './selection';
import { CdkSelectionItem } from './selection-item';
import { SelectionItemState } from './types';

const widgetBuilder = (value: number) => (state: SelectionItemState) => [
  <p>
    Item {value} :
    <button onClick={() => state.selected = !state.selected}>
      {state.selected ? 'close' : 'expanded'}
    </button>
  </p>,
  <p v-show={state.selected}>
    I only show if item {value} is expanded
  </p>
];

export default defineComponent({
  name: 'cdk-selection-spec',
  setup() {
    const array = reactive([1, 2, 3, 4, 5]);
    const state = reactive({ multiple: false, selected: false });
    return () => (
      <>
        <div>
          accordion is {state.multiple ? 'multi' : 'single'}
        </div>
        <button
          onClick={() => state.multiple = !state.multiple}
          style="display: block;"
        >
          click me
        </button>
        <button
          onClick={() => state.selected = !state.selected}
        >
          {state.selected ? 'close' : 'open'}
        </button>

        <CdkSelection multiple={state.multiple} selected={state.selected}>
          {array.map((value) => <CdkSelectionItem value={value} v-slots={{ default: widgetBuilder(value) }} />)}
        </CdkSelection>
      </>
    );
  }
});