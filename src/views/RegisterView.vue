<script setup lang="ts">
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Ico from '@/components/Ico.vue'
import EyeRobot from '@/components/EyeRobot.vue'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/composables/useToast'
import { departments, isDepartmentKey } from '@/data/org'
import {
  MIN_PASSWORD_LENGTH,
  PHONE_RE,
  registerAccount,
  type Gender
} from '@/utils/auth'
import type { DepartmentKey } from '@/types/domain'

/* 与登录页同一套全息背景，按需加载避免首屏 chunk */
const HoloMosaic = defineAsyncComponent(() => import('@/components/HoloMosaic.vue'))

const router = useRouter()

const holoReady = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorText = ref('')

const model = reactive({
  name: '',
  phone: '',
  department: '',
  gender: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  name: '',
  phone: '',
  department: '',
  gender: '',
  password: '',
  confirmPassword: ''
})

/* 与登录页一致的玻璃卡输入框样式 */
const fieldClass =
  'h-12 rounded-[11px] border-login-border bg-login-field pl-9 text-[13.5px] text-login-ink placeholder:text-login-placeholder hover:border-login-border-hover focus-visible:border-login-focus focus-visible:ring-login-ring'

onMounted(() => {
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  const probe = document.createElement('canvas')
  holoReady.value = !coarse && Boolean(probe.getContext('webgl2'))
})

function validate(): boolean {
  errors.name = model.name.trim() ? '' : '请输入姓名'
  errors.phone = PHONE_RE.test(model.phone.trim()) ? '' : '请输入正确的 11 位手机号'
  errors.department = isDepartmentKey(model.department) ? '' : '请选择部门'
  errors.gender = model.gender === 'male' || model.gender === 'female' ? '' : '请选择性别'
  errors.password =
    model.password.length >= MIN_PASSWORD_LENGTH ? '' : `密码至少 ${MIN_PASSWORD_LENGTH} 位`
  errors.confirmPassword = !model.confirmPassword
    ? '请再次输入密码'
    : model.confirmPassword === model.password
      ? ''
      : '两次输入的密码不一致'
  return !Object.values(errors).some(Boolean)
}

async function submit(): Promise<void> {
  if (loading.value) return
  errorText.value = ''
  if (!validate()) return

  loading.value = true
  try {
    const department = model.department as DepartmentKey
    const gender = model.gender as Gender
    await registerAccount({
      name: model.name.trim(),
      phone: model.phone.trim(),
      password: model.password,
      department,
      gender
    })
    toast('注册成功，待管理员开通权限', 'success', 3200)
    await router.replace({ name: 'login', query: { account: model.phone.trim() } })
  } catch (err) {
    errorText.value = err instanceof Error ? err.message : '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function goLogin(): void {
  router.push('/login')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-holo">
      <HoloMosaic
        v-if="holoReady"
        color="#000000"
        metal-color="#C7CBD3"
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
        <h1>加入星网，<br />共创万店</h1>

        <ul class="auth-points">
          <li>
            <span class="auth-point-ico"><Ico name="map" :size="14" /></span>
            手机号即账号，注册后提交管理员审核
          </li>
          <li>
            <span class="auth-point-ico"><Ico name="users" :size="14" /></span>
            选择所属部门，人员权限由管理员统一开通
          </li>
          <li>
            <span class="auth-point-ico"><Ico name="shield" :size="14" /></span>
            本地演示环境，账号数据仅保存在当前浏览器
          </li>
        </ul>
      </div>

      <div class="auth-hero-foot">© 2026 Bonbon Business · 仅用于视觉方向确认</div>
    </section>

    <section class="auth-panel">
      <div class="auth-card">
        <svg class="auth-beam" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="registerBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#7c3aed" />
              <stop offset="50%" stop-color="#06b6d4" />
              <stop offset="100%" stop-color="#67e8f9" />
            </linearGradient>
          </defs>
          <rect
            class="auth-beam__line"
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx="26"
            pathLength="100"
            stroke="url(#registerBeamGradient)"
          />
        </svg>

        <div class="login-eyes"><EyeRobot /></div>

        <div class="auth-card-head">
          <h2>创建账号</h2>
          <p>注册后由管理员开通人员权限</p>
        </div>

        <form class="mt-[22px] space-y-3" novalidate @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-login-ink" for="reg-name">姓名</label>
            <div class="relative">
              <Ico
                name="user"
                :size="15"
                class="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
              />
              <Input
                id="reg-name"
                v-model="model.name"
                :class="fieldClass"
                placeholder="请填写姓名"
                maxlength="20"
                autocomplete="name"
                aria-label="姓名"
                @update:model-value="errors.name = ''"
              />
            </div>
            <p v-if="errors.name" class="mt-1.5 text-[11px] font-medium text-destructive-ink">
              {{ errors.name }}
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-login-ink" for="reg-phone">手机号</label>
            <div class="relative">
              <Ico
                name="pulse"
                :size="15"
                class="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
              />
              <Input
                id="reg-phone"
                v-model="model.phone"
                :class="fieldClass"
                placeholder="11 位手机号，作为登录账号"
                inputmode="numeric"
                maxlength="11"
                autocomplete="tel"
                aria-label="手机号"
                @update:model-value="errors.phone = ''"
              />
            </div>
            <p v-if="errors.phone" class="mt-1.5 text-[11px] font-medium text-destructive-ink">
              {{ errors.phone }}
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-login-ink" for="reg-dept">部门</label>
            <div class="relative">
              <Ico
                name="box"
                :size="15"
                class="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
              />
              <select
                id="reg-dept"
                v-model="model.department"
                :class="`${fieldClass} cursor-pointer pr-8`"
                aria-label="部门"
                @change="errors.department = ''"
              >
                <option value="" disabled>请选择部门</option>
                <option v-for="d in departments" :key="d.key" :value="d.key">{{ d.name }}</option>
              </select>
            </div>
            <p v-if="errors.department" class="mt-1.5 text-[11px] font-medium text-destructive-ink">
              {{ errors.department }}
            </p>
          </div>

          <div>
            <span class="mb-1.5 block text-[11px] font-semibold text-login-ink">性别</span>
            <div class="gender-grid">
              <button
                type="button"
                class="gender-option"
                :class="{ on: model.gender === 'male' }"
                @click="model.gender = 'male'; errors.gender = ''"
              >男</button>
              <button
                type="button"
                class="gender-option"
                :class="{ on: model.gender === 'female' }"
                @click="model.gender = 'female'; errors.gender = ''"
              >女</button>
            </div>
            <p v-if="errors.gender" class="mt-1.5 text-[11px] font-medium text-destructive-ink">
              {{ errors.gender }}
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-login-ink" for="reg-password">密码</label>
            <div class="relative">
              <Ico
                name="shield"
                :size="15"
                class="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
              />
              <Input
                id="reg-password"
                v-model="model.password"
                :type="showPassword ? 'text' : 'password'"
                :class="`${fieldClass} pr-14`"
                :placeholder="`至少 ${MIN_PASSWORD_LENGTH} 位`"
                autocomplete="new-password"
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

          <div>
            <label class="mb-1.5 block text-[11px] font-semibold text-login-ink" for="reg-confirm">确认密码</label>
            <div class="relative">
              <Ico
                name="shield"
                :size="15"
                class="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
              />
              <Input
                id="reg-confirm"
                v-model="model.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                :class="`${fieldClass} pr-14`"
                placeholder="再次输入密码"
                autocomplete="new-password"
                aria-label="确认密码"
                @update:model-value="errors.confirmPassword = ''"
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
            <p v-if="errors.confirmPassword" class="mt-1.5 text-[11px] font-medium text-destructive-ink">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <Alert v-if="errorText" variant="error" class="mb-1">{{ errorText }}</Alert>

          <Button type="submit" size="lg" block class="auth-submit" :loading="loading">
            {{ loading ? '提交中…' : '注册并提交审核' }}
          </Button>
        </form>

        <p class="mt-4 text-center text-[12px] text-login-ink">
          已有账号？
          <button type="button" class="auth-link" @click="goLogin">返回登录</button>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gender-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.gender-option {
  height: 44px;
  border: 1px solid var(--login-border);
  border-radius: 11px;
  background: var(--login-field);
  color: var(--login-ink);
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.18s var(--ease), border-color 0.18s var(--ease), color 0.18s var(--ease);
}
.gender-option:hover {
  border-color: var(--login-border-hover);
}
.gender-option.on {
  background: var(--brand);
  border-color: var(--brand);
  color: #ffffff;
}
</style>
