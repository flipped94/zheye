<template>
  <div class="eidt-profile-page container-md">
    <ul class="nav nav-tabs my-4">
      <li class="nav-item" @click.prevent="activeName = 'person'">
        <a class="nav-link" :class="{ 'active': activeName === 'person' }"
          href="#">更新个人资料</a>
      </li>
      <li class="nav-item" @click.prevent="activeName = 'column'">
        <a class="nav-link" :class="{ 'active': activeName === 'column' }"
          href="#">更新专栏信息</a>
      </li>
    </ul>
    <h4>编辑个人资料</h4>
    <uploader action="/oss/upload" :beforeUpload="uploadCheck"
      @file-uploaded="handleFileUploaded" :uploaded="uploadedData"
      style="margin-left:auto; margin-right: auto; width: 200px;height: 200px;border-radius: 200px;overflow: hidden;cursor: pointer;border: 1px solid #efefef;">
      <h2></h2>``
      <template #uploaded="dataProps">
        <img :src="dataProps.uploadedData && dataProps.uploadedData.data.url"
          style="height: 200px; width: 200px;">
      </template>
    </uploader>
    <validate-form @form-submit="formSubmit">
      <div class="mb-3 validate-input">
        <label class="form-lable">昵称</label>
        <validate-input placeholder="请输入昵称" :rules="nickNameRules"
          v-model="userProfile.title"></validate-input>
      </div>
      <div class="mb-3 validate-input">
        <label class="form-label">描述</label>
        <validate-input placeholder="请输入描述" :rules="descriptionRules"
          v-model="userProfile.description"></validate-input>
      </div>
      <template #submit>
        <button class="btn btn-primary">提交修改</button>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watchEffect } from 'vue'
import ValidateForm from '../components/ValidateForm.vue'
import ValidateInput, { RulesProp } from '../components/ValidateInput.vue'
import Uploader from '../components/Uploader.vue'
import { useStore } from 'vuex'
import { GlobalDataProps, ResponseType, ImageProps, UserProps, ColumnProps } from '@/store'
import { beforeUploadCheck } from '../helper'
import createMessage from '@/components/createMessage'
import { useUserStore } from '../store/user'
import { useColumnStore } from '../store/column'
type ActiveName = 'person' | 'column'
export default defineComponent({
  name: 'EditProfile',
  components: {
    ValidateForm,
    ValidateInput,
    Uploader
  },
  setup() {
    const store = useStore<GlobalDataProps>()
    const uploadedData = ref()
    const userStore = useUserStore()
    const columnStore = useColumnStore()
    const activeName = ref<ActiveName>('person')
    const imageId = ref()
    const userProfile = reactive<UserProps>({
      column: '',
      avatar: {},
      title: '',
      description: ''
    })
    let currentColumn = reactive<ColumnProps>(
      {}
    )
    watchEffect(() => {
      if (activeName.value === 'person') {
        uploadedData.value = { data: userProfile.avatar }
        userProfile.title = userStore.getCurrentAuthor().nickName
        userProfile.description = userStore.getCurrentAuthor().description
        console.log(userStore.getCurrentAuthor())
        console.log('person')
      } else {
        uploadedData.value = { data: currentColumn.avatar }
        userProfile.title = currentColumn.title
        userProfile.description = currentColumn.description
        console.log(currentColumn)
        console.log('column')
      }
    })
    onMounted(() => {
      userProfile.column = userStore.getCurrentAuthor().column
      userProfile.avatar = userStore.getCurrentAuthor().avatar
      userProfile.title = userStore.getCurrentAuthor().nickName
      userProfile.description = userStore.getCurrentAuthor().description
      uploadedData.value = { data: userProfile.avatar }
      columnStore.fetchColumn(userProfile.column).then(() => {
        currentColumn = columnStore.getColumnById(userProfile.column)
      })
    })
    const nickNameRules: RulesProp = [
      {
        type: 'required',
        message: '请输入昵称'
      }
    ]
    const descriptionRules: RulesProp = [
      {
        type: 'required',
        message: '请输描述'
      }
    ]
    const formSubmit = (validate: boolean) => {
      if (validate) {
        // const actionName = activeName.value === 'person' ? 'updateUser' : 'updateColumnById'
        // const sendData = {
        //   id: activeName.value === 'person' ? user._id : currentColumn.value._id,
        //   data: {
        //     title: userProfile.title,
        //     nickName: userProfile.title,
        //     avatar: imageId.value,
        //     description: userProfile.description
        //   }
        // }
        // store.dispatch(actionName, sendData)
        //   .then(() => {
        //     createMessage({
        //       type: 'success',
        //       message: '更新成功，2s后返回首页'
        //     })
        //     setTimeout(() => {
        //       router.push('/home')
        //     }, 2000)
        //   })
      }
    }
    const uploadCheck = (file: File) => {
      const result = beforeUploadCheck(file, { format: ['image/jpeg', 'image/png'], size: 1 })
      const { passed, error } = result
      if (error === 'format') {
        createMessage('上传图片只能是 JPG/PNG 格式!', 'error')
      }
      if (error === 'size') {
        createMessage('上传图片大小不能超过 1Mb', 'error')
      }
      return passed
    }
    const handleFileUploaded = (rawData: ResponseType<ImageProps>) => {
      if (rawData.data._id) {
        imageId.value = rawData.data._id
      }
    }
    return {
      activeName,
      nickNameRules,
      descriptionRules,
      formSubmit,
      uploadCheck,
      handleFileUploaded,
      uploadedData,
      userProfile
    }
  }
})
</script>

<style scoped></style>
