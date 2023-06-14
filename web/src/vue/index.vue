<template>
<div class="container">

    <div style="padding: 2em 0 2em 0">
        <h3>NeoAtlantis Password Generator via HMAC</h3>
    </div>

    <PwdreqForm
        @pwdreq="pwdreq=$event"
        @hint="hint=$event"
        @category="category=$event"
        v-if="step==1"
    ></PwdreqForm>

    <HMACGen
        :pwdreq="pwdreq" :hint="hint" :category="category"

        v-if="step==2"
    ></HMACGen>

    <div style="margin-top: 1em; text-align: center;">
        <button type="submit" class="btn btn-primary" v-if="step==1" @click="step=2">下一步</button>
    </div>

</div>
</template>
<script>
import passwordgen from "app/passwordgen";
import PwdreqForm from "./pwdreq-form.vue";
import HMACGen from "./hmacgen.vue";

export default {

    data(){ return {

        step: 1,

        key: "",
        generation_password: "",

        pwdreq: "",
        hint: "",
        category: "",
        

        error: false,
    } },

    
/*
        password(){
            try{
                let pwd = passwordgen({
                    key: this.key,
                    category: this.input_category,
                    domain: this.input_domain,
                    username: this.input_username,
                    generation_password: this.generation_password,
                    format: this.input_format,
                });
                this.error = false;
                return pwd;
            } catch(e){
                this.error = e.message;
                return "";
            }
        }
    }
*/

    components: {
        PwdreqForm,
        HMACGen,
    }
}
</script>