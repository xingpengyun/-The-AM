<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { changePassword, getSession, passwordPolicyError } from '@/utils/auth'

const message = useMessage()
const session = getSession()

const visible = ref(session?.mustChangePassword === true)
const submitting = ref(false)
const errorText = ref('')
const formRef = ref<FormInst | null>(null)

const model = reactive({ current: '', next: '', confirm: '' })

const rules: FormRules = {
  current: [{ required: true, message: '请输入当前密码', trigger: ['input', 'blur'] }],
  next: [
    { required: true, message: '请输入新密码', trigger: ['input', 'blur'] },
    {
      trigger: ['input', 'blur'],
      validator: (_rule: FormItemRule, value: string) => {
        const err = passwordPolicyError(value)
        return err ? new Error(err) : true
      }
    }
  ],
  confirm: [
    { required: true, message: '请再次输入新密码', trigger: ['input', 'blur'] },
    {
      trigger: ['input', 'blur'],
      validator: (_rule: FormItemRule, value: string) =>
        value === model.next ? true : new Error('两次输入的密码不一致')
    }
  ]
}

async function submit(): Promise<void> {
  if (!session) return
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  errorText.value = ''
  try {
    await changePassword(session.username, model.current, model.next)
    message.success('密码已更新')
    visible.value = false
  } catch (err) {
    errorText.value = err instanceof Error ? err.message : '修改失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <n-modal v-model:show="visible" :mask-closable="false" transform-origin="center">
    <div class="pwd-card">
      <h3>首次登录，请修改初始密码</h3>
      <p class="pwd-sub">当前使用的仍是默认密码 123，修改后继续使用系统。</p>

      <n-form ref="formRef" :model="model" :rules="rules" :show-label="false" size="large">
        <n-form-item path="current">
          <n-input
            v-model:value="model.current"
            type="password"
            show-password-on="click"
            placeholder="当前密码"
          />
        </n-form-item>
        <n-form-item path="next">
          <n-input
            v-model:value="model.next"
            type="password"
            show-password-on="click"
            placeholder="新密码（至少 8 位，含字母和数字）"
          />
        </n-form-item>
        <n-form-item path="confirm">
          <n-input
            v-model:value="model.confirm"
            type="password"
            show-password-on="click"
            placeholder="确认新密码"
          />
        </n-form-item>

        <n-alert v-if="errorText" type="error" :bordered="false" class="auth-error">
          {{ errorText }}
        </n-alert>

        <n-button type="primary" size="large" block :loading="submitting" @click="submit">
          保存新密码
        </n-button>
      </n-form>

      <button class="auth-link pwd-later" type="button" @click="visible = false">稍后再说</button>
    </div>
  </n-modal>
</template>
