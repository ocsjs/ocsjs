import { defineComponent } from "vue";

export const Tooltip = defineComponent({
    props: ["title"],
    data() {
        return { show: false };
    },
    render() {
        return (
            <div style="width: 100%">
                <span
                    style={{ display: this.show ? "block" : "none" }}
                    class="tooltip"
                    innerHTML={this.$props.title.replace(/\n/g, "<br/>")}
                ></span>
                <div
                    style="width: 100%"
                    onMouseenter={() => (this.show = true)}
                    onMouseleave={() => (this.show = false)}
                >
                    {this.$slots.default?.()}
                </div>
            </div>
        );
    },
});
