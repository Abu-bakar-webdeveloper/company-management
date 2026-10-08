const fs = require('fs')
const zlib = require('zlib')

const p = process.argv[2]
const buf = fs.readFileSync(p)
let off = 8
let width, height, bitDepth, colorType
const idat = []
while (off < buf.length) {
  const len = buf.readUInt32BE(off)
  const type = buf.toString('ascii', off + 4, off + 8)
  const data = buf.slice(off + 8, off + 8 + len)
  if (type === 'IHDR') {
    width = data.readUInt32BE(0)
    height = data.readUInt32BE(4)
    bitDepth = data[8]
    colorType = data[9]
  } else if (type === 'IDAT') {
    idat.push(data)
  } else if (type === 'IEND') break
  off += 12 + len
}
console.error('size', width, height, 'bitDepth', bitDepth, 'colorType', colorType)

const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 1
const raw = zlib.inflateSync(Buffer.concat(idat))
const stride = width * channels
const px = Buffer.alloc(height * stride)
function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}
let pos = 0
for (let y = 0; y < height; y++) {
  const ft = raw[pos++]
  for (let x = 0; x < stride; x++) {
    const v = raw[pos++]
    const a = x >= channels ? px[y * stride + x - channels] : 0
    const b = y > 0 ? px[(y - 1) * stride + x] : 0
    const c = x >= channels && y > 0 ? px[(y - 1) * stride + x - channels] : 0
    let r
    if (ft === 0) r = v
    else if (ft === 1) r = v + a
    else if (ft === 2) r = v + b
    else if (ft === 3) r = v + ((a + b) >> 1)
    else r = v + paeth(a, b, c)
    px[y * stride + x] = r & 0xff
  }
}

// render full strip downsampled: detect non-white colored pixels
const cols = 200
const rows = 40
let out = ''
for (let ry = 0; ry < rows; ry++) {
  let line = ''
  for (let rx = 0; rx < cols; rx++) {
    const x = Math.floor((rx / cols) * width)
    const y = Math.floor((ry / rows) * height)
    const i = y * stride + x * channels
    const r = px[i], g = px[i + 1], b = px[i + 2]
    // classify
    if (r > 235 && g > 235 && b > 235) line += ' '
    else if (r > 180 && g < 150 && b < 120) line += 'O' // orange
    else if (b > 150 && r < 150) line += 'B' // blue
    else if (r > 120 && b > 150 && g < 130) line += 'P' // purple
    else if (g > 130 && r < 130) line += 'G' // green
    else line += '.'
  }
  out += line + '\n'
}
console.log(out)
