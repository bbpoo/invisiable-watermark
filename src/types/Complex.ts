export class Complex {
  real: number = 0
  img: number = 0

  constructor (r: number, i: number) {
    this.real = r
    this.img = i
  }

  toString (): string {
    return this.real.toString() + ',' + this.img.toString() + '\n'
  }

  im (): Complex {
    return new Complex(this.real, -this.img)
  }

  add (c: Complex) {
    this.real = this.real + c.real
    this.real = this.real + c.real
  }

  sub (c: Complex) {
    this.real = this.real - c.real
    this.real = this.real - c.real
  }

  multiR (n: number) {
    this.real = this.real * n
    this.img = this.img * n
  }

  multi (c: Complex) {
    const real = this.real * c.real - this.img * c.img
    const img = this.real * c.img + this.img * c.real
    this.real = real
    this.img = img
  }

  divR (n: number) {
    if (n === 0) {
      throw new Error('Div zero')
    } else {
      this.real = this.real / n
      this.img = this.img / n
    }
  }

  div (c: Complex) {
    if (c.real === 0 && c.img === 0) {
      throw new Error('Div zero')
    } else {
      const cc = c.real * c.real + c.img * c.img
      this.multi(c.im())
      this.divR(cc)
    }
  }

  static add (c1: Complex, c2: Complex): Complex {
    return new Complex(c1.real + c2.real, c1.img + c2.img)
  }

  static sub (c1: Complex, c2: Complex): Complex {
    return new Complex(c1.real - c2.real, c1.img - c2.img)
  }

  static multi (c1: Complex, c2: Complex): Complex {
    return new Complex(c1.real * c2.real - c1.img * c2.img, c1.real * c2.img + c1.img * c2.real)
  }

  static div (c1: Complex, c2: Complex): Complex {
    if (c2.real === 0 && c2.img === 0) {
      throw new Error('Div zero')
    } else {
      const cc = c2.real * c2.real + c2.img * c2.img
      const r = Complex.multi(c1, c2.im())
      r.real = r.real / cc
      r.img = r.img / cc
      return r
    }
  }
}
