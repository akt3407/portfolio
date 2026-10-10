'use client'

import { useGSAP } from '@gsap/react'
import type { WorkContent } from '@lib/microcms-client'
import { cn } from '@lib/utils'
import gsap from 'gsap'
import Image from 'next/image'
import { useEffect, useRef, useState, ViewTransition } from 'react'
import type { IUniform, Texture } from 'three'

import { handOffVideo, videoTransition } from '../works/_components/WorkVideo'

gsap.registerPlugin(useGSAP)

// 波が画像の左端から右端へ抜けるまでの秒数
const DURATION = 2.0

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform float uProgress;
  uniform float uDirection; // 1: 左→右、-1: 右→左
  varying vec2 vUv;

  const float WIDTH = 0.65;     // 歪みが出る帯の幅（画像の横幅に対する割合）
  const float CURVE = 0.1;    // 境目のうねりの大きさ
  const float WAVES = 1.75;     // 縦方向に並ぶうねりの数
  const float STRENGTH = 0.2; // 歪みの強さ

  void main() {
    // 波の先頭を画像の左外から右外まで動かす。y ごとに先頭をずらして境目を波打たせる。
    // 右→左のときは x を反転して同じ計算をする
    float front = mix(-WIDTH - CURVE, 1.0 + WIDTH + CURVE, uProgress);
    float px = uDirection > 0.0 ? vUv.x : 1.0 - vUv.x;
    float x = px + sin((vUv.y + uProgress) * 6.2832 * WAVES) * CURVE;
    float d = (x - front) / WIDTH;                    // 帯の中では -1〜1
    float band = 1.0 - smoothstep(0.0, 1.0, abs(d)); // 帯の中心ほど 1

    vec2 offset = vec2(band * uDirection, sin(vUv.y * 20.0) * band * 0.3) * STRENGTH;
    vec4 from = texture2D(uFrom, vUv - offset);
    vec4 to = texture2D(uTo, vUv + offset);

    // 波が通り過ぎた側から次の画像になる
    gl_FragColor = mix(from, to, 1.0 - smoothstep(-0.3, 0.3, d));
  }
`

interface Gl {
  uniforms: Record<'uFrom' | 'uTo' | 'uProgress' | 'uDirection', IUniform>
  textures: Texture[]
  render: () => void
  shown: number
}

interface WorkVisualProps {
  works: WorkContent[]
  active: number
  reverse: boolean
  hovered: boolean
  onHoverChange: (hovered: boolean) => void
}

export default function WorkVisual({
  works,
  active,
  reverse,
  hovered,
  onHoverChange,
}: WorkVisualProps) {
  const container = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const gl = useRef<Gl | null>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const work = works[active]!

  // three.js はこのコンポーネントでしか使わないので、マウント後に読み込む。
  // テクスチャは表示済みの <img> から作るので、画像を二重に読み込まない
  useEffect(() => {
    let disposed = false
    let dispose = () => {}
    // 読み込み中に unmount されると ref が null になるので、要素は先に取っておく
    const root = container.current!
    const el = canvas.current!

    ;(async () => {
      const THREE = await import('three')
      const imgs = Array.from(root.querySelectorAll('img'))
      await Promise.all(imgs.map((img) => img.decode()))
      if (disposed) return

      const renderer = new THREE.WebGLRenderer({ canvas: el })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      const textures = imgs.map((img) => {
        const texture = new THREE.Texture(img)
        texture.needsUpdate = true
        return texture
      })
      const uniforms = {
        uFrom: { value: textures[0] },
        uTo: { value: textures[0] },
        uProgress: { value: 1 },
        uDirection: { value: 1 },
      }
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
      const geometry = new THREE.PlaneGeometry(2, 2)
      const mesh = new THREE.Mesh(geometry, material)
      const camera = new THREE.Camera()
      const render = () => renderer.render(mesh, camera)

      const observer = new ResizeObserver(() => {
        renderer.setSize(el.clientWidth, el.clientHeight, false)
        render()
      })
      observer.observe(el)

      gl.current = { uniforms, textures, render, shown: 0 }
      setReady(true)

      dispose = () => {
        observer.disconnect()
        textures.forEach((texture) => texture.dispose())
        material.dispose()
        geometry.dispose()
        renderer.dispose()
        gl.current = null
      }
    })().catch((error) => {
      // WebGL が使えない環境では、下に敷いた <img> の fade のまま表示する
      console.warn('WorkVisual: WebGL を使わずに表示します', error)
    })

    return () => {
      disposed = true
      dispose()
    }
  }, [])

  useGSAP(
    () => {
      const g = gl.current
      if (!g || g.shown === active) return

      // ponytail: 波の途中で切り替えると前の波は打ち切られて一瞬で次へ進む。連打を滑らかにするなら途中の絵を from に焼き込む
      const { uniforms } = g
      uniforms.uFrom.value = g.textures[g.shown]
      uniforms.uTo.value = g.textures[active]
      uniforms.uDirection.value = reverse ? -1 : 1
      g.shown = active

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.fromTo(
        uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: reduce ? 0 : DURATION,
          ease: 'sine.inOut',
          overwrite: true,
          onUpdate: g.render,
        },
      )
    },
    { dependencies: [active, ready] },
  )

  // ホバー中だけ動画を頭から再生する。ホバー中に作品が切り替わったら次の動画を再生する
  useEffect(() => {
    const v = video.current!
    if (hovered && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // 再生開始前に pause() されると play() は reject されるが、意図どおりなので無視する
      v.play().catch(() => {})
    } else {
      v.pause()
      v.currentTime = 0
    }
  }, [hovered, active])

  return (
    <>
      {/* ホバー中の背景。作品画像と同じ props なので、表示済みの画像がキャッシュから使われる */}
      <Image
        src={work.image.url}
        alt=""
        width={912}
        height={514}
        className={cn(
          'pointer-events-none fixed inset-0 -z-10 size-full scale-110 object-cover opacity-0 blur-md transition-opacity duration-500',
          hovered && 'opacity-100',
        )}
      />
      <div
        ref={container}
        className="relative grid"
        // タッチ端末のタップでは出さない。
        // pointerenter は Home に戻った時など止まったカーソルの下に再表示されただけでも発火するので、実際に動かした時だけ出す
        onPointerMove={(e) => e.pointerType === 'mouse' && onHoverChange(true)}
        onPointerLeave={() => onHoverChange(false)}
        // 外側の Link で詳細ページへ移る時に、動画をこの再生位置から続ける
        onClick={() => handOffVideo(video.current!.currentTime)}
      >
        {/* ホバー中は画像を消して動画だけ見せる */}
        <div
          className={cn('relative grid transition-opacity duration-500', hovered && 'opacity-0')}
        >
          {works.map((work, i) => (
            <Image
              key={work.id}
              src={work.image.url}
              alt={work.title}
              width={912}
              height={514}
              loading="eager"
              inert={i !== active}
              className={cn(
                'col-start-1 row-start-1 transition-opacity duration-1000',
                i !== active && 'opacity-0',
              )}
            />
          ))}
          <canvas
            ref={canvas}
            aria-hidden="true"
            className={cn('absolute inset-0 size-full', !ready && 'invisible')}
          />
        </div>
        <ViewTransition {...videoTransition(work.slug!)}>
          <video
            ref={video}
            src={work.video}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className={cn(
              'absolute inset-0 z-10 m-auto size-4/5 object-contain opacity-0 transition-opacity duration-500',
              hovered && 'opacity-100',
            )}
          />
        </ViewTransition>
      </div>
    </>
  )
}
