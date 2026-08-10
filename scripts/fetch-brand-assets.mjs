#!/usr/bin/env node
/**
 * Fetch MOMENTO brand assets from the asset CDN and verify every byte.
 *
 * Why this exists: binary files committed through an AI code editor get
 * UTF-8 mangled (every byte >= 0x80 becomes EF BF BD). Keeping the binaries
 * OUT of the repository and pulling them at build time makes that class of
 * corruption structurally impossible.
 *
 *   node scripts/fetch-brand-assets.mjs                    # download into public/ then verify
 *   node scripts/fetch-brand-assets.mjs --verify-only      # verify public/ without downloading
 *   node scripts/fetch-brand-assets.mjs --verify-only --dir=dist
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Primary: GitHub Pages. Fallback: raw.githubusercontent (same files, different edge).
const CDN_MIRRORS = [
	'https://noureddinelmobaraki-web.github.io/nl-audio-cdn/momento-assets/',
	'https://raw.githubusercontent.com/noureddinelmobaraki-web/nl-audio-cdn/main/momento-assets/',
]

const ASSETS = [
	{ path: 'favicon.ico', kind: 'ico', sizes: [[16, 16], [32, 32], [48, 48]] },
	{ path: 'favicon-16x16.png', kind: 'png', w: 16, h: 16 },
	{ path: 'favicon-32x32.png', kind: 'png', w: 32, h: 32 },
	{ path: 'apple-touch-icon.png', kind: 'png', w: 180, h: 180 },
	{ path: 'icon-192.png', kind: 'png', w: 192, h: 192 },
	{ path: 'icon-512.png', kind: 'png', w: 512, h: 512 },
	{ path: 'icon-maskable-512.png', kind: 'png', w: 512, h: 512 },
	{ path: 'og/og-image.jpg', kind: 'jpeg', w: 1200, h: 630 },
	{ path: 'og/og-image.webp', kind: 'webp', w: 1200, h: 630 },
]

const MANGLED = Buffer.from([0xef, 0xbf, 0xbd])

function pngSize(b) {
	const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
	for (let i = 0; i < 8; i++) if (b[i] !== sig[i]) throw new Error('not a PNG (bad signature)')
	if (b.toString('latin1', 12, 16) !== 'IHDR') throw new Error('not a PNG (no IHDR)')
	return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
}

function jpegSize(b) {
	if (!(b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)) throw new Error('not a JPEG (bad SOI)')
	let off = 2
	while (off < b.length - 9) {
		if (b[off] !== 0xff) { off++; continue }
		const m = b[off + 1]
		if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
			return { h: b.readUInt16BE(off + 5), w: b.readUInt16BE(off + 7) }
		}
		if (m === 0xd8 || (m >= 0xd0 && m <= 0xd9)) { off += 2; continue }
		off += 2 + b.readUInt16BE(off + 2)
	}
	throw new Error('not a JPEG (no SOF marker)')
}

function webpSize(b) {
	if (b.toString('latin1', 0, 4) !== 'RIFF') throw new Error('not a WebP (no RIFF)')
	if (b.toString('latin1', 8, 12) !== 'WEBP') throw new Error('not a WebP (no WEBP)')
	const chunk = b.toString('latin1', 12, 16)
	if (chunk === 'VP8 ') {
		if (!(b[23] === 0x9d && b[24] === 0x01 && b[25] === 0x2a)) throw new Error('corrupt lossy WebP (bad sync code)')
		return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff }
	}
	if (chunk === 'VP8L') {
		if (b[20] !== 0x2f) throw new Error('corrupt lossless WebP (bad signature)')
		const bits = b.readUInt32LE(21)
		return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }
	}
	if (chunk === 'VP8X') {
		return { w: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1, h: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1 }
	}
	throw new Error(`not a WebP (unknown chunk ${JSON.stringify(chunk)})`)
}

function icoSizes(b) {
	if (!(b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0)) throw new Error('not an ICO (bad header)')
	const n = b.readUInt16LE(4)
	if (n < 1 || n > 32) throw new Error(`not an ICO (absurd image count ${n})`)
	const out = []
	for (let i = 0; i < n; i++) {
		const e = 6 + i * 16
		out.push([b[e] === 0 ? 256 : b[e], b[e + 1] === 0 ? 256 : b[e + 1]])
	}
	return out.sort((a, c) => a[0] - c[0])
}

function verifyBuffer(asset, b) {
	if (b.length < 64) throw new Error(`file is only ${b.length} bytes`)
	if (b.includes(MANGLED)) throw new Error('contains the EF BF BD replacement sequence - this file was UTF-8 mangled')
	if (asset.kind === 'ico') {
		const got = icoSizes(b)
		const want = asset.sizes
		const same = got.length === want.length && got.every((g, i) => g[0] === want[i][0] && g[1] === want[i][1])
		if (!same) throw new Error(`ICO holds ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`)
		return `ICO ${JSON.stringify(got)}`
	}
	const size = asset.kind === 'png' ? pngSize(b) : asset.kind === 'jpeg' ? jpegSize(b) : webpSize(b)
	if (size.w !== asset.w || size.h !== asset.h) {
		throw new Error(`is ${size.w}x${size.h}, expected ${asset.w}x${asset.h}`)
	}
	return `${asset.kind.toUpperCase()} ${size.w}x${size.h}`
}

async function download(relPath, attemptsPerMirror = 3) {
	const errors = []
	for (const base of CDN_MIRRORS) {
		for (let i = 1; i <= attemptsPerMirror; i++) {
			try {
				const res = await fetch(base + relPath, { redirect: 'follow' })
				if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
				return Buffer.from(await res.arrayBuffer())
			} catch (err) {
				errors.push(`${base}: ${err.message}`)
				if (i < attemptsPerMirror) await new Promise((r) => setTimeout(r, 800 * i))
			}
		}
	}
	throw new Error(errors.join(' | '))
}

const argv = process.argv.slice(2)
const verifyOnly = argv.includes('--verify-only')
const dirArg = argv.find((a) => a.startsWith('--dir='))
const TARGET = resolve(ROOT, dirArg ? dirArg.slice(6) : 'public')

let failed = 0
for (const asset of ASSETS) {
	const dest = join(TARGET, asset.path)
	try {
		let buf
		if (verifyOnly) {
			buf = await readFile(dest)
		} else {
			// Reuse a byte-valid local copy first: CI must not depend on a
			// third-party CDN being reachable. Only download what is missing
			// or corrupt. The verification rules below are unchanged.
			buf = await readFile(dest).catch(() => null)
			if (buf) {
				try {
					verifyBuffer(asset, buf)
				} catch {
					buf = null
				}
			}
			if (!buf) {
				buf = await download(asset.path)
				verifyBuffer(asset, buf)
				await mkdir(dirname(dest), { recursive: true })
				await writeFile(dest, buf)
			}
		}
		const desc = verifyBuffer(asset, buf)
		console.log(`  ok   ${asset.path.padEnd(24)} ${desc}  ${buf.length} B`)
	} catch (err) {
		failed++
		console.error(`  FAIL ${asset.path.padEnd(24)} ${err.message}`)
	}
}

if (failed > 0) {
	console.error(`\n${failed} asset(s) failed. Refusing to continue.`)
	process.exit(1)
}
console.log(`\nAll ${ASSETS.length} brand assets verified in ${TARGET}`)
