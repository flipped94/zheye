<template>
  <div class="create-post-page">
    <h4>{{ isEditMode ? '编辑文章' : '新建文章' }}</h4>
    <uploader action="/oss/upload" :beforeUpload="uploadCheck"
      @file-uploaded="handleFileUploaded" :uploaded="uploadedData"
      class="d-flex align-items-center justify-content-center bg-light text-secondary w-100 my-4">
      <h2>点击上传</h2>
      <template #loading>
        <div class="d-flex">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h2>正在上传</h2>
        </div>
      </template>
      <template #uploaded="dataProps">
        <div class="uploaded-area">
          <img :src="dataProps.uploadedData && dataProps.uploadedData.data.url">
          <h3>点击重新上传</h3>
        </div>
      </template>
    </uploader>
    <validate-form @form-submit="onFormSubmit">
      <div class="mb-3">
        <validate-input :rules="titleRules" v-model="titleVal" placeholder="请输入名称"
          type="text" />
      </div>
      <div class="mb-3">
        <validate-input :rules="contentRules" v-model="contentVal"
          placeholder="请输入简介信息" type="text" />
      </div>
      <template #submit>
        <button class="btn btn-primary btn-large">{{ '提交修改' }}</button>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { Options } from 'easymde'
import { GlobalDataProps, PostProps, ResponseType, ImageProps } from '../store'
import { usePostStore } from '../store/post'
import { useUserStore } from '../store/user'
import ValidateInput, { RulesProp } from '../components/ValidateInput.vue'
import ValidateForm from '../components/ValidateForm.vue'
import Uploader from '../components/Uploader.vue'
import createMessage from '../components/createMessage'
import { beforeUploadCheck } from '../helper'
export default defineComponent({
  name: 'CreatePost',
  components: {
    ValidateInput,
    ValidateForm,
    Uploader
  },
  setup() {
    const uploadedData = ref()
    const titleVal = ref('')
    const router = useRouter()
    const route = useRoute()
    const isEditMode = !!route.query.id
    const postId = route.query.id as string
    const store = useStore<GlobalDataProps>()
    const postStore = usePostStore()
    const userStore = useUserStore()
    const textArea = ref<null | HTMLTextAreaElement>(null)
    let imageId = ''
    const titleRules: RulesProp = [
      { type: 'required', message: '名称不能为空' }
    ]
    const contentVal = ref('')
    const contentRules: RulesProp = [
      { type: 'required', message: '简介信息不能为空' }
    ]
    onMounted(() => {
      if (isEditMode) {
        postStore.fetchPost(postId).then((currentPost) => {
          if (currentPost.image) {
            uploadedData.value = { data: currentPost.image }
          }
          titleVal.value = currentPost.title
          contentVal.value = currentPost.content || ''
        })
      }
    })
    const handleFileUploaded = (rawData: ResponseType<ImageProps>) => {
      if (rawData.data._id) {
        imageId = rawData.data._id
      }
    }
    const onFormSubmit = async (result: boolean) => {
      if (result && userStore.data) {
        const { column, _id } = userStore.data
        if (column) {
          const newPost: PostProps = {
            title: titleVal.value,
            content: contentVal.value,
            column,
            author: _id
          }
          if (imageId) {
            newPost.image = imageId
          }
          // const actionName = isEditMode ? 'updatePost' : 'createPost'
          // const sendData = isEditMode
          //   ? {
          //       id: route.query.id,
          //       payload: newPost
          //     }
          //   : newPost
          if (isEditMode) {
            await postStore.updatePost(postId, newPost)
          } else {
            await postStore.createPost(newPost)
          }
          createMessage('发表成功，2秒后跳转到文章', 'success', 2000)
          setTimeout(() => {
            router.push({ name: 'column', params: { id: column } })
          }, 2000)
          // store.dispatch(actionName, sendData).then(() => {
          //   createMessage('发表成功，2秒后跳转到文章', 'success', 2000)
          //   setTimeout(() => {
          //     router.push({ name: 'column', params: { id: column } })
          //   }, 2000)
          // })
        }
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
    return {
      titleRules,
      titleVal,
      contentVal,
      contentRules,
      onFormSubmit,
      uploadCheck,
      handleFileUploaded,
      isEditMode,
      uploadedData,
      textArea
    }
  }
})
</script>
<style>
.create-post-page .file-upload-container {
  height: 200px;
  cursor: pointer;
  overflow: hidden;
}

.create-post-page .file-upload-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploaded-area {
  position: relative;
}

.uploaded-area:hover h3 {
  display: block;
}

.uploaded-area h3 {
  display: none;
  position: absolute;
  color: #999;
  text-align: center;
  width: 100%;
  top: 50%;
}
</style>
