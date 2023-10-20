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
      <template #uploaded="dataProps">
        <img :src="dataProps.uploadedData && dataProps.uploadedData.data.url"
          style="height: 200px; width: 200px;">
      </template>
    </uploader>
    <validate-form @form-submit="formSubmit">
      <div class="mb-3 validate-input">
        <label class="form-lable">{{ activeName === 'person' ? '昵称' : '专栏' }}</label>
        <validate-input :placeholder="activeName === 'person' ? '请输入昵称' : '请输入专栏'" :rules="nickNameRules"
          v-model="userProfile.nickName"></validate-input>
      </div>
      <div class="mb-3 validate-input">
        <label class="form-label">{{ activeName === 'person' ? '个人简介' : '专栏简介' }}</label>
        <validate-input :placeholder="activeName === 'person' ? '请输入个人简介' : '请输入专栏简介'" :rules="descriptionRules"
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
import { GlobalDataProps, ResponseType, ImageProps, ColumnProps } from '@/store'
import { beforeUploadCheck } from '../helper'
import createMessage from '@/components/createMessage'
import { useUserStore, UserDataProps } from '../store/user'
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
    const userProfile = reactive<UserDataProps>({
      _id: '',
      column: '',
      avatar: {},
      nickName: '',
      description: ''
    })
    let currentColumn = reactive<ColumnProps>({
      _id: '',
      title: '',
      avatar: {},
      description: ''
    })
    watchEffect(() => {
      if (activeName.value === 'person') {
        uploadedData.value = { data: userProfile.avatar }
        userProfile._id = (userStore.getCurrentAuthor() as UserDataProps)._id
        userProfile.nickName = (userStore.getCurrentAuthor() as UserDataProps).nickName
        userProfile.description = (userStore.getCurrentAuthor() as UserDataProps).description
        console.log(userStore.getCurrentAuthor())
        console.log('person')
      } else {
        uploadedData.value = { data: currentColumn.avatar }
        userProfile.nickName = currentColumn.title
        userProfile.description = currentColumn.description
        console.log(currentColumn)
        console.log('column')
      }
    })
    onMounted(() => {
      userProfile.column = (userStore.getCurrentAuthor() as UserDataProps).column as string
      userProfile.avatar = (userStore.getCurrentAuthor() as UserDataProps).avatar
      userProfile.nickName = (userStore.getCurrentAuthor() as UserDataProps).nickName
      userProfile.description = (userStore.getCurrentAuthor() as UserDataProps).description
      uploadedData.value = { data: userProfile.avatar }
      columnStore.fetchColumn(userProfile.column).then(() => {
        currentColumn = columnStore.getColumnById(userProfile.column as string)
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
        if (activeName.value === 'person') {
          userProfile.avatar = uploadedData.value.data
          debugger
          userStore.updateAuthor(userProfile._id as string, userProfile)
        } else {
          const column: ColumnProps = {
            _id: currentColumn._id,
            title: userProfile.nickName as string,
            avatar: uploadedData.value.data,
            description: userProfile.nickName as string
          }
          columnStore.updateColumnById(currentColumn._id as string, column).then(() => {
            currentColumn = columnStore.getColumnById(userProfile.column as string)
          })
        }
        createMessage('更新成功', 'success', 2000)
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
      if (rawData.data.url) {
        uploadedData.value.data.url = rawData.data.url
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
