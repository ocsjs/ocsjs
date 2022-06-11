import { defineComponent, PropType, toRefs } from 'vue';
import { useStore } from '../store';
import { AlertType } from './types';

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
    const local = useStore('localStorage');

    return () => (
      <div class={['alert', type.value].join(' ')}>
        <span style="text-shadow: 0 0 BLACK;">{ type.value === 'info' ? 'ℹ️' : type.value === 'error' ? '❗' : type.value === 'success' ? '✅' : type.value === 'warn' ? '⚠️' : '❕' }</span>
        <div style="display: inline">
          <span
            class="alert-closer"
            onClick={() => (local.alerts.splice(index.value, 1))}>
              ×
          </span>
          <span class="alert-text">{ text.value }</span>

        </div>
      </div>
    );
  }
});
