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
            <div class="mb-1">
                <input type="text" class="form-control" :value="password_derivation_parameter.slice(0,8)+'...'+password_derivation_parameter.slice(-8)" readonly disabled>
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

    <div class="alert alert-danger mt-3" v-if="failed">
        获取密码失败。请重试。
    </div>

    <Result v-if="seed" :seed="seed" :format="format" @reset="seed=''"></Result>

</div>
</template>
<script>
import _ from "lodash";
import { Buffer } from "buffer";
import {
    get_password_derivation_parameter,
    SHA512_HMAC,
} from "app/passwordgen";
import pwdreq_parser from "app/pwdreq_parser";
import Result from "./result.vue";

async function generate_password(){
    if(this.use_web_hsm){
        let endpoint = _.get(this, "WEBHSM.endpoint");

        let formdata = new URLSearchParams();
        formdata.append('request', this.password_derivation_parameter);
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
        }
    } else {
        // use normal way to generate
        let result = SHA512_HMAC(
            Buffer.from(this.password_derivation_parameter, "ascii"),
            Buffer.from(this.key, "ascii")
        );
        this.on_seeded(result);
    }

    this.key = "";
}





export default {

    props: {
        pwdreq: {
            type: String,
            required: true,
        },
        generation_password: {
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

        seed: "",
    }},

    computed: {
        use_web_hsm(){
            return _.isString(_.get(this.WEBHSM, "endpoint"));
        },

        password_derivation_parameter(){
            try{
                let { category, domain, username } = pwdreq_parser(this.pwdreq);
                return get_password_derivation_parameter({
                    category, domain, username,
                    generation_password: this.generation_password
                });
            } catch(e){
                console.log(e);
                return null;
            }
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
            this.seed = buf;
        },

        async on_failed(){
            this.failed = true;
        }
    },

    components: {
        Result,
    }
}
</script>