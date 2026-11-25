import { Suspense, lazy, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Ico from '@/components/Ico'
import EyeRobot from '@/components/EyeRobot'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { departments, isDepartmentKey } from '@/data/org'
import { MIN_PASSWORD_LENGTH, PHONE_RE, registerAccount, type Gender } from '@/utils/auth'
import type { DepartmentKey } from '@/types/domain'
import './RegisterView.css'

/* 与登录页同一套全息背景，按需加载避免首屏 chunk */
const HoloMosaic = lazy(() => import('@/components/HoloMosaic'))

const fieldClass =
  'h-12 rounded-[11px] border-login-border bg-login-field pl-9 text-[13.5px] text-login-ink placeholder:text-login-placeholder hover:border-login-border-hover focus-visible:border-login-focus focus-visible:ring-login-ring'

export default function RegisterView() {
  const navigate = useNavigate()

  const [holoReady, setHoloReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  const [model, setModel] = useState({
    name: '',
    phone: '',
    department: '',
    gender: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    department: '',
    gender: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    document.title = 'Bonbon Admin · 注册'
  }, [])

  useEffect(() => {
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const probe = document.createElement('canvas')
    setHoloReady(!coarse && Boolean(probe.getContext('webgl2')))
  }, [])

  function validate(): boolean {
    const next = {
      name: model.name.trim() ? '' : '请输入姓名',
      phone: PHONE_RE.test(model.phone.trim()) ? '' : '请输入正确的 11 位手机号',
      department: isDepartmentKey(model.department) ? '' : '请选择部门',
      gender: model.gender === 'male' || model.gender === 'female' ? '' : '请选择性别',
      password: model.password.length >= MIN_PASSWORD_LENGTH ? '' : `密码至少 ${MIN_PASSWORD_LENGTH} 位`,
      confirmPassword: !model.confirmPassword
        ? '请再次输入密码'
        : model.confirmPassword === model.password
          ? ''
          : '两次输入的密码不一致'
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (loading) return
    setErrorText('')
    if (!validate()) return

    setLoading(true)
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
      navigate(`/login?account=${encodeURIComponent(model.phone.trim())}`, { replace: true })
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  function goLogin(): void {
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-holo">
        {holoReady ? (
          <Suspense fallback={null}>
            <HoloMosaic
              color="#000000"
              metalColor="#C7CBD3"
              spectrum="full"
              tileSize={1.5}
              gap={0.08}
              scatter={0.3}
              tilt={0.35}
              saturation={0.1}
              intensity={1.25}
              ripple={0.6}
              glitter={0.85}
              sheen={0.8}
              grain={0.08}
              speed={0.5}
              intro={true}
              mouseInteraction={true}
              flipOnClick={true}
              roundness={0.15}
              bevel={0.35}
              rotation={0}
              swirl={1}
              bands={1.3}
              softness={0.5}
              variation={0}
              filter="none"
              filterSize={1}
              fade={0}
              opacity={1}
              mouseStrength={1}
              mouseRadius={0.25}
              lightMode={false}
            />
          </Suspense>
        ) : (
          <div className="auth-holo-fallback"></div>
        )}
      </div>

      <div className="auth-scrim"></div>

      <section className="auth-copy">
        <div className="auth-brand">
          <div className="auth-logo">B</div>
          <div className="auth-brand-text">
            <b>Bonbon Admin</b>
            <span>运营中台</span>
          </div>
        </div>

        <div className="auth-hero-body">
          <div className="auth-kicker">
            <Ico name="sparkle" size={12} /> BONBON BUSINESS
          </div>
          <h1>
            加入星网，
            <br />
            共创万店
          </h1>

          <ul className="auth-points">
            <li>
              <span className="auth-point-ico">
                <Ico name="map" size={14} />
              </span>
              手机号即账号，注册后提交管理员审核
            </li>
            <li>
              <span className="auth-point-ico">
                <Ico name="users" size={14} />
              </span>
              选择所属部门，人员权限由管理员统一开通
            </li>
            <li>
              <span className="auth-point-ico">
                <Ico name="shield" size={14} />
              </span>
              本地演示环境，账号数据仅保存在当前浏览器
            </li>
          </ul>
        </div>

        <div className="auth-hero-foot">© 2026 Bonbon Business · 仅用于视觉方向确认</div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <svg className="auth-beam" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="registerBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#67e8f9" />
              </linearGradient>
            </defs>
            <rect
              className="auth-beam__line"
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx="26"
              pathLength="100"
              stroke="url(#registerBeamGradient)"
            />
          </svg>

          <div className="login-eyes">
            <EyeRobot />
          </div>

          <div className="auth-card-head">
            <h2>创建账号</h2>
            <p>注册后由管理员开通人员权限</p>
          </div>

          <form className="mt-[22px] space-y-3" noValidate onSubmit={submit}>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-login-ink" htmlFor="reg-name">
                姓名
              </label>
              <div className="relative">
                <Ico
                  name="user"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
                />
                <Input
                  id="reg-name"
                  value={model.name}
                  onChange={(e) => {
                    setModel((prev) => ({ ...prev, name: e.target.value }))
                    setErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  className={fieldClass}
                  placeholder="请填写姓名"
                  maxLength={20}
                  autoComplete="name"
                  aria-label="姓名"
                />
              </div>
              {errors.name ? (
                <p className="mt-1.5 text-[11px] font-medium text-destructive-ink">{errors.name}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-login-ink" htmlFor="reg-phone">
                手机号
              </label>
              <div className="relative">
                <Ico
                  name="pulse"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
                />
                <Input
                  id="reg-phone"
                  value={model.phone}
                  onChange={(e) => {
                    setModel((prev) => ({ ...prev, phone: e.target.value }))
                    setErrors((prev) => ({ ...prev, phone: '' }))
                  }}
                  className={fieldClass}
                  placeholder="11 位手机号，作为登录账号"
                  inputMode="numeric"
                  maxLength={11}
                  autoComplete="tel"
                  aria-label="手机号"
                />
              </div>
              {errors.phone ? (
                <p className="mt-1.5 text-[11px] font-medium text-destructive-ink">{errors.phone}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-login-ink" htmlFor="reg-dept">
                部门
              </label>
              <div className="relative">
                <Ico
                  name="box"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
                />
                <select
                  id="reg-dept"
                  value={model.department}
                  onChange={(e) => {
                    setModel((prev) => ({ ...prev, department: e.target.value }))
                    setErrors((prev) => ({ ...prev, department: '' }))
                  }}
                  className={`${fieldClass} cursor-pointer pr-8`}
                  aria-label="部门"
                >
                  <option value="" disabled>
                    请选择部门
                  </option>
                  {departments.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department ? (
                <p className="mt-1.5 text-[11px] font-medium text-destructive-ink">{errors.department}</p>
              ) : null}
            </div>

            <div>
              <span className="mb-1.5 block text-[11px] font-semibold text-login-ink">性别</span>
              <div className="gender-grid">
                <button
                  type="button"
                  className={`gender-option${model.gender === 'male' ? ' on' : ''}`}
                  onClick={() => {
                    setModel((prev) => ({ ...prev, gender: 'male' }))
                    setErrors((prev) => ({ ...prev, gender: '' }))
                  }}
                >
                  男
                </button>
                <button
                  type="button"
                  className={`gender-option${model.gender === 'female' ? ' on' : ''}`}
                  onClick={() => {
                    setModel((prev) => ({ ...prev, gender: 'female' }))
                    setErrors((prev) => ({ ...prev, gender: '' }))
                  }}
                >
                  女
                </button>
              </div>
              {errors.gender ? (
                <p className="mt-1.5 text-[11px] font-medium text-destructive-ink">{errors.gender}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-login-ink" htmlFor="reg-password">
                密码
              </label>
              <div className="relative">
                <Ico
                  name="shield"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
                />
                <Input
                  id="reg-password"
                  value={model.password}
                  onChange={(e) => {
                    setModel((prev) => ({ ...prev, password: e.target.value }))
                    setErrors((prev) => ({ ...prev, password: '' }))
                  }}
                  type={showPassword ? 'text' : 'password'}
                  className={`${fieldClass} pr-14`}
                  placeholder={`至少 ${MIN_PASSWORD_LENGTH} 位`}
                  autoComplete="new-password"
                  aria-label="密码"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-login-placeholder transition-colors hover:text-login-ink"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? '隐藏' : '显示'}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1.5 text-[11px] font-medium text-destructive-ink">{errors.password}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-login-ink" htmlFor="reg-confirm">
                确认密码
              </label>
              <div className="relative">
                <Ico
                  name="shield"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
                />
                <Input
                  id="reg-confirm"
                  value={model.confirmPassword}
                  onChange={(e) => {
                    setModel((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                  }}
                  type={showPassword ? 'text' : 'password'}
                  className={`${fieldClass} pr-14`}
                  placeholder="再次输入密码"
                  autoComplete="new-password"
                  aria-label="确认密码"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-login-placeholder transition-colors hover:text-login-ink"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? '隐藏' : '显示'}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="mt-1.5 text-[11px] font-medium text-destructive-ink">{errors.confirmPassword}</p>
              ) : null}
            </div>

            {errorText ? (
              <Alert variant="error" className="mb-1">
                {errorText}
              </Alert>
            ) : null}

            <Button type="submit" size="lg" block className="auth-submit" loading={loading}>
              {loading ? '提交中…' : '注册并提交审核'}
            </Button>
          </form>

          <p className="mt-4 text-center text-[12px] text-login-ink">
            已有账号？
            <button type="button" className="auth-link" onClick={goLogin}>
              返回登录
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
