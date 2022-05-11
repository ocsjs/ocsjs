import { defineComponent, PropType, toRefs } from 'vue';
import { store } from '../main';

export interface AlertType {
  key: any;
  type: 'info' | 'success' | 'warn' | 'error';
  text: string
}

export const Alert = defineComponent({
  props: {
    type: {
      default: 'info',
      type: String as PropType<AlertType['type']>
    },
    text: {
      default: '',
      type: String as PropType<string>
    },
    index: {
      default: 0,
      type: Number as PropType<number>
    }
  },
  setup(props) {
    const { type, text, index } = toRefs(props);

    return () => (
      <div class={['alert', type.value].join(' ')}>
        <span >{ type.value === 'info' ? 'ℹ️' : type.value === 'error' ? '❗' : type.value === 'success' ? '✅' : type.value === 'warn' ? '⚠️' : '❕' }</span>
        <div style="display: inline">
          <span
            class="alert-closer"
            onClick={() => (store.alerts.splice(index.value, 1))}>
              ×
          </span>
          <span class="alert-text">{ text.value }</span>

        </div>
      </div>
    );
  }
});
