import { defineComponent, PropType } from "vue";

export const Tooltip = defineComponent({
    props: {
        title: String || undefined,
        /** 类型 */
        type: String as PropType<"dark" | "light">,
    },
    data() {
        return { show: false };
    },
    render() {
        return (
            <div onMouseenter={() => (this.show = true)} onMouseleave={() => (this.show = false)} style="width: 100%">
                <span style={{ display: this.show ? "block" : "none" }} class={"tooltip " + (this.type || "dark")}>
                    {this.$slots.title ? (
                        this.$slots.title()
                    ) : (
                        <span innerHTML={this.$props.title?.replace(/\n/g, "<br/>")}></span>
                    )}
                </span>
                <div style="width: 100%">{this.$slots.default?.()}</div>
            </div>
        );
    },
});
