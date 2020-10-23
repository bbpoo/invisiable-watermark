import { FFT } from "./utils/FFT"

export class IvWatermark {
  private context: any | null
  private size: number
  private sizeHalf: number
  private sizeBySize: number
  private watermarkText: string
  private watermarkFontSize: number
  private watermarkScale: number
  private foreColor: string = 'rgba(0, 0, 0, 1)'
  private backColor: string = 'rgba(0, 0, 0, 0)'

  constructor (ctx: any, size: number, scale: number, text: string, foreColor: string, fontSize? : number, backColor?: string) {
    if (typeof ctx.canvas !== 'undefined') {
      if ((size & (size - 1)) !== 0) {
        throw new Error('Error: the size of water mark must be the powers of 2.')
      } else {
        this.size = size
        this.sizeHalf = size >> 1
        this.sizeBySize = size * size
        FFT.init(size)
      }
      this.context = ctx
      this.watermarkText = text
      if (typeof fontSize !== 'undefined') {
        this.watermarkFontSize = fontSize
      } else {
        this.watermarkFontSize = 16
      }
      this.watermarkScale = scale
      this.foreColor = foreColor
      if (typeof backColor !== 'undefined') {
        this.backColor = backColor
      }
    } else {
      throw new Error('Error: invalid context.')
    }
  }

  public setContext (ctx: any) {
    this.context = ctx
  }

  public getContext () {
    return this.context
  }

  public setFontSize (fontSize: number) {
    this.watermarkFontSize = fontSize
  }

  public getFontSize () {
    return this.watermarkFontSize
  }

  public setSize (size: number) {
    this.size = size
    this.sizeHalf = size >> 1
    this.sizeBySize = size * size
  }

  public getSize () {
    return this.size
  }

  public setText (text: string) {
    this.watermarkText = text
  }

  public getText () {
    return this.watermarkText
  }

  public setScale (scale: number) {
    this.watermarkScale = scale
  }

  public getScale () {
    return this.watermarkScale
  }

  public setForeColor (color: string | number) {
    if (typeof color === 'number') {
      const r = color & 0xFF
      const g = (color & 0xFF00) >>> 8
      const b = (color & 0xFF0000) >>> 16
      const a = (color & 0xFF000000) >>> 24
      this.foreColor = 'rgba(' + [r, g, b, a].join(',') + ')'
    } else {
      this.foreColor = color
    }
  }

  public getForeColor () {
    return this.foreColor
  }

  public draw () : string {
    if (this.context) {
      this.context.clearRect(0, 0, this.size, this.size)
      this.context.font = this.watermarkFontSize.toString(10) + 'px arial, sans-serif'
      const size = this.context.measureText(this.watermarkText)
      if ((size.width + this.watermarkFontSize) * 0.707 < this.size * 0.5) {
        const offset = size.actualBoundingBoxRight * 0.707 - size.actualBoundingBoxAscent
        this.context.rect(0, 0, this.size, this.size)
        this.context.save()
        this.context.translate(this.sizeHalf, this.sizeHalf)
        this.context.rotate(Math.PI * -0.25)
        this.context.textAlign = 'left'
        this.context.textBaseline = 'top'
        this.context.fillStyle = this.foreColor
        this.context.fillText(this.watermarkText, -offset + this.watermarkFontSize * 0.5, offset)
        this.context.restore()
      } else {
        console.log('Warning: text of watermark is too long compared to watermark size: ' + this.size.toString(10) + ' px.')
      }
      const data = this.context.getImageData(0, 0, this.size, this.size)
      const pixel = 1.0 / 256.0
      const alpha = [] as number[]
      for (let l1 = 0; l1 < this.sizeBySize && l1 * 4 + 3 < data.data.length; l1++) {
        alpha[l1] = data.data[l1 * 4 + 3] * pixel
      }
      const fft = FFT.kshiftr2d(FFT.ifftr2d(alpha))
      let max = 0
      let min = 0
      if (this.size > 256) {
        for (let l2 = 0; l2 < this.sizeBySize && l2 * 4 + 3 < data.data.length; l2++) {
          if (min > fft[l2]) {
            min = fft[l2]
          }
          if (max < fft[l2]) {
            max = fft[l2]
          }
        }
      } else {
        max = Math.max(...fft)
        min = Math.min(...fft)
      }
      let scale = this.watermarkScale / (max - min)
      let offset = -min * scale
      if (max < -min) {
        offset = max * scale
        scale = scale * -1
      }
      for (let l3 = 0; l3 < this.sizeBySize && l3 * 4 + 3 < data.data.length; l3++) {
        // fft[l2] = Math.floor(fft[l2] * 1.0)
        data.data[l3 * 4 + 3] = Math.round(fft[l3] * scale + offset)
      }
      this.context.clearRect(0, 0, this.size, this.size)
      this.context.putImageData(data, 0, 0)
      return this.context.canvas.toDataURL('image/png')
    } else {
      throw new Error('Error: the size of water mark must be the powers of 2.')
    }
  }
}
