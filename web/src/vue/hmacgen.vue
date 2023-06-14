<template>
<div>

    <div class="card">
        <div class="card-header">签署并生成密码</div>

        <div class="card-body">
            <div class="mb-1">
                即将根据如下请求生成密码。
            </div>
            <div class="mb-1">
                <input type="text" class="form-control" :value="pwdreq" readonly disabled>
            </div>
        </div>

        <div class="card-footer" >
            <div class="mb-1" v-if="!use_web_hsm">
                输入对应于口令所属类别 <code>{{ category }}</code> 的中间密钥。
            </div>
            <div class="mb-1" v-if="use_web_hsm">
                使用远程硬件安全模块签署批准密码请求。请准备好用于认证的 YubiKey。
            </div>

            <form class="mb-1" @submit.prevent="on_generate">
                <input ref="key" type="password" class="form-control" v-model="key"/>
            </form>
        </div>

    </div>

    <div v-if="generating" style="padding: 1em; text-align: center">
        <div class="spinner-border"></div>
    </div>

    <div class="alert alert-danger" style="margin-top: 1em" v-if="failed">
        获取密码失败。请重试。
    </div>

    <pre v-if="result">{{ result }}</pre>

</div>
</template>
<script>
import _ from "lodash";
import { Buffer } from "buffer";
import { seed_to_password } from "app/passwordgen";

async function generate_password(){
    if(this.use_web_hsm){
        let endpoint = _.get(this, "WEBHSM.endpoint");

        let formdata = new URLSearchParams();
        formdata.append('request', this.pwdreq);
        formdata.append('otp', this.key);

        try{
            let res = await fetch(endpoint, {
                method: 'POST',
                body: formdata,
            });
            if(res.status != 200) throw Error();
            let seed = await res.text();

            this.on_seeded(seed);
        } catch(e){
            // failed getting seed
            this.on_failed();
        } finally {
            this.key = "";
        }

    } else {
        // use normal way to generate
    }
}





export default {

    props: {
        pwdreq: {
            type: String,
            required: true,
        },
        category: true,
        hint: true,
        format: true,
    },

    data(){ return {
        WEBHSM: WEBHSM,

        key: "",

        generating: false,
        failed: false,

        result: "",
    }},

    computed: {
        use_web_hsm(){
            return _.isString(_.get(this.WEBHSM, "endpoint"));
        }
    },

    methods: {
        focus(){
            this.$refs["key"].focus();
        },

        async on_generate(){
            this.generating = true;
            this.failed = false;
            try{
                let result = await generate_password.call(this);
                this.generating = false;
                return result;
            } finally {
                this.generating = false;
            }
        },

        async on_seeded(seed){
            this.failed = false;
            // verify seed
            let buf = Buffer.from(seed, "hex");
            if(buf.length != 64){
                alert("Unexpected HSM output. Bytes length invalid.");
                return;
            }

            this.result = seed_to_password(buf, this.format);
        },

        async on_failed(){
            this.failed = true;
        }
    }
}
</script>