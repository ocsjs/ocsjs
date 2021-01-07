<template>
  <div style="display: flex;justify-content: center;">
    <a-row>
      <a-col><span style="font-weight: bold;font-size: 20px;">超星自动登录配置</span></a-col>
      <a-col>
        <a-form   id="components-form-demo-normal-login" :form="form" class="login-form" @submit="handleSubmit">
          <a-form-item>
            <a-input v-decorator="[
                'school',
                { rules: [{ required: true, message: '请配置你的学校' }] },
              ]"
              placeholder="学校">
              <a-icon slot="prefix" type="home" style="color: rgba(0,0,0,.25)" />
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="[
                'account',
                { rules: [{ required: true, message: '请配置你的用户名' }] },
              ]"
              placeholder="用户名">
              <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="[
                'password',
                { rules: [{ required: true, message: '请配置你的密码' }] },
              ]"
              type="text" placeholder="密码">
              <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" class="login-form-button" >
              保存
            </a-button>

          </a-form-item>
        </a-form>
      </a-col>

    </a-row>

  </div>
</template>

<script>
  import api from '../../../api/index.js'

  export default {
    beforeCreate() {
      this.form = this.$form.createForm(this, {
        name: 'normal_login'
      });
    },
    data(){
      return {
        config:''
      }
    },
    methods: {
      handleSubmit(e) {
        e.preventDefault();
        this.form.validateFields((err, values) => {
          if (!err) {
            console.log('Received values of form: ',values);
            api.setCxConfig(values).then(r=>{
               if(r.data.code===1){
                 this.$message.success('保存成功');
               }
            }).catch(e=>{
              console.error(e);
            })
          }
        });
      },
    },

    mounted() {
      console.log(this.form);
      api.getCxConfig().then(r=>{
        console.log(r.data.data);
        this.form.setFieldsValue(r.data.data) 
      }).catch(e=>{
        console.error(e);
      })
    }
  };
</script>
<style>
  #components-form-demo-normal-login .login-form {
    max-width: 300px;
  }

  #components-form-demo-normal-login .login-form-forgot {
    float: right;
  }

  #components-form-demo-normal-login .login-form-button {
    width: 100%;
  }
</style>
