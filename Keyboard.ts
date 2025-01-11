export class Keyboard {
  keys: { char: string; x: number; y: number; width: number; height: number }[]
  keyboardWidth: number
  keyboardHeight: number
  readonly padding = 5

  constructor(canvasWidth: number, canvasHeight: number) {
    this.keyboardWidth = canvasWidth
    this.keyboardHeight = canvasHeight
    this.keys = this.createLayout(canvasWidth, canvasHeight)
  }

  private createLayout(canvasWidth: number, canvasHeight: number) {
    // Define the characters for each wall
    const leftWall = ['Q', 'W', 'E', 'R', 'T', '⌫']
    const rightWall = ['Y', 'U', 'I', 'O', 'P', '␣']
    const topWall = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
    
    const keys: { char: string; x: number; y: number; width: number; height: number }[] = []
    const keySize = 40

    // Left wall
    leftWall.forEach((char, index) => {
      keys.push({
        char,
        x: 0,
        y: (index + 1) * (canvasHeight / (leftWall.length + 1)),
        width: keySize,
        height: keySize
      })
    })

    // Right wall
    rightWall.forEach((char, index) => {
      keys.push({
        char,
        x: canvasWidth - keySize,
        y: (index + 1) * (canvasHeight / (rightWall.length + 1)),
        width: keySize,
        height: keySize
      })
    })

    // Top wall
    topWall.forEach((char, index) => {
      keys.push({
        char,
        x: (index + 1) * (canvasWidth / (topWall.length + 1)),
        y: 0,
        width: keySize,
        height: keySize
      })
    })
    
    return keys
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    
    // Draw each key
    this.keys.forEach(key => {
      ctx.fillStyle = '#f0f0f0'
      ctx.strokeStyle = '#ccc'
      ctx.lineWidth = 1
      
      // Draw key background
      ctx.beginPath()
      ctx.roundRect(key.x, key.y, key.width, key.height, 5)
      ctx.fill()
      ctx.stroke()
      
      // Draw key character
      ctx.fillStyle = '#333'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(key.char, key.x + key.width / 2, key.y + key.height / 2)
    })
    
    ctx.restore()
  }

  checkCollision(x: number, y: number): string | null {
    const key = this.keys.find(key => 
      x >= key.x && x <= key.x + key.width &&
      y >= key.y && y <= key.y + key.height
    )
    return key ? key.char : null
  }
} 