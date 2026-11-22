/*
 * 本地账号与登录态（纯前端）
 * ------------------------------------------------------------------
 * 安全边界：账号、salt、哈希与 token 全部存在浏览器本地，用户可自行
 * 修改 localStorage 绕过，因此这里**不能**当作生产环境鉴权使用，只适合
 * 演示与内部试用。
 *
 * 接入真实后端时：
 *   1. 删除本文件的账号存储与校验逻辑，改为调用登录接口（例如
 *      POST /api/login，服务端负责哈希比对与签发 token）；
 *   2. 只保留 isLoggedIn / getSession / logout 的签名，内部改为校验
 *      服务端签发的 token 或 cookie；
 *   3. 路由守卫、登录页、退出登录都通过本模块访问登录态，无需改动。
 */

const ACCOUNT_KEY = 'bonbon.accounts.v1'
const SESSION_KEY = 'bonbon.session.v1'
const GUARD_KEY = 'bonbon.login-guard.v1'

/* PBKDF2 参数：迭代次数随记录存储，便于以后无痛升级 */
const DEFAULT_ITERATIONS = 150_000
const SALT_BYTES = 16
const KEY_BITS = 256

/* 登录失败策略：连续 5 次失败锁定 5 分钟 */
const MAX_FAILS = 5
const LOCK_MS = 5 * 60 * 1000

/* 会话有效期：勾选"记住我"7 天，否则 8 小时 */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const SESSION_TTL_REMEMBER_MS = 7 * 24 * 60 * 60 * 1000

export const DEFAULT_USERNAME = 'admin'
export const DEFAULT_DISPLAY_NAME = '邢鹏昀'
/*
 * 初始密码刻意设为极短的 123，仅用于演示与内部试用：泄露风险极高，
 * 首次登录必须通过引导修改；生产环境不存在默认密码，账号由后端下发。
 */
export const DEFAULT_PASSWORD = '123'

export interface StoredAccount {
  username: string
  displayName: string
  role: 'admin' | 'staff'
  salt: string
  hash: string
  iterations: number
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
}

export interface Session {
  token: string
  username: string
  displayName: string
  role: StoredAccount['role']
  issuedAt: number
  expiresAt: number
  mustChangePassword: boolean
  remember: boolean
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

const encoder = new TextEncoder()

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin)
}

function randomToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/* PBKDF2-SHA256 派生，salt 每个账号独立随机 */
async function deriveHash(password: string, salt: string, iterations: number): Promise<string> {
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0))
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits'
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes.buffer as ArrayBuffer, iterations },
    baseKey,
    KEY_BITS
  )
  return toBase64(new Uint8Array(bits))
}

function readAccounts(): StoredAccount[] {
  const raw = localStorage.getItem(ACCOUNT_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as StoredAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts))
}

function findAccount(username: string): StoredAccount | undefined {
  const name = username.trim().toLowerCase()
  return readAccounts().find((a) => a.username.toLowerCase() === name)
}

/* 首次使用时初始化默认账号（内部管理系统习惯：不开放自助注册） */
export async function ensureSeeded(): Promise<void> {
  const accounts = readAccounts()
  if (accounts.length > 0) {
    /* 兼容早期版本种下的旧显示名 */
    let dirty = false
    const migrated = accounts.map((a) => {
      if (a.username === DEFAULT_USERNAME && a.displayName === '运营管理员') {
        dirty = true
        return { ...a, displayName: DEFAULT_DISPLAY_NAME, updatedAt: new Date().toISOString() }
      }
      return a
    })
    if (dirty) {
      writeAccounts(migrated)
      const session = getSession()
      if (session && session.username === DEFAULT_USERNAME) {
        persistSession({ ...session, displayName: DEFAULT_DISPLAY_NAME })
      }
    }
    return
  }
  const saltBytes = new Uint8Array(SALT_BYTES)
  crypto.getRandomValues(saltBytes)
  const salt = toBase64(saltBytes)
  const now = new Date().toISOString()
  const account: StoredAccount = {
    username: DEFAULT_USERNAME,
    displayName: DEFAULT_DISPLAY_NAME,
    role: 'admin',
    salt,
    hash: await deriveHash(DEFAULT_PASSWORD, salt, DEFAULT_ITERATIONS),
    iterations: DEFAULT_ITERATIONS,
    mustChangePassword: true,
    createdAt: now,
    updatedAt: now
  }
  writeAccounts([account])
}

/* 初始密码仍未被修改时，登录页才展示提示 */
export function getBootstrapHint(): { username: string; password: string } | null {
  const account = findAccount(DEFAULT_USERNAME)
  if (!account || !account.mustChangePassword) return null
  return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD }
}

interface GuardRecord {
  count: number
  lockedUntil: number
}

function readGuard(): Record<string, GuardRecord> {
  const raw = localStorage.getItem(GUARD_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, GuardRecord>
  } catch {
    return {}
  }
}

function registerFailure(username: string): void {
  const key = username.trim().toLowerCase()
  const guard = readGuard()
  const record = guard[key] ?? { count: 0, lockedUntil: 0 }
  record.count += 1
  if (record.count >= MAX_FAILS) {
    record.lockedUntil = Date.now() + LOCK_MS
    record.count = 0
  }
  guard[key] = record
  localStorage.setItem(GUARD_KEY, JSON.stringify(guard))
}

function resetFailure(username: string): void {
  const guard = readGuard()
  delete guard[username.trim().toLowerCase()]
  localStorage.setItem(GUARD_KEY, JSON.stringify(guard))
}

function isLocked(username: string): boolean {
  const record = readGuard()[username.trim().toLowerCase()]
  return !!record && record.lockedUntil > Date.now()
}

function persistSession(session: Session): void {
  const raw = JSON.stringify(session)
  if (session.remember) {
    localStorage.setItem(SESSION_KEY, raw)
    sessionStorage.removeItem(SESSION_KEY)
  } else {
    sessionStorage.setItem(SESSION_KEY, raw)
    localStorage.removeItem(SESSION_KEY)
  }
}

/**
 * 登录：本地校验 PBKDF2 哈希。
 * 账号不存在与密码错误统一提示，避免枚举账号；锁定提示同样对不存在的账号生效。
 */
export async function login(
  username: string,
  password: string,
  remember: boolean
): Promise<Session> {
  await ensureSeeded()
  const name = username.trim()
  if (!name || !password) throw new AuthError('请输入账号和密码')

  if (isLocked(name)) {
    throw new AuthError('登录失败次数过多，请 5 分钟后再试')
  }

  const account = findAccount(name)
  if (!account) {
    registerFailure(name)
    throw new AuthError('账号或密码错误')
  }

  const hash = await deriveHash(password, account.salt, account.iterations)
  if (hash !== account.hash) {
    registerFailure(name)
    throw new AuthError('账号或密码错误')
  }

  resetFailure(name)
  const now = Date.now()
  const session: Session = {
    token: randomToken(),
    username: account.username,
    displayName: account.displayName,
    role: account.role,
    issuedAt: now,
    expiresAt: now + (remember ? SESSION_TTL_REMEMBER_MS : SESSION_TTL_MS),
    mustChangePassword: account.mustChangePassword,
    remember
  }
  persistSession(session)
  return session
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as Session
    if (!session.expiresAt || session.expiresAt <= Date.now()) {
      clearSession()
      return null
    }
    return session
  } catch {
    clearSession()
    return null
  }
}

export function isLoggedIn(): boolean {
  return getSession() !== null
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function logout(): void {
  clearSession()
}

/* 修改密码：校验旧密码后重新生成 salt + 哈希，并刷新会话标记 */
export async function changePassword(
  username: string,
  currentPassword: string,
  nextPassword: string
): Promise<void> {
  const accounts = readAccounts()
  const index = accounts.findIndex((a) => a.username.toLowerCase() === username.trim().toLowerCase())
  if (index < 0) throw new AuthError('账号不存在')

  const account = accounts[index]
  const currentHash = await deriveHash(currentPassword, account.salt, account.iterations)
  if (currentHash !== account.hash) throw new AuthError('当前密码不正确')

  const saltBytes = new Uint8Array(SALT_BYTES)
  crypto.getRandomValues(saltBytes)
  const salt = toBase64(saltBytes)
  accounts[index] = {
    ...account,
    salt,
    hash: await deriveHash(nextPassword, salt, DEFAULT_ITERATIONS),
    iterations: DEFAULT_ITERATIONS,
    mustChangePassword: false,
    updatedAt: new Date().toISOString()
  }
  writeAccounts(accounts)

  const session = getSession()
  if (session && session.username === account.username) {
    persistSession({ ...session, mustChangePassword: false })
  }
}

export function passwordPolicyError(password: string): string | null {
  if (password.length < 8) return '密码至少 8 位'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return '密码需同时包含字母和数字'
  return null
}
