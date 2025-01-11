"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Ball } from '../Ball'
import { Cursor } from '../Cursor'
import { Keyboard } from '../Keyboard'

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ballRef = useRef<Ball>()
  const cursorRef = useRef<Cursor>()
  const keyboardRef = useRef<Keyboard>()
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [typedText, setTypedText] = useState("")

  // Remove unused states and refs
  const lastCursorPosRef = useRef({ x: 0, y: 0 })
  const lastHitKeyRef = useRef<string | null>(null)

  // Update dimensions function to handle portrait mode for mobile
  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      const height = window.innerHeight
      setDimensions({
        width: Math.min(width, 800),
        height: height - 100 // Leave some space for UI
      })
    }
  }

  // Add effect to handle window resize
  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize game objects
    if (!ballRef.current) {
      ballRef.current = new Ball(
        dimensions.width / 2, 
        dimensions.height / 2,
        Math.min(dimensions.width, dimensions.height) * 0.033,
        dimensions.width,
        dimensions.height
      )
    }
    if (!cursorRef.current) {
      cursorRef.current = new Cursor(dimensions.width / 2, dimensions.height / 2, 
        Math.min(dimensions.width, dimensions.height) * 0.067)
    }
    if (!keyboardRef.current) {
      keyboardRef.current = new Keyboard(dimensions.width, dimensions.height)
    }

    const ball = ballRef.current
    const cursor = cursorRef.current
    const keyboard = keyboardRef.current

    // Handle both mouse and touch events
    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      cursor.x = clientX - rect.left
      cursor.y = clientY - rect.top
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handlePointerMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handlePointerMove(touch.clientX, touch.clientY)
    }

    // Add touch event listeners
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchstart', handleTouchMove, { passive: false })

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      // Draw white background for the whole play area
      ctx.save()
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)
      ctx.restore()

      // Draw keyboard
      keyboard.draw(ctx)

      // Update ball and check if it hit the ground
      const hitGround = ball.update()
      if (hitGround) {
        // Create new ball from top center
        ball.reset(dimensions.width / 2, dimensions.height / 2)
        // Reset lastHitKey when ball resets
        lastHitKeyRef.current = null
      }

      // Check for keyboard collision
      const hitKey = keyboard.checkCollision(ball.x, ball.y)
      if (hitKey && hitKey !== lastHitKeyRef.current) {
        if (hitKey === '⌫') {
          // Handle delete key
          setTypedText(prev => prev.slice(0, -1))
        } else if (hitKey === '␣') {
          // Handle space key
          setTypedText(prev => prev + ' ')
        } else {
          // Handle regular keys
          setTypedText(prev => prev + hitKey.toLowerCase())
        }
        lastHitKeyRef.current = hitKey
      } else if (!hitKey) {
        lastHitKeyRef.current = null
      }

      // Ball-shoe collision detection
      const dx = cursor.x - ball.x
      const dy = cursor.y - ball.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < cursor.radius + ball.radius) {
        // Calculate cursor velocity
        const cursorVx = cursor.x - lastCursorPosRef.current.x
        const cursorVy = cursor.y - lastCursorPosRef.current.y
        
        // Calculate base velocity from hit angle
        const angle = Math.atan2(dy, dx)
        const baseSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
        const newSpeed = Math.max(baseSpeed, 8)

        // Add cursor velocity to the bounce
        const cursorSpeed = Math.sqrt(cursorVx * cursorVx + cursorVy * cursorVy)
        const kickBoost = Math.min(cursorSpeed * 0.3, 10)
        
        const randomAngle = angle + (Math.random() - 0.5) * 0.3
        ball.vx = -Math.cos(randomAngle) * newSpeed + cursorVx * 0.5
        ball.vy = -Math.sin(randomAngle) * newSpeed + cursorVy * 0.5 - kickBoost

        // Prevent multiple collisions
        ball.y = cursor.y - cursor.radius - ball.radius
      }

      // Update ball bounds when dimensions change
      ball.updateBounds(dimensions.width, dimensions.height)

      // Update last cursor position
      lastCursorPosRef.current = { x: cursor.x, y: cursor.y }

      // Draw game objects
      ball.draw(ctx)
      cursor.draw(ctx)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchstart', handleTouchMove)
    }
  }, [dimensions]) // Add dimensions to dependencies

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl">
        <input
          type="text"
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Your text will appear here..."
        />
        <div className="bg-white p-4 rounded-lg shadow-md">
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="cursor-none touch-none"
          />
        </div>
      </div>
    </div>
  )
}

