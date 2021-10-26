import { defineComponent } from "vue";


export const VNode = defineComponent({
    props: {
        content:{
            type:Object
        }
    },
    render(): any {
        return this.content;
    }
});

