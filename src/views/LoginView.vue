<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Ico from '@/components/Ico.vue'
import EyeRobot from '@/components/EyeRobot.vue'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { toast } from '@/composables/useToast'
import { ensureSeeded, login } from '@/utils/auth'

/* Vue Bits 官方 HoloMosaic（WebGL2）按需加载，避免进入首屏 chunk */
const HoloMosaic = defineAsyncComponent(() => import('@/components/HoloMosaic.vue'))

const route = useRoute()
const router = useRouter()

/* WebGL2 与指针能力探测：触屏 / 不支持时回退静态渐变 */
const holoReady = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorText = ref('')

const model = reactive({
  account: 'admin',
  password: '123',
  remember: true
})

const errors = reactive({ account: '', password: '' })

/* 玻璃卡里的输入框：颜色全部走 Tailwind 令牌，不外露色值 */
const fieldClass =
  'h-11 rounded-[10px] border-login-border bg-login-field pl-9 text-[13px] text-login-ink placeholder:text-login-placeholder hover:border-login-border-hover focus-visible:border-login-focus focus-visible:ring-login-ring'

onMounted(async () => {
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  const probe = document.createElement('canvas')
  holoReady.value = !coarse && Boolean(probe.getContext('webgl2'))
  await ensureSeeded()
})

function validate(): boolean {
  errors.account = model.account.trim() ? '' : '请输入账号'
  errors.password = model.password ? '' : '请输入密码'
  return !errors.account && !errors.password
}

async function submit(): Promise<void> {
  if (loading.value) return
  errorText.value = ''
  if (!validate()) return

  loading.value = true
  try {
    /* 本地校验：PBKDF2-SHA256 + 每账号独立 salt，见 utils/auth.ts 顶部说明 */
    const session = await login(model.account, model.password, model.remember)
    toast(`欢迎回来，${session.displayName}`, 'success')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    await router.replace(redirect)
  } catch (err) {
    errorText.value = err instanceof Error ? err.message : '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function forgot(): void {
  toast('演示环境请在代码中重置本地账号，或联系系统管理员', 'info', 2600)
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
        <!-- 外沿流光：SVG 描边沿卡片轮廓环行，粗细恒定 -->
        <svg class="auth-beam" aria-hidden="true" focusable="false">
          <rect class="auth-beam__tail-1" x="0" y="0" width="100%" height="100%" rx="26" pathLength="100" />
          <rect class="auth-beam__tail-2" x="0" y="0" width="100%" height="100%" rx="26" pathLength="100" />
          <rect class="auth-beam__mid" x="0" y="0" width="100%" height="100%" rx="26" pathLength="100" />
          <rect class="auth-beam__head" x="0" y="0" width="100%" height="100%" rx="26" pathLength="100" />
        </svg>

        <div class="login-eyes"><EyeRobot /></div>

        <div class="auth-card-head">
          <h2>欢迎回来</h2>
          <p>登录后进入运营工作台</p>
        </div>

        <form class="mt-[22px] space-y-3" novalidate @submit.prevent="submit">
          <div>
            <div class="relative">
              <Ico
                name="user"
                :size="15"
                class="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
              />
              <Input
                v-model="model.account"
                :class="fieldClass"
                placeholder="账号"
                autocomplete="username"
                aria-label="账号"
                @update:model-value="errors.account = ''"
              />
            </div>
            <p v-if="errors.account" class="mt-1.5 text-[11px] font-medium text-destructive-ink">
              {{ errors.account }}
            </p>
          </div>

          <div>
            <div class="relative">
              <Ico
                name="shield"
                :size="15"
                class="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
              />
              <Input
                v-model="model.password"
                :type="showPassword ? 'text' : 'password'"
                :class="`${fieldClass} pr-14`"
                placeholder="密码"
                autocomplete="current-password"
                aria-label="密码"
                @update:model-value="errors.password = ''"
              />
              <button
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-login-placeholder transition-colors hover:text-login-ink"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '隐藏' : '显示' }}
              </button>
            </div>
            <p v-if="errors.password" class="mt-1.5 text-[11px] font-medium text-destructive-ink">
              {{ errors.password }}
            </p>
          </div>

          <div class="auth-row">
            <label class="flex cursor-pointer items-center gap-2 text-[12px] text-login-ink">
              <Checkbox v-model="model.remember" />
              记住我
            </label>
            <button class="auth-link" type="button" @click="forgot">忘记密码？</button>
          </div>

          <Alert v-if="errorText" variant="error" class="mb-3">{{ errorText }}</Alert>

          <Button type="submit" size="lg" block :loading="loading">
            {{ loading ? '登录中…' : '登录' }}
          </Button>
        </form>
      </div>
    </section>
  </div>
</template>
