import Complex from '../types/Complex'

export default class FFT {
  private static bitRev = [] as number[]
  private static cosTbl = [] as number[]
  private static order = -1
  private static orderHalf = -1
  private static orderInvert = -1

  static init (len: number) {
    if ((len & (len - 1)) === 0 && len > 1) {
      if (this.order === len && this.bitRev.length === len && this.cosTbl.length === (len + (len >> 2))) {
        console.log('FFT will not be re-initialize.')
        return
      }
      if ((this.order & (this.order - 1)) === 0) {
        console.log('FFT will be re-initialize.')
      }
      this.order = len
      this.orderHalf = len >> 1
      this.orderInvert = 1 / len
      let i = 0
      let j = 0
      let k = 0
      this.bitRev[0] = 0
      while (++i < this.order) {
        k = this.order >> 1
        while (k <= j) {
          j -= k
          k = k >> 1
        }
        j = j + k
        this.bitRev[i] = j
      }

      const d2 = this.order >> 1
      const d4 = d2 >> 1
      const d8 = d4 >> 1
      const m3d4 = d2 + d4
      let trigStep = Math.sin(Math.PI / this.order)
      let cosStep = 2 * trigStep * trigStep
      let sinStep = Math.sqrt(cosStep * (2 - cosStep))
      let cos = 1
      this.cosTbl[d4] = 1
      let sin = 0
      this.cosTbl[0] = 0
      trigStep = 2 * cosStep
      for (let l1 = 1; l1 < d8; l1++) {
        cos -= cosStep
        cosStep += trigStep * cos
        sin += sinStep
        sinStep -= trigStep * sin
        this.cosTbl[l1] = sin
        this.cosTbl[d4 - l1] = cos
      }
      if (d8 !== 0) {
        this.cosTbl[d8] = Math.sqrt(0.5)
      }
      for (let l2 = 0; l2 < d4; l2++) {
        this.cosTbl[d2 - l2] = this.cosTbl[l2]
      }
      for (let l3 = 1; l3 < m3d4; l3++) {
        this.cosTbl[l3 + d2] = -this.cosTbl[l3]
      }
    }
  }

  static fft (src: Complex[], inverse: boolean): Complex[] {
    if ((this.order & (this.order - 1)) !== 0) {
      throw new Error('Error: call FFT.init($length_of_fft) first.')
    } else if (src.length < this.order) {
      throw new Error('Error: the length of input array must equal to initialized length of fft.')
    } else {
      const result = [...src]
      const inv = inverse ? -1 : 1
      const d4 = this.order >> 2
      // reorder src
      for (let l1 = 0; l1 < this.order; l1++) {
        const l2 = this.bitRev[l1]
        if (l1 < l2) {
          result[l1] = src[l2]
          result[l2] = src[l1]
        }
      }
      // butterfly
      for (let k1 = 1; k1 < this.order; k1 = k1 << 1) {
        let st = 0
        const dd = this.order / (k1 << 1)
        for (let k2 = 0; k2 < k1; k2++) {
          const c = new Complex(this.cosTbl[st + d4], inv * this.cosTbl[st])
          for (let k3 = k2; k3 < this.order; k3 += (k1 << 1)) {
            const k4 = k1 + k3
            const t = Complex.multi(result[k4], c.im())
            result[k4] = Complex.sub(result[k3], t)
            result[k3] = Complex.add(result[k3], t)
          }
          st += dd
        }
      }
      return result
    }
  }

  static fft1d (data: Complex[]): Complex[] {
    return this.fft(data, false)
  }

  static ifft1d (data: Complex[]): Complex[] {
    const result = this.fft(data, true)
    result.forEach((c: Complex) => {
      c.multiR(this.orderInvert)
    })
    return result
  }

  static fft2d (src: Complex[]) : Complex[] {
    const result = [] as Complex[]
    let temp = [] as Complex[]
    // x-axis
    for (let row = 0; row < this.order; row++) {
      const rowOffset = row * this.order
      for (let rowCol1 = 0; rowCol1 < this.order; rowCol1++) {
        temp[rowCol1] = src[rowOffset + rowCol1]
      }
      temp = src.slice(row * this.order, (row + 1) * this.order)
      const rowFFT = this.fft1d(temp)
      for (let rowCol2 = 0; rowCol2 < this.order; rowCol2++) {
        result[rowOffset + rowCol2] = rowFFT[rowCol2]
      }
    }
    // y-axis
    for (let col = 0; col < this.order; col++) {
      for (let colRow1 = 0; colRow1 < this.order; colRow1++) {
        const index = col + colRow1 * this.order
        temp[colRow1] = result[index]
      }
      const colFFT = this.fft1d(temp)
      for (let colRow2 = 0; colRow2 < this.order; colRow2++) {
        const index = col + colRow2 * this.order
        result[index] = colFFT[colRow2]
      }
    }
    return result
  }

  static ifft2d (src: Complex[]) : Complex[] {
    const result = [] as Complex[]
    let temp = [] as Complex[]
    // x-axis
    for (let row = 0; row < this.order; row++) {
      temp = src.slice(row * this.order, (row + 1) * this.order)
      const rowFFT = this.ifft1d(temp)
      const rowOffset = row * this.order
      for (let rowCol = 0; rowCol < this.order; rowCol++) {
        result[rowOffset + rowCol] = rowFFT[rowCol]
      }
    }
    // y-axis
    for (let col = 0; col < this.order; col++) {
      for (let colRow1 = 0; colRow1 < this.order; colRow1++) {
        const index = col + colRow1 * this.order
        temp[colRow1] = result[index]
      }
      const colFFT = this.ifft1d(temp)
      for (let colRow2 = 0; colRow2 < this.order; colRow2++) {
        const index = col + colRow2 * this.order
        result[index] = colFFT[colRow2]
      }
    }
    return result
  }

  static fftr (src: number[], inverse: boolean): number[] {
    if ((this.order & (this.order - 1)) !== 0) {
      throw new Error('Error: call FFT.init($length_of_fft) first.')
    } else if (src.length < this.order) {
      throw new Error('Error: the length of input array must equal to initialized length of fft.')
    } else {
      const result = [] as Complex[]
      for (let l0 = 0; l0 < this.order; l0++) {
        result[l0] = new Complex(src[l0], 0)
      }
      const inv = inverse ? -1 : 1
      const d4 = this.order >> 2
      // reorder src
      for (let l1 = 0; l1 < this.order; l1++) {
        const l2 = this.bitRev[l1]
        if (l1 < l2) {
          const temp = result[l1]
          result[l1] = result[l2]
          result[l2] = temp
        }
      }
      // butterfly
      for (let k1 = 1; k1 < this.order; k1 = k1 << 1) {
        let st = 0
        const dd = this.order / (k1 << 1)
        for (let k2 = 0; k2 < k1; k2++) {
          const c = new Complex(this.cosTbl[st + d4], inv * this.cosTbl[st])
          for (let k3 = k2; k3 < this.order; k3 += (k1 << 1)) {
            const k4 = k1 + k3
            const t = Complex.multi(result[k4], c.im())
            result[k4] = Complex.sub(result[k3], t)
            result[k3] = Complex.add(result[k3], t)
          }
          st += dd
        }
      }
      const real = result.map((c: Complex) => c.real)
      return real
    }
  }

  static fftr1d (data: number[]): number[] {
    return this.fftr(data, false)
  }

  static ifftr1d (data: number[]): number[] {
    const result = this.fftr(data, true)
    result.forEach((n: number) => {
      n = n * this.orderInvert
    })
    return result
  }

  static fftr2d (src: number[]) : number[] {
    const result = src.map((r: number) => new Complex(r, 0))
    let temp = [] as Complex[]
    // x-axis
    for (let row = 0; row < this.order; row++) {
      temp = result.slice(row * this.order, (row + 1) * this.order)
      const rowFFT = this.fft1d(temp)
      const rowOffset = row * this.order
      for (let rowCol = 0; rowCol < this.order; rowCol++) {
        result[rowOffset + rowCol] = rowFFT[rowCol]
      }
    }
    // y-axis
    for (let col = 0; col < this.order; col++) {
      for (let colRow1 = 0; colRow1 < this.order; colRow1++) {
        const index = col + colRow1 * this.order
        temp[colRow1] = result[index]
      }
      const colFFT = this.fft1d(temp)
      for (let colRow2 = 0; colRow2 < this.order; colRow2++) {
        const index = col + colRow2 * this.order
        result[index] = colFFT[colRow2]
      }
    }
    return result.map((c: Complex) => c.real)
  }

  static ifftr2d (src: number[]) : number[] {
    const result = src.map((r: number) => new Complex(r, 0))
    let temp = [] as Complex[]
    // x-axis
    for (let row = 0; row < this.order; row++) {
      temp = result.slice(row * this.order, (row + 1) * this.order)
      const rowFFT = this.ifft1d(temp)
      const rowOffset = row * this.order
      for (let rowCol = 0; rowCol < this.order; rowCol++) {
        result[rowOffset + rowCol] = rowFFT[rowCol]
      }
    }
    // y-axis
    for (let col = 0; col < this.order; col++) {
      for (let colRow1 = 0; colRow1 < this.order; colRow1++) {
        const index = col + colRow1 * this.order
        temp[colRow1] = result[index]
      }
      const colFFT = this.ifft1d(temp)
      for (let colRow2 = 0; colRow2 < this.order; colRow2++) {
        const index = col + colRow2 * this.order
        result[index] = colFFT[colRow2]
      }
    }
    return result.map((c: Complex) => c.real)
  }

  static kshift1d (src: Complex[]) : Complex[] {
    const result = [] as Complex[]
    const half = this.orderHalf
    for (let i = 0; i < half; i++) {
      result[i] = src[half + i]
      result[half + i] = src[i]
    }
    return result
  }

  static kshift2d (src: Complex[]) : Complex[] {
    const result = [] as Complex[]
    const half = this.orderHalf
    for (let row = 0; row < half; row++) {
      for (let col = 0; col < half; col++) {
        result[row * this.order + col] = src[(row + half) * this.order + half + col]
        result[(row + half) * this.order + half + col] = src[row * this.order + col]
        result[row * this.order + half + col] = src[(row + half) * this.order + col]
        result[(row + half) * this.order + col] = src[row * this.order + half + col]
      }
    }
    return result
  }

  static kshiftr1d (src: number[]) : number[] {
    const result = [] as number[]
    const half = this.orderHalf
    for (let i = 0; i < half; i++) {
      result[i] = src[half + i]
      result[half + i] = src[i]
    }
    return result
  }

  static kshiftr2d (src: number[]) : number[] {
    const result = [] as number[]
    const half = this.orderHalf
    for (let row = 0; row < half; row++) {
      for (let col = 0; col < half; col++) {
        result[row * this.order + col] = src[(row + half) * this.order + half + col]
        result[(row + half) * this.order + half + col] = src[row * this.order + col]
        result[row * this.order + half + col] = src[(row + half) * this.order + col]
        result[(row + half) * this.order + col] = src[row * this.order + half + col]
      }
    }
    return result
  }
}
