<template>
    <div class="card mt-3">
        <div class="card-header text-white bg-success">密码已经生成</div>
        <div class="card-body">
            <div class="input-group">
                <input :type="hidden?'password':'text'" class="form-control" :value="result" readonly />
                <button
                    class="btn btn-outline-secondary"
                    @mousedown="hidden=false" @mouseup="hidden=true"
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
        hidden: true,
        success: false,
    }},

    methods: {
        copy(){
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