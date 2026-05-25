'use client'

import { initParticlesEngine } from '@tsparticles/react'
import { loadImageShape } from '@tsparticles/shape-image'
import { loadFull } from 'tsparticles'

let engineInitPromise

export function initTsParticlesEngine() {
  if (!engineInitPromise) {
    engineInitPromise = initParticlesEngine(async (engine) => {
      await loadFull(engine)
      await loadImageShape(engine)
    })
  }

  return engineInitPromise
}
