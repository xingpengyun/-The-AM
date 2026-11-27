# AGENTS.md

本文件为 AI 编码助手提供本项目的上下文与约定。修改代码前请先阅读。

## 项目概览

**Bonbon Admin** —— 连锁门店运营管理后台（加盟全链路 S1–S11 阶段看板）。当前为纯前端演示项目，数据与账号均为本地模拟，无后端接口。

## 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器（http://127.0.0.1:5173）
npm run type-check   # TypeScript 类型检查（tsc --noEmit）
npm run build        # 类型检查 + 生产构建
npm run preview      # 预览构建产物
```

提交前至少保证 `npm run type-check` 通过。

## 技术栈

- **React 19** + **TypeScript 6**（`jsx: react-jsx`）
- **Vite 6**（`@vitejs/plugin-react`）
- **React Router 7**（`react-router-dom`，`BrowserRouter` 模式）
- **Tailwind CSS v4**（通过 `@tailwindcss/vite` 插件，**无 `tailwind.config.ts`**）
- **shadcn/ui 风格组件**（`new-york` 风格）+ **Radix UI** 原语 + **CVA** 变体
- **ECharts 6** 图表
- 别名 `@/*` → `src/*`（vite.config.ts 与 tsconfig.json 同步配置）

## 目录结构

```
src/
├── main.tsx              # 入口：initTheme → createRoot → BrowserRouter
├── App.tsx               # 主壳布局：SideNav + TopBar + StageAxis + Outlet
├── router.tsx            # 路由表与守卫（RequireAuth / AdminGuard / DeptGuard / GlobalGuard）
├── assets/               # 静态资源（china.json 地图、品牌 logo）
├── components/
│   ├── SideNav.tsx       # 深色浮起圆角侧栏（含选中胶囊 SVG 路径）
│   ├── TopBar.tsx        # 顶栏：面包屑、搜索、主题切换、用户菜单
│   ├── StageAxis.tsx     # 顶部 S1–S11 阶段轴
│   ├── ProvinceMap.tsx   # 门店地图（GeoJSON 手绘 + ECharts）
│   ├── HoloMosaic.tsx    # 全息马赛克视觉组件
│   ├── Ico.tsx           # 图标组件（图标名集中定义于 data/icons.ts）
│   └── ui/               # shadcn 风格基础组件（button/card/badge/tooltip/toast/…）
├── data/
│   ├── org.ts            # ★ 部门 / 阶段 / 工序的唯一数据源
│   ├── business.ts       # 门店、订单等演示业务数据
│   └── icons.ts          # 图标名 → 路径映射
├── lib/
│   ├── theme.ts          # 深浅主题（data-theme + .dark，useSyncExternalStore）
│   ├── toast.ts          # 全局提示队列
│   ├── route-order.ts    # 路由顺序 → 页面切换方向
│   ├── palette.ts        # ECharts 调色盘
│   └── utils.ts          # cn() = clsx + tailwind-merge
├── styles/
│   ├── tailwind.css      # Tailwind v4 入口 + 设计令牌 + @theme inline 映射
│   ├── base.css          # 基础版式、布局骨架、侧栏、地图卡等 semantic 令牌
│   └── extra.css         # 补充样式
├── types/domain.ts       # 领域类型（Department / Stage / Process / GeoJSON）
├── utils/auth.ts         # 本地账号与登录态（localStorage，仅演示用）
└── views/                # 页面：登录 / 注册 / 首页 / 总览 / 部门 / 阶段 / 待办 / 设置 / 权限
```

## 编码约定

### TypeScript

`tsconfig.json` 开启了严格选项，写代码时必须满足：

- `strict`、`noUnusedLocals`、`noUnusedParameters`、`noImplicitReturns`、`noImplicitOverride`
- `verbatimModuleSyntax: true` —— 仅类型导入必须写 `import type { X } from '...'`，否则构建报错
- `isolatedModules: true` —— 禁止 `export =` 等非 ESM 语法

### 数据层

- **部门（9 个）、阶段（S1–S11）、工序** 全部集中在 [src/data/org.ts](file:///C:/Users/Hp/Documents/Trae-CN/temp_20261124_01/src/data/org.ts)，不要在页面里硬编码名称、顺序或部门归属。
- 部门 `key` 同时是路由 slug（如 `zhaoshang` → `/dept/zhaoshang`）。新增部门需同步修改 `types/domain.ts` 的 `DepartmentKey` 联合类型。
- 阶段固定 S1–S11，路由为 `/dept/:dept/stage/:stage`（`s1`…`s11`）。
- 工序的 `owner`（主责）与 `co`（协办）决定部门页可见范围：`processesOfDepartment()` 只返回相关工序，跨部门工序按只读来源呈现。

### 路由与权限

- 已登录用户守卫：`RequireAuth`；登录/注册页：`PublicOnly`。
- 全局视图（`/home`、`/overview`）对受限账号隐藏，`GlobalGuard` 会跳转到其第一个授权部门。
- `/settings/permissions` 仅 `role === 'admin'` 可进（`AdminGuard`）。
- 非法的 `dept` / `stage` 参数由 `DeptGuard` 回落或重定向，不抛错。
- 页面标题与滚动复位集中在 [src/App.tsx](file:///C:/Users/Hp/Documents/Trae-CN/temp_20261124_01/src/App.tsx) 的 `useEffect` 中处理。

### 认证

[src/utils/auth.ts](file:///C:/Users/Hp/Documents/Trae-CN/temp_20261124_01/src/utils/auth.ts) 是**纯前端演示实现**：账号、PBKDF2 哈希、token 全部存 `localStorage`，可被用户篡改，不得当作生产鉴权。

- 默认管理员：`admin` / `123`（首次访问自动播种）
- 自助注册的账号默认 `permission: 'pending'`，需管理员在「人员权限」页开通
- 登录失败 5 次锁定 5 分钟；会话 8 小时（勾选记住我 7 天）
- 接真实后端时：保留 `isLoggedIn` / `getSession` / `logout` 的签名，替换内部实现为服务端 token 校验，路由守卫无需改动

### 样式与设计令牌

- 颜色、阴影、圆角、动效**一律走 CSS 变量**，禁止在组件中散落十六进制色值。
- 两处令牌来源：
  - [src/styles/tailwind.css](file:///C:/Users/Hp/Documents/Trae-CN/temp_20261124_01/src/styles/tailwind.css) —— shadcn 语义令牌（`--primary`、`--border`、`--tone-*`、`--candy-*`），并通过 `@theme inline` 映射为 Tailwind 工具类
  - [src/styles/base.css](file:///C:/Users/Hp/Documents/Trae-CN/temp_20261124_01/src/styles/base.css) —— 布局与组件级语义令牌（`--paper`、`--surface`、`--rail-*`、`--nav-pill-*`、`--topbar-bg` 等）
- 主题切换：根节点 `data-theme="dark"` + `.dark` 类；深浅两套令牌都必须在两处 CSS 中同时补全，否则深色下会出现不可读或色差。
- 主界面底色统一为 `--paper`，侧栏「缺口」与内容区必须同色，避免出现色差或黑弧。
- 主题读取用 `useTheme()`（`useSyncExternalStore`），不要在组件里直接读 `localStorage`。
- 动效保持克制：入场 `rise`、页面切换水平平移 + 淡入，且必须尊重 `prefers-reduced-motion`。
- Tailwind v4 无配置文件，自定义令牌需写在 `@theme inline` 里才能生成工具类。

### UI 组件

- `src/components/ui/*` 为 shadcn 风格本地组件（非 npm 包），可直接改写。
- 变体统一用 `cva` 定义，类名合并统一用 `cn()`（[src/lib/utils.ts](file:///C:/Users/Hp/Documents/Trae-CN/temp_20261124_01/src/lib/utils.ts)）。
- 图标使用项目自定义的 `Ico`（名称集中在 `data/icons.ts`），不引入 lucide-react 等外部图标包。
- 组件优先使用 Radix 原语保证可访问性（键盘、焦点环、aria）。

## 修改时禁止

- 不引入新的 UI 框架（如 Ant Design、MUI、Naive UI）或 CSS-in-JS 方案。
- 不新增 `tailwind.config.ts` / `postcss.config.js`（Tailwind v4 由 Vite 插件接管）。
- 不把演示数据写进组件；业务数据统一放 `src/data/`。
- 不破坏现有信息架构与信息密度（侧栏分组、阶段轴、地图、待办、权限页）。
- 不在代码里提交密钥、token 或真实个人凭据。
- 不修改 `node_modules/`、`dist/`（已在 `.gitignore` 中排除）。

## 视觉基线

- 深色浮起圆角竖条侧栏，默认仅图标 + 小字标签，选中项为与页面同色的胶囊块，右侧有反向圆角缺口。
- 主内容区通栏布局（只扣除侧栏宽度），不居中限宽。
- 深浅主题均需保证对比度：深色下边框、次级文字、装饰元素需适当提亮。
- 变更视觉后请在浏览器实际验证 800 / 1280 / 1920 三种宽度，以及导航选中态在首项、中间项、末项的表现。
