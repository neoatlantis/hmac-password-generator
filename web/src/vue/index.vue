<template>
<div class="container">

    <div style="padding: 2em 0 2em 0">
        <h3>NeoAtlantis Password Generator via HMAC</h3>
    </div>

    <div class="card">
        <div class="card-header">中间密钥</div>
        <div class="card-body">
            <div class="mb-1">
                输入对应于口令所属类别 <code>{{parsed_pwdreq.category}}</code> 的中间密钥。
            </div>
            <div class="mb-1">
                <input type="password" class="form-control"/>
            </div>
        </div>
    </div>

    <br />

    <div class="card">
        <div class="card-header">
            口令请求参数
        </div>
        <div class="card-body">
            <div class="mb-1 form-check">
                <input class="form-check-input" type="radio" name="paramsource" id="radio-by-url" checked>
                <label class="form-check-label" for="radio-by-url">
                    我有一个口令请求网址
                </label>
            </div>
            <div class="mb-3">
                <div class="input-group has-validation">
                    <input
                        type="text"
                        class="form-control"
                        :class="{'is-invalid':input_pwdreq && input_pwdreq_invalid}"
                        placeholder="pwdreq://..."
                        v-model="input_pwdreq"
                    />
                    <div class="invalid-feedback">
                        口令请求网址看起来不正确。
                    </div>
                </div>
            </div>


            <div class="mb-1 form-check">
                <input class="form-check-input" type="radio" name="paramsource" id="radio-by-details">
                <label class="form-check-label" for="radio-by-details">
                    自定义参数输入
                </label>
            </div>
            <div class="mb-2">
                <div class="row">
                    <div class="col-3">分类</div>
                    <div class="col-9">{{ parsed_pwdreq.category }}</div>
                </div>

                <div class="row">
                    <div class="col-3">请求域</div>
                    <div class="col-9">{{ parsed_pwdreq.domain }}</div>
                </div>

                <div class="row">
                    <div class="col-3">用户名</div>
                    <div class="col-9">{{ parsed_pwdreq.username }}</div>
                </div>

                <div class="row">
                    <div class="col-3">输出格式</div>
                    <div class="col-9">{{ parsed_pwdreq.format }}</div>
                </div>
            </div>

            <hr />

            <div class="mb-1">
                <label for="generation-password" class="form-label">输入代际口令:</label>
                <input type="password" class="form-control" id="generation-password" :placeholder="parsed_pwdreq.hint" autocomplete="off">
                <div class="form-text">
                    代际口令用于区分同一个网站上同一个用户所用过的不同密码。
                    可以选择您在一段很长的时间内常用的固定密码作为代际口令。
                </div>


            </div>

        </div>
    </div>

</div>
</template>
<script>
import crypto from "crypto-js";

export default {

    data(){ return {
        input_pwdreq: "",
        /// #if DEV
        input_pwdreq: "pwdreq://username@domain/default?format=24N",
        /// #endif
        input_pwdreq_invalid: false,
    } },

    computed: {
        parsed_pwdreq(){
            let url = null;
            try{
                url = new URL(this.input_pwdreq);
                if("pwdreq:" != url.protocol) throw Error();

                // treat as HTTP url afterwards. hostname etc. are HTTP url
                // specific.
                url = new URL("http"+this.input_pwdreq.slice(6));
                this.input_pwdreq_invalid = false;
            } catch(e){
                this.input_pwdreq_invalid = true;
                return {};
            }
            
            let username = url.username;
            let domain   = url.hostname;
            let category = url.pathname;
            let search   = url.searchParams;
            let format   = url.searchParams.get("format");
            let hint     = url.hash;

            if(hint.slice(0,1)=='#') hint = hint.slice(1);

            return { username, domain, category, format, hint };
        }

    }



}
</script>