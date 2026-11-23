<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInst, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import Ico from '@/components/Ico.vue'
import EyeRobot from '@/components/EyeRobot.vue'
import { ensureSeeded, getBootstrapHint, login } from '@/utils/auth'

/* Vue Bits 官方 HoloMosaic（WebGL2）按需加载，避免进入首屏 chunk */
const HoloMosaic = defineAsyncComponent(() => import('@/components/HoloMosaic.vue'))

const route = useRoute()
const router = useRouter()
const message = useMessage()

/* WebGL2 与指针能力探测：触屏 / 不支持时回退静态渐变 */
const holoReady = ref(false)

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const errorText = ref('')
const bootstrap = ref<{ username: string; password: string } | null>(null)

const model = reactive({
  account: 'admin',
  password: '123',
  remember: true
})

const rules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: ['input', 'blur'] }],
  password: [{ required: true, message: '请输入密码', trigger: ['input', 'blur'] }]
}

onMounted(async () => {
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  const probe = document.createElement('canvas')
  holoReady.value = !coarse && Boolean(probe.getContext('webgl2'))
  await ensureSeeded()
  bootstrap.value = getBootstrapHint()
})

async function submit(): Promise<void> {
  if (loading.value) return
  errorText.value = ''
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    /* 本地校验：PBKDF2-SHA256 + 每账号独立 salt，见 utils/auth.ts 顶部说明 */
    const session = await login(model.account, model.password, model.remember)
    message.success(`欢迎回来，${session.displayName}`)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    await router.replace(redirect)
  } catch (err) {
    errorText.value = err instanceof Error ? err.message : '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function forgot(): void {
  message.info('演示环境请在代码中重置本地账号，或联系系统管理员', { duration: 2600 })
}
</script>

<template>
  <div class="auth-page">
    <!-- 全屏全息背景层：马赛克铺满整个视口 -->
    <div class="auth-holo">
        <HoloMosaic
          v-if="holoReady"
          color="#000000"
          metal-color="#10B981"
          spectrum="full"
          :tile-size="1.5"
          :gap="0.08"
          :scatter="0.3"
          :tilt="0.35"
          :saturation="0.1"
          :intensity="1.25"
          :ripple="0.6"
          :glitter="0.85"
          :sheen="0.8"
          :grain="0.08"
          :speed="0.5"
          :intro="true"
          :mouse-interaction="true"
          :flip-on-click="true"
          :roundness="0.15"
          :bevel="0.35"
          :rotation="0"
          :swirl="1"
          :bands="1.3"
          :softness="0.5"
          :variation="0"
          filter="none"
          :filter-size="1"
          :fade="0"
          :opacity="1"
          :mouse-strength="1"
          :mouse-radius="0.25"
          :light-mode="false"
        />
        <div v-else class="auth-holo-fallback"></div>
      </div>

      <div class="auth-scrim"></div>

    <!-- 品牌文案覆盖层：限制在左侧安全区，不压住居中的卡片 -->
    <section class="auth-copy">
      <div class="auth-brand">
        <div class="auth-logo">B</div>
        <div class="auth-brand-text">
          <b>Bonbon Admin</b>
          <span>运营中台</span>
        </div>
      </div>

      <div class="auth-hero-body">
        <div class="auth-kicker"><Ico name="sparkle" :size="12" /> BONBON BUSINESS</div>
        <h1>星随光动，<br />万店共生</h1>
        <p>门店分布、阶段进度与待办协同，集中在一个工作台里。</p>

        <ul class="auth-points">
          <li>
            <span class="auth-point-ico"><Ico name="map" :size="14" /></span>
            全国门店分布，一屏掌握覆盖与密度
          </li>
          <li>
            <span class="auth-point-ico"><Ico name="users" :size="14" /></span>
            主责 / 协办分层，S1–S11 全链路协同
          </li>
          <li>
            <span class="auth-point-ico"><Ico name="shield" :size="14" /></span>
            权限与数据口径统一，减少重复核对
          </li>
        </ul>
      </div>

      <div class="auth-hero-foot">© 2026 Bonbon Business · 仅用于视觉方向确认</div>
    </section>

    <!-- 登录卡片：相对整个视口居中 -->
    <section class="auth-panel">
      <div class="auth-card">
        <div class="login-eyes"><EyeRobot /></div>

        <div class="auth-card-head">
          <h2>欢迎回来</h2>
          <p>登录后进入运营工作台</p>
        </div>

        <n-form
          ref="formRef"
          :model="model"
          :rules="rules"
          :show-label="false"
          size="large"
          @keyup.enter="submit"
        >
          <n-form-item path="account">
            <n-input
              v-model:value="model.account"
              placeholder="账号"
              :input-props="{ autocomplete: 'username' }"
            >
              <template #prefix><Ico name="user" :size="15" /></template>
            </n-input>
          </n-form-item>

          <n-form-item path="password">
            <n-input
              v-model:value="model.password"
              type="password"
              show-password-on="click"
              placeholder="密码"
              :input-props="{ autocomplete: 'current-password' }"
            >
              <template #prefix><Ico name="shield" :size="15" /></template>
            </n-input>
          </n-form-item>

          <div class="auth-row">
            <n-checkbox v-model:checked="model.remember">记住我</n-checkbox>
            <button class="auth-link" type="button" @click="forgot">忘记密码？</button>
          </div>

          <n-alert v-if="errorText" type="error" :bordered="false" class="auth-error">
            {{ errorText }}
          </n-alert>

          <n-button type="primary" size="large" block attr-type="button" :loading="loading" @click="submit">
            {{ loading ? '登录中…' : '登录' }}
          </n-button>
        </n-form>

        <p v-if="bootstrap" class="auth-hint">
          默认账号 <b>{{ bootstrap.username }}</b> ／ 初始密码 <b>{{ bootstrap.password }}</b>
        </p>
        <p v-else class="auth-hint">请使用系统管理员分配的账号登录</p>
        <p class="auth-notice">仅用于演示与内部试用。纯前端校验可被本地篡改，不能作为生产环境鉴权。</p>
      </div>
    </section>
  </div>
</template>
