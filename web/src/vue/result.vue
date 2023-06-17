<template>
    <div class="card mt-3">
        <div class="card-header text-white bg-success">密码已经生成</div>
        <div class="card-body">
            <div class="input-group">
                <input :type="hidden?'password':'text'" class="form-control" :value="result" readonly />
                <button
                    class="btn btn-outline-secondary"
                    @mousedown="hidden=false" @mouseup="hidden=true; reset_expiral()"
                    @mouseout="hidden=true"
                >显示</button>
                <button class="btn btn-success" @click="copy">复制</button>
            </div>
            <div v-if="success" class="mt-1">
                密码已经成功复制到剪贴板。
            </div>
        </div>
    </div>
</template>
<script>
import _ from "lodash";
import { Buffer } from "buffer";
import { seed_to_password } from "app/passwordgen";


export default {

    mounted(){
        setInterval(()=>{
            let now = new Date().getTime();
            if(this.expiral > 0 && now > this.expiral){
                this.$emit("reset");
            }
        }, 1000);
        this.reset_expiral();
    },

    props: {
        seed: {
            required: true,
        },
        format: {
            type: String,
            required: true,
        }
    },

    data(){ return {
        expiral: -1,
        hidden: true,
        success: false,
    }},

    methods: {
        reset_expiral(){
            this.expiral = new Date().getTime() + 30000;
        },

        copy(){
            this.reset_expiral();
            navigator.clipboard.writeText(this.result).then(
                ()=>{
                    this.success = true;
                    setTimeout(()=>this.success=false, 5000);
                },
                ()=>{
                    this.success = false;
                }
            )
        }
    },

    computed: {
        result(){
            return seed_to_password(this.seed, this.format);
        }
    }
}
</script>