<template>
<div class="container">

    <div style="padding: 2em 0 2em 0">
        <h3>NeoAtlantis Password Generator via HMAC</h3>
    </div>

    <PwdreqForm
        @pwdreq="pwdreq=$event"
        @hint="hint=$event"
        @category="category=$event"
        @format="format=$event"
        @generation_password="generation_password=$event"

        v-if="step==1"
    ></PwdreqForm>

    <HMACGen
        :pwdreq="pwdreq" :hint="hint" :category="category" :format="format"
        :generation_password="generation_password"

        v-if="step==2"
    ></HMACGen>

    <div style="margin-top: 1em; text-align: center;">
        <button type="submit" class="btn btn-primary" v-if="step==1" :disabled="pwdreq==''" @click="step=2">下一步</button>
        <button type="submit" class="btn btn-primary" v-if="step==2" @click="step=1">重新开始</button>
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

        pwdreq: "",
        hint: "",
        category: "",
        format: "",
        generation_password: "",
        

        error: false,
    } },

    components: {
        PwdreqForm,
        HMACGen,
    }
}
</script>