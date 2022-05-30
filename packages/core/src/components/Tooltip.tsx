import { defineComponent, PropType, ref, toRefs } from 'vue';

export const Tooltip = defineComponent({
  props: {
    title: {
      default: '',
      type: String as PropType<string|undefined>
    },
    /** 类型 */
    type: {
      default: 'dark',
      type: String as PropType<'dark' | 'light'>
    },
    tooltipStyle: {
      default: () => {},
      type: Object as PropType<object>
    },
    containerStyle: {
      default: () => {},
      type: Object as PropType<object>
    }
  },
  setup(props, { slots }) {
    const { title, type, tooltipStyle, containerStyle } = toRefs(props);
    const show = ref(false);
    return () => (
      <div style={{ width: '100%', ...containerStyle.value }}>
        <div style={{ display: show.value ? 'block' : 'none', ...tooltipStyle.value }} class={'tooltip ' + type.value}>
          {slots.title
            ? (slots.title())
            : (<span innerHTML={title.value?.replace(/\n/g, '<br/>')}></span>)}
        </div>
        <div
          onMouseenter={() => (show.value = true)}
          onMouseleave={() => (show.value = false)}
        >
          {slots.default?.()}
        </div>
      </div>
    );
  }

});
