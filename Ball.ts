export class Ball {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  private boundaryWidth: number
  private boundaryHeight: number

  constructor(x: number, y: number, radius: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.radius = radius
    this.vx = Math.random() * 4 - 2 // Random initial horizontal velocity
    this.vy = -5 // Initial upward velocity
    this.boundaryWidth = width
    this.boundaryHeight = height
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += 0.2 // gravity

    // Add drag to make movement more natural
    this.vx *= 0.99
    this.vy *= 0.99

    // Wall collisions
    if (this.x - this.radius < 0) {
      this.x = this.radius
      this.vx = -this.vx * 0.8 // Bounce with some energy loss
    }
    if (this.x + this.radius > this.boundaryWidth) {
      this.x = this.boundaryWidth - this.radius
      this.vx = -this.vx * 0.8
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius
      this.vy = -this.vy * 0.8
    }

    // Check if ball hit the ground
    if (this.y + this.radius > this.boundaryHeight) {
      return true // Signal that ball hit the ground
    }
    return false
  }

  updateBounds(width: number, height: number) {
    this.boundaryWidth = width
    this.boundaryHeight = height
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
  }
}

