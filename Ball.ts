export class Ball {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  private lastWallHit: number = 0
  private justHitWall: boolean = false
  private lastCeilingHit: number = 0
  private comboCount: number = 0
  private lastHitTime: number = 0
  private readonly COMBO_TIMEOUT = 2000 // 2 seconds to maintain combo
  private lastHitType: 'none' | 'wall' | 'shoe' = 'none'

  constructor(x: number, y: number, radius: number) {
    this.x = x
    this.y = y
    this.radius = radius
    this.vx = Math.random() * 4 - 2 // Random initial horizontal velocity
    this.vy = -5 // Initial upward velocity
  }

  resetCombo() {
    this.comboCount = 0
    this.lastHitTime = 0
    this.lastHitType = 'none'
  }

  hitWithShoe() {
    const now = Date.now()
    if (now - this.lastHitTime > this.COMBO_TIMEOUT) {
      this.resetCombo()
    } else if (this.lastHitType === 'wall') {
      // Valid sequence: continuing the shoe-wall pattern
      this.lastHitType = 'shoe'
    } else {
      // Invalid sequence: shoe hit after shoe or first hit
      this.resetCombo()
      this.lastHitType = 'shoe'
    }
    this.lastHitTime = now
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += 0.2 // gravity

    // Add drag to make movement more natural
    this.vx *= 0.99
    this.vy *= 0.99

    const now = Date.now()
    let collisionPoint = null

    // Reset combo if too much time has passed
    if (now - this.lastHitTime > this.COMBO_TIMEOUT) {
      this.resetCombo()
    }

    // Wall collisions
    if (this.x - this.radius < 0 || this.x + this.radius > 800 || this.y - this.radius < 0) {
      // Handle wall collision
      if (this.x - this.radius < 0) {
        this.x = this.radius
        this.vx = -this.vx * 0.8
      } else if (this.x + this.radius > 800) {
        this.x = 800 - this.radius
        this.vx = -this.vx * 0.8
      }
      
      if (this.y - this.radius < 0) {
        this.y = this.radius
        this.vy = -this.vy * 0.8
      }

      // Check if this wall hit is part of the valid sequence
      if (this.lastHitType === 'shoe') {
        this.comboCount = Math.min(this.comboCount + 1, 10)
        this.lastHitType = 'wall'
        this.lastHitTime = now

        // Return collision point with current combo points
        collisionPoint = {
          x: this.x,
          y: this.y,
          points: this.comboCount
        }
      } else {
        // Invalid sequence: wall hit after wall or first hit
        this.resetCombo()
        this.lastHitType = 'wall'
        this.lastHitTime = now
      }
    }

    return collisionPoint
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.font = `${this.radius * 2}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚽️', this.x, this.y)
    ctx.restore()
  }

  reset(x: number, y: number) {
    this.x = x
    this.y = y
    this.vx = Math.random() * 4 - 2
    this.vy = -5
    this.comboCount = 0
    this.lastHitTime = 0
  }
}

