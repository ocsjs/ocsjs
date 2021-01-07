<template>
  <div style="display: flex;justify-content: center;">
    <a-form-model style="min-width: 900px;" :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item label="谷歌浏览器版本">
        <a-input v-model="form.chrome_version" style="width: 50%;" />
        <a-button type="link"> 查看教程</a-button>
      </a-form-model-item>
      <a-form-model-item label="登录时验证码自动破解">
        <a-switch v-model="form.use_breakCode" />
        <a-button type="link"> 查看教程</a-button>

      </a-form-model-item>
      <a-form-model-item v-if="form.use_breakCode" label="账号">
        <a-input v-model="form.breakCode.username" style="width: 50%;" />
      </a-form-model-item>
      <a-form-model-item v-if="form.use_breakCode" label="密码">
        <a-input v-model="form.breakCode.password" style="width: 50%;" />
      </a-form-model-item>


      <a-form-model-item :wrapper-col="{ span: 8, offset: 8 }">
        <a-button type="primary" @click="onSubmit">
          保存
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
  import api from '../../../api/index.js'

  export default {
    data() {
      return {
        labelCol: {
          span: 8
        },
        wrapperCol: {
          span: 10
        },
        form: {
          chrome_version: '',
          use_breakCode: false,
          breakCode: {
            username: '',
            password: '',
          },
        },
      };
    },
    methods: {
      onSubmit() {

        console.log('submit!', this.form);

        api.setBaseConfig(this.form).then(r => {
          if (r.data.code === 1) {
            this.$message.success('保存成功');
          }
        }).catch(e => {
          console.error(e);
        })
      },
    },

    mounted() {
      api.getBaseConfig().then(r=>{
        console.log('submit!', this.form);
        this.form = r.data.data
      }).catch(e=>{
        console.error(e);
      })
    }
  };
</script>
