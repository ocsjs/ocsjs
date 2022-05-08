import { defineComponent, PropType } from 'vue';

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
    }
  },
  data () {
    return { show: false };
  },
  render () {
    return (
      <div onMouseenter={() => (this.show = true)} onMouseleave={() => (this.show = false)} style="width: 100%">
        <div style={{ display: this.show ? 'block' : 'none', ...this.$props.tooltipStyle }} class={'tooltip ' + this.type}>
          {this.$slots.title
            ? (
                this.$slots.title()
              )
            : (
            <span innerHTML={this.$props.title?.replace(/\n/g, '<br/>')}></span>
              )}
        </div>
        <div style="width: 100%">{this.$slots.default?.()}</div>
      </div>
    );
  }
});
