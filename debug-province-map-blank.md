# Debug Session: province-map-blank

- Session ID: `province-map-blank`
- Started: 2026-11-25
- Project root: `C:\Users\Administrator\Desktop\The-Am`
- Evidence dir: `C:\Users\Administrator\AppData\Local\Temp\trae-debug\The-Am\province-map-blank`
- Symptom: 登录后首页/部门概览的地图区域（ProvinceMap）无法绘制，预期显示中国地图与省份数据。
- Environment: Windows, Node 22.22.2, Vite 6.4.6, ECharts（版本待确认）, Chrome headless CDP.

## Hypotheses

| ID | Hypothesis | Observation point | Status |
|----|------------|-------------------|--------|
| H1 | `/map/china.json` 请求失败（404 / base 路径 / MIME），registerMap 拿不到 GeoJSON | Network: status, URL, response size; console fetch error | INCONCLUSIVE |
| H2 | 注册名与 series `map` 名不一致，ECharts 报 `Map ... not exists` | Console error text; registerMap 参数 vs series.map | INCONCLUSIVE |
| H3 | 容器在初始化时宽高为 0（隐藏/动画/路由切换），canvas 尺寸为 0 且无 resize | DOM rect of chart container, canvas width/height | INCONCLUSIVE |
| H4 | 异步竞态：卸载/重挂载后 chart 实例被 dispose 或重复 init，setOption 失败 | Console errors, chart instance count, lifecycle logs | INCONCLUSIVE |
| H5 | GeoJSON 结构与 ECharts 版本不兼容（features/geometry 缺失或字段变化），registerMap 抛错 | Network payload keys, console stack | INCONCLUSIVE |

## Reproduction Plan

1. 启动 Vite dev server。
2. 用 CDP 打开 `/login`，管理员登录，进入 `/home`（地图所在页面）。
3. 捕获 Network（`/map/*.json`）、Console（error/exception）、页面截图、地图容器尺寸与 canvas 尺寸。
4. 根据证据确认/排除假设；仅在证据指向根因后做最小修复。
5. 修复后复用同一路径采集 post-fix 证据并截图。

## Evidence Log

### Pre-fix, healthy environment

| Case | Network `/map/china.json` | Overlay | Canvas | Non-transparent pixels | Console |
|---|---|---|---|---|---|
| dev `/home` | 200, application/json | null | 636×595 | 145,127 | clean |
| prod preview `/home` | 200, application/json | null | 636×595 | 145,127 | clean |
| dev `/home` 390×844 | 200, application/json | null | 636×620 (DPR2) | 174,665 | clean |
| rapid route switching | 200 ×2 | null | 636×595 | 145,127 | clean |
| Vite HMR update | 200 | null | 636×595 | 145,127 | clean |

Healthy environment conclusion: H2/H3/H4/H5 rejected; map initialization, sizing, routing and HMR are not the failure source.

### Pre-fix, failure reproduction

Intercept `/map/china.json` and return 404:

```
intercepted: 1
overlay: "地图无法绘制 地图数据加载失败，请刷新页面重试"
canvas: null
console.error: Error: geo http 404
  at loadGeo (src/components/ProvinceMap.vue)
  at async initMap (src/components/ProvinceMap.vue)
```

This confirms the only observed failure path: the map depends on a runtime fetch of a separate public asset. 404 / SPA HTML fallback / sub-path / MIME / CORS failures all funnel into `loadGeo()` throwing, leaving the whole map in the error overlay.

### Root cause

`ProvinceMap` loads GeoJSON with `fetch(`${import.meta.env.BASE_URL}map/china.json`)` at runtime. Unlike bundled code, this public asset is not guaranteed to be present or served as JSON in every environment (deployment omission, SPA rewrite returning index.html, sub-path, file://, proxy). When it fails, ECharts never receives the map registration.

### Fix

Bundle the GeoJSON into the application (`src/assets/china.json?raw` + `JSON.parse`) instead of runtime fetch, and harden initialization (layout frame, dispose stale instance, post-setOption resize).

### Post-fix verification

（待采集）

