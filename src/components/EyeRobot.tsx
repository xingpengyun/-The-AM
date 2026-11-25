import { useEffect, useRef, useState } from 'react'

/*
 * 眼睛跟随（纯黑极简，按 Bencho /blocks/eye-tracker 的思路重写）
 * - 两颗眼睛是"球面"上的点：只维护一个朝向前脸的方向（yaw / pitch），
 *   由弹簧驱动；两只眼睛都从它读出来，所以永远不会"各看各的"。
 * - 靠近边缘的那只眼睛会变小、变窄（foreshortening），这是它看起来像
 *   球而不是贴纸的关键。
 * - 只写 DOM、不写响应式状态：一次 pointermove 不是一次渲染。
 * - 每帧 dt 以 1/60 秒为单位，阻尼按帧数取幂，掉帧时衰减一致。
 */

/* 球半径（viewBox 100 单位） */
const R = 50
/* 两眼各偏离中线的距离，占半径比例 */
const GAP = 0.19
/* 斜向看时一对眼睛的倾斜角度（度） */
const TILT = 64

/* Slant 眼型：圆角竖条 */
const EYE = { w: 9, h: 15, r: 4.5 }

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))
const asin = (v: number): number => Math.asin(clamp(v, -0.92, 0.92))

export default function EyeRobot() {
  const box = useRef<HTMLDivElement | null>(null)
  const leftGroup = useRef<SVGGElement | null>(null)
  const rightGroup = useRef<SVGGElement | null>(null)
  const leftRect = useRef<SVGRectElement | null>(null)
  const rightRect = useRef<SVGRectElement | null>(null)

  /* clipPath 需要唯一 id（同页出现多个也不会串） */
  const [clipId] = useState(() => `robot-clip-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    const groups = () => [leftGroup.current, rightGroup.current]
    const rects = () => [leftRect.current, rightRect.current]

    const turn = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }
    let raf = 0
    let prev = 0
    let blinkAt = Number.NEGATIVE_INFINITY
    let nextBlink = performance.now() + 2400

    function draw(lid: number): void {
      const yaw = asin(turn.x)
      const pitch = -asin(turn.y)
      const cy = Math.cos(yaw)
      const sy = Math.sin(yaw)
      const cp = Math.cos(pitch)
      const sp = Math.sin(pitch)
      const tilt = TILT * turn.x * turn.y

      const gs = groups()
      const rs = rects()

      ;[-GAP, GAP].forEach((x0, i) => {
        const g = gs[i]
        const rect = rs[i]
        if (!g || !rect) return

        /* 眼睛作为单位球面上的点，随球一起转 */
        const z0 = Math.sqrt(1 - x0 * x0)
        const x1 = x0 * cy + z0 * sy
        const z1 = -x0 * sy + z0 * cy
        const y2 = -z1 * sp
        const z2 = z1 * cp

        /* 深度：越靠近边缘离观察者越远 → 整体更小，横向再窄一档 */
        const near = clamp(z2, 0, 1)
        const k = 0.45 + 0.55 * near
        const sx = k * (0.7 + 0.3 * near)

        const w = EYE.w * sx
        const h = Math.max(0.6, EYE.h * k * lid)
        rect.setAttribute('x', (-w / 2).toFixed(2))
        rect.setAttribute('y', (-h / 2).toFixed(2))
        rect.setAttribute('width', w.toFixed(2))
        rect.setAttribute('height', h.toFixed(2))
        rect.setAttribute('rx', Math.min(EYE.r, w / 2, h / 2).toFixed(2))

        g.setAttribute(
          'transform',
          `translate(${(50 + x1 * R).toFixed(2)} ${(50 + y2 * R).toFixed(2)}) rotate(${tilt.toFixed(2)})`
        )
        g.style.opacity = z2 < 0.05 ? '0' : '1'
      })
    }

    /* pointermove 只记录坐标，角度计算统一放在 rAF 里，避免事件风暴 */
    const pointer = { x: 0, y: 0, active: false }

    function updateTarget(): void {
      const el = box.current
      if (!el) return
      if (!pointer.active) {
        turn.tx = 0
        turn.ty = 0
        return
      }
      /* 每帧实时取位置：滚动、resize、布局变化都会自动反映进来 */
      const r = el.getBoundingClientRect()
      const dx = pointer.x - (r.left + r.width / 2)
      const dy = pointer.y - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      /* 跟随半径随视口缩放：近处细腻不抖，远处能明显看过去 */
      const reach = Math.max(240, Math.min(window.innerWidth, window.innerHeight) * 0.5)
      const far = Math.min(0.85, Math.tanh(d / reach) * 1.05)
      turn.tx = (dx / d) * far
      turn.ty = (dy / d) * far
    }

    function tick(now: number): void {
      if (document.hidden) {
        raf = 0
        prev = 0
        return
      }
      const dt = prev ? Math.min(2.5, (now - prev) / 16.67) : 1
      prev = now

      /* 眨眼：160ms 一次挤压 */
      if (now > nextBlink) {
        blinkAt = now
        nextBlink = now + 2600 + Math.random() * 3200
      }
      const since = now - blinkAt
      const lid = since < 160 ? 1 - 0.9 * Math.sin((since / 160) * Math.PI) : 1

      updateTarget()

      /* 一个弹簧同时处理两个轴 */
      turn.vx += ((turn.tx - turn.x) * 0.06 - turn.vx * 0.274) * dt
      turn.vy += ((turn.ty - turn.y) * 0.06 - turn.vy * 0.274) * dt
      turn.x += turn.vx * dt
      turn.y += turn.vy * dt

      draw(lid)
      raf = requestAnimationFrame(tick)
    }

    function resume(): void {
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick)
    }

    function track(event: PointerEvent): void {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }

    function rest(): void {
      pointer.active = false
      turn.tx = 0
      turn.ty = 0
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    /* 触屏或减少动态：静态正脸，只画一次 */
    if (reduced || !finePointer) {
      draw(1)
      return
    }

    draw(1)
    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', track, { passive: true })
    document.documentElement.addEventListener('pointerleave', rest)
    window.addEventListener('blur', rest)
    document.addEventListener('visibilitychange', resume)

    return () => {
      cancelAnimationFrame(raf)
      raf = 0
      window.removeEventListener('pointermove', track)
      document.documentElement.removeEventListener('pointerleave', rest)
      window.removeEventListener('blur', rest)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [])

  return (
    <div ref={box} className="robot" aria-hidden="true">
      <svg className="robot-ball" viewBox="0 0 100 100">
        <defs>
          <clipPath id={clipId}>
            <path d="M30 6 H70 A24 24 0 0 1 94 30 V70 A24 24 0 0 1 70 94 H30 A24 24 0 0 1 6 70 V30 A24 24 0 0 1 30 6 Z" />
          </clipPath>
        </defs>
        <path
          className="robot-body"
          d="M30 6 H70 A24 24 0 0 1 94 30 V70 A24 24 0 0 1 70 94 H30 A24 24 0 0 1 6 70 V30 A24 24 0 0 1 30 6 Z"
        />
        <g clipPath={`url(#${clipId})`}>
          <g ref={leftGroup}>
            <rect ref={leftRect} className="robot-eye" x={-EYE.w / 2} y={-EYE.h / 2} width={EYE.w} height={EYE.h} rx={EYE.r} />
          </g>
          <g ref={rightGroup}>
            <rect ref={rightRect} className="robot-eye" x={-EYE.w / 2} y={-EYE.h / 2} width={EYE.w} height={EYE.h} rx={EYE.r} />
          </g>
        </g>
      </svg>
    </div>
  )
}
