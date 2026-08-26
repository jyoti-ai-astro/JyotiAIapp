/**
 * useSectionMotion Hook
 *
 * Section enter/exit tracking with scroll progress, velocity, and direction
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotionOrchestrator } from '@/components/providers/MotionProvider'
import { useScrollStore } from '@/lib/motion/scroll-store'
import { gsap } from 'gsap'

export interface UseSectionMotionOptions {
  sectionId: string
  onEnter?: () => void
  onExit?: () => void
  onProgress?: (progress: number) => void
  enterThreshold?: number // 0–1, default 0.1
  exitThreshold?: number // 0–1, default 0.9
}

export function useSectionMotion({
  sectionId,
  onEnter,
  onExit,
  onProgress,
  enterThreshold = 0.1,
  exitThreshold = 0.9,
}: UseSectionMotionOptions) {
  // Motion orchestrator can be missing on some pages
  let orchestrator: any = null
  try {
    orchestrator = useMotionOrchestrator()?.orchestrator ?? null
  } catch {
    orchestrator = null
  }

  const sectionRef = useRef<HTMLElement | null>(null)
  const scrollTriggerRef = useRef<any>(null)

  const [smoothedProgress, setSmoothedProgress] = useState(0)
  const [scrollDirection, setScrollDirection] =
    useState<'up' | 'down' | 'none'>('none')
  const [scrollVelocity, setScrollVelocity] = useState(0)

  const lastProgressRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const rafRef = useRef<number | null>(null)

  // This is the object GSAP will tween
  const progressValueRef = useRef<{ value: number }>({ value: 0 })

  // Keep latest callbacks / config in refs so ScrollTrigger doesn’t need recreation
  const onEnterRef = useRef(onEnter)
  const onExitRef = useRef(onExit)
  const onProgressRef = useRef(onProgress)
  const orchestratorRef = useRef(orchestrator)
  const enterThresholdRef = useRef(enterThreshold)
  const exitThresholdRef = useRef(exitThreshold)

  useEffect(() => {
    onEnterRef.current = onEnter
    onExitRef.current = onExit
    onProgressRef.current = onProgress
    orchestratorRef.current = orchestrator
    enterThresholdRef.current = enterThreshold
    exitThresholdRef.current = exitThreshold
  }, [onEnter, onExit, onProgress, orchestrator, enterThreshold, exitThreshold])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!sectionRef.current && !document.getElementById(sectionId)) return

    // Ensure plugin is registered (safe to call multiple times on client)
    gsap.registerPlugin(ScrollTrigger)

    const handleEnter = () => {
      orchestratorRef.current?.onSectionEnter?.(sectionId)
      onEnterRef.current?.()
    }

    const handleExit = () => {
      orchestratorRef.current?.onSectionExit?.(sectionId)
      onExitRef.current?.()
    }

    const handleProgress = (progress: number) => {
      const now = Date.now()
      const deltaTime = Math.max(
        (now - lastTimeRef.current) / 1000,
        0.001
      )
      const deltaProgress = progress - lastProgressRef.current

      const velocity = Math.abs(deltaProgress / deltaTime)

      let direction: 'up' | 'down' | 'none' = 'none'
      if (deltaProgress > 0.01) direction = 'down'
      else if (deltaProgress < -0.01) direction = 'up'

      // Cancel previous RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = window.requestAnimationFrame(() => {
        setScrollVelocity(velocity)
        setScrollDirection(direction)

        // Smooth progress via GSAP tween on the ref object
        gsap.to(progressValueRef.current, {
          value: progress,
          duration: 0.3,
          ease: 'power1.out',
          onUpdate: () => {
            setSmoothedProgress(progressValueRef.current.value)
          },
        })
      })

      // Store progress in global scroll store (non-reactive)
      useScrollStore.getState().setSectionProgress(sectionId, progress)

      // Threshold-based enter/exit
      if (
        progress >= enterThresholdRef.current &&
        lastProgressRef.current < enterThresholdRef.current
      ) {
        handleEnter()
      }
      if (
        progress < enterThresholdRef.current &&
        lastProgressRef.current >= enterThresholdRef.current
      ) {
        handleExit()
      }

      lastProgressRef.current = progress
      lastTimeRef.current = now
      onProgressRef.current?.(progress)
    }

    const triggerElement =
      sectionRef.current || (document.getElementById(sectionId) as Element)

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: triggerElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onEnter: handleEnter,
      onLeave: handleExit,
      onEnterBack: handleEnter,
      onLeaveBack: handleExit,
      onUpdate: (self) => {
        const progress = self.progress

        if (Math.abs(progress - lastProgressRef.current) < 0.001) {
          return
        }

        handleProgress(progress)
      },
    })

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill()
        scrollTriggerRef.current = null
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [sectionId])

  return {
    sectionRef,
    smoothedProgress,
    scrollDirection,
    scrollVelocity,
  }
}
