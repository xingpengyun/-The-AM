import { Suspense, lazy, useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Ico from '@/components/Ico'
import EyeRobot from '@/components/EyeRobot'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { ensureSeeded, login } from '@/utils/auth'

/* Vue Bits 官方 HoloMosaic（WebGL2）按需加载，避免进入首屏 chunk */
const HoloMosaic = lazy(() => import('@/components/HoloMosaic'))

/* 默认 vivid 极光：紫 → 青 → 浅青，跨度更大 */
const BEAM_STOPS: [string, string, string] = ['#7c3aed', '#06b6d4', '#67e8f9']

/* 玻璃卡里的输入框：颜色全部走 Tailwind 令牌，不外露色值 */
const fieldClass =
  'h-12 rounded-[11px] border-login-border bg-login-field pl-9 text-[13.5px] text-login-ink placeholder:text-login-placeholder hover:border-login-border-hover focus-visible:border-login-focus focus-visible:ring-login-ring'

export default function LoginView() {
  const location = useLocation()
  const navigate = useNavigate()

  /* WebGL2 与指针能力探测：触屏 / 不支持时回退静态渐变 */
  const [holoReady, setHoloReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  const initialAccount = new URLSearchParams(location.search).get('account') ?? ''
  const [model, setModel] = useState({
    account: initialAccount || 'admin',
    password: initialAccount ? '' : '123',
    remember: true
  })
  const [errors, setErrors] = useState({ account: '', password: '' })

  useEffect(() => {
    document.title = 'Bonbon Admin · 登录'
  }, [])

  useEffect(() => {
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const probe = document.createElement('canvas')
    setHoloReady(!coarse && Boolean(probe.getContext('webgl2')))
    void ensureSeeded()
  }, [])

  function validate(): boolean {
    const next = {
      account: model.account.trim() ? '' : '请输入账号',
      password: model.password ? '' : '请输入密码'
    }
    setErrors(next)
    return !next.account && !next.password
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (loading) return
    setErrorText('')
    if (!validate()) return

    setLoading(true)
    try {
      /* 本地校验：PBKDF2-SHA256 + 每账号独立 salt，见 utils/auth.ts 顶部说明 */
      const session = await login(model.account, model.password, model.remember)
      toast(`欢迎回来，${session.displayName}`, 'success')
      const redirect = new URLSearchParams(location.search).get('redirect') || '/home'
      navigate(redirect, { replace: true })
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  function forgot(): void {
    toast('演示环境请在代码中重置本地账号，或联系系统管理员', 'info', 2600)
  }

  function goRegister(): void {
    navigate('/register')
  }

  return (
    <div className="auth-page">
      {/* 全屏全息背景层：马赛克铺满整个视口 */}
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

      {/* 品牌文案覆盖层：限制在左侧安全区，不压住居中的卡片 */}
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
            星随光动，
            <br />
            万店共生
          </h1>

          <ul className="auth-points">
            <li>
              <span className="auth-point-ico">
                <Ico name="map" size={14} />
              </span>
              全国门店分布，一屏掌握覆盖与密度
            </li>
            <li>
              <span className="auth-point-ico">
                <Ico name="users" size={14} />
              </span>
              主责 / 协办分层，S1–S11 全链路协同
            </li>
            <li>
              <span className="auth-point-ico">
                <Ico name="shield" size={14} />
              </span>
              权限与数据口径统一，减少重复核对
            </li>
          </ul>
        </div>

        <div className="auth-hero-foot">© 2026 Bonbon Business · 仅用于视觉方向确认</div>
      </section>

      {/* 登录卡片：相对整个视口居中 */}
      <section className="auth-panel">
        <div className="auth-card">
          {/* 外沿流光：单条等宽描边，颜色由沿光束方向的三段色标渐变承载 */}
          <svg className="auth-beam" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="authBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={BEAM_STOPS[0]} />
                <stop offset="50%" stopColor={BEAM_STOPS[1]} />
                <stop offset="100%" stopColor={BEAM_STOPS[2]} />
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
              stroke="url(#authBeamGradient)"
            />
          </svg>

          <div className="login-eyes">
            <EyeRobot />
          </div>

          <div className="auth-card-head">
            <h2>欢迎回来</h2>
            <p>登录后进入运营工作台</p>
          </div>

          <form className="mt-[24px] space-y-3.5" noValidate onSubmit={submit}>
            <div>
              <div className="relative">
                <Ico
                  name="user"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
                />
                <Input
                  value={model.account}
                  onChange={(e) => {
                    setModel((prev) => ({ ...prev, account: e.target.value }))
                    setErrors((prev) => ({ ...prev, account: '' }))
                  }}
                  className={fieldClass}
                  placeholder="账号"
                  autoComplete="username"
                  aria-label="账号"
                />
              </div>
              {errors.account ? (
                <p className="mt-1.5 text-[11px] font-medium text-destructive-ink">{errors.account}</p>
              ) : null}
            </div>

            <div>
              <div className="relative">
                <Ico
                  name="shield"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-login-placeholder"
                />
                <Input
                  value={model.password}
                  onChange={(e) => {
                    setModel((prev) => ({ ...prev, password: e.target.value }))
                    setErrors((prev) => ({ ...prev, password: '' }))
                  }}
                  type={showPassword ? 'text' : 'password'}
                  className={`${fieldClass} pr-14`}
                  placeholder="密码"
                  autoComplete="current-password"
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

            <div className="auth-row">
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-login-ink">
                <Checkbox
                  checked={model.remember}
                  onCheckedChange={(checked) => setModel((prev) => ({ ...prev, remember: checked }))}
                />
                记住我
              </label>
              <button className="auth-link" type="button" onClick={forgot}>
                忘记密码？
              </button>
            </div>

            {errorText ? (
              <Alert variant="error" className="mb-3">
                {errorText}
              </Alert>
            ) : null}

            <Button type="submit" size="lg" block className="auth-submit" loading={loading}>
              {loading ? '登录中…' : '登录'}
            </Button>
          </form>

          <p className="mt-4 text-center text-[12px] text-login-ink">
            还没有账号？
            <button type="button" className="auth-link" onClick={goRegister}>
              立即注册
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
