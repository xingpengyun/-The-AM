import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, MeshTransmissionMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import studioHdr from '@/assets/studio_small_08_1k.hdr'
import { cn } from '@/lib/utils'
import './GlassLogo.css'

export interface GlassLogoProps {
  className?: string
}

/**
 * 玻璃层固定配置：材质 / 环境光 / 相机 / 尺寸 / 旋转全部写死。
 * 场景内不再有任何文字或 logo 贴图，只保留玻璃本体自身对环境的折射与反光。
 */
const GLASS = {
  dpr: 3,
  fov: 45,
  cameraZ: 4.5,
  planeZ: -2,
  canvasSize: 112,
  cube: { size: 1.8, radius: 0.26, smoothness: 16 },
  /* 自转速度在慢速基础上提高约 40% */
  spin: { x: 0.15, y: 0.196, z: 0.12, zFreq: 0.28 },
  envRotationY: 0.7,
  material: {
    transmission: 1,
    thickness: 0.9,
    roughness: 0.02,
    ior: 1.5,
    chromaticAberration: 0.06,
    anisotropicBlur: 0.1,
    backside: true,
    backsideThickness: 0.4,
    samples: 6,
    resolution: 256,
    attenuationDistance: 25,
    attenuationColor: '#ffffff',
    clearcoat: 0.25,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1
  }
} as const

/* 折射内容：透明底「云阿蛮」，固定绘制在画布中心 */
const TEXT = '云阿蛮'
const TEXTURE_SIZE = 256
const FONT_FAMILY = "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif"

const VIEW_WIDTH = 2 * GLASS.cameraZ * Math.tan((GLASS.fov * Math.PI) / 360)
const VIEW_HEIGHT = VIEW_WIDTH
/* 方块轴对齐时投影最小，文字需按这个宽度收纳，避免转到正面时露出玻璃外 */
const MIN_FACE_PX = (GLASS.cube.size / VIEW_HEIGHT) * GLASS.canvasSize

/* 绘制横排文字贴图：等比适配槽位，保证不裁切 */
function paintText(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_SIZE
  canvas.height = TEXTURE_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const center = TEXTURE_SIZE / 2
  /* 三字总宽控制在最小投影宽度的 70%，保证折射放大后仍留安全边距 */
  const maxWidth = TEXTURE_SIZE * ((MIN_FACE_PX * 0.7) / GLASS.canvasSize)
  let fontSize = maxWidth / TEXT.length

  ctx.font = `700 ${fontSize}px ${FONT_FAMILY}`
  const width = ctx.measureText(TEXT).width
  if (width > maxWidth) {
    fontSize *= maxWidth / width
    ctx.font = `700 ${fontSize}px ${FONT_FAMILY}`
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  /* 取自参考图 #267C5F，三字同色；辉光沿用同色相 */
  ctx.fillStyle = '#267C5F'
  ctx.shadowColor = 'rgba(38,124,95,.9)'
  ctx.shadowBlur = TEXTURE_SIZE * 0.024
  ctx.fillText(TEXT, center, center + fontSize * 0.02)
  ctx.shadowBlur = 0
  return canvas
}

function TextPlane() {
  const map = useMemo(() => {
    const texture = new THREE.CanvasTexture(paintText())
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }, [])

  useEffect(() => () => map.dispose(), [map])

  const height = 2 * (GLASS.cameraZ - GLASS.planeZ) * Math.tan((GLASS.fov * Math.PI) / 360)
  return (
    <mesh position={[0, 0, GLASS.planeZ]}>
      <planeGeometry args={[height, height]} />
      <meshBasicMaterial map={map} alphaTest={0.5} toneMapped={false} />
    </mesh>
  )
}

function GlassScene() {
  const groupRef = useRef<THREE.Group>(null)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pose = (t: number): void => {
      const group = groupRef.current
      if (!group) return
      group.rotation.x = t * GLASS.spin.x
      group.rotation.y = t * GLASS.spin.y
      group.rotation.z = Math.sin(t * GLASS.spin.zFreq) * GLASS.spin.z
    }

    if (reduced) {
      pose(0.9)
      invalidate()
      return
    }

    let raf = 0
    let last = 0
    const start = performance.now()
    const loop = (now: number): void => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) return
      /* 约 30fps，小尺寸下足够顺滑，同时控制 transmission 的 GPU 占用 */
      if (now - last < 32) return
      last = now
      pose((now - start) / 1000)
      invalidate()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [invalidate])

  return (
    <>
      <TextPlane />

      <directionalLight position={[6, 8, 6]} intensity={0.45} />
      <directionalLight position={[0, 4, -8]} intensity={0.9} color="#d8e8ff" />

      <group ref={groupRef}>
        <RoundedBox
          args={[GLASS.cube.size, GLASS.cube.size, GLASS.cube.size]}
          radius={GLASS.cube.radius}
          smoothness={GLASS.cube.smoothness}
        >
          <MeshTransmissionMaterial {...GLASS.material} />
        </RoundedBox>
      </group>

      <Environment
        files={studioHdr}
        background={false}
        environmentRotation={[0, GLASS.envRotationY, 0]}
      />
    </>
  )
}

export default function GlassLogo({ className }: GlassLogoProps) {
  return (
    <span className={cn('glass-logo', className)} aria-hidden="true">
      <Canvas
        dpr={GLASS.dpr}
        frameloop="demand"
        camera={{ fov: GLASS.fov, position: [0, 0, GLASS.cameraZ], near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.transmissionResolutionScale = 1
        }}
      >
        <Suspense fallback={null}>
          <GlassScene />
        </Suspense>
      </Canvas>
    </span>
  )
}
