/**
 * Script to generate favicon.ico and icon.png from favicon.svg
 * Requires sharp: npm install --save-dev sharp
 */

const fs = require('fs')
const path = require('path')

async function generateFavicons() {
  try {
    // Check if sharp is available
    let sharp
    try {
      sharp = require('sharp')
    } catch (e) {
      console.log('⚠️  sharp is not installed. Installing...')
      console.log('Please run: npm install --save-dev sharp')
      console.log('Or manually convert favicon.svg to favicon.ico and icon.png')
      return
    }

    const svgPath = path.join(__dirname, '../public/favicon.svg')
    const icoPath = path.join(__dirname, '../public/favicon.ico')
    const pngPath = path.join(__dirname, '../public/icon.png')

    if (!fs.existsSync(svgPath)) {
      console.error('❌ favicon.svg not found at:', svgPath)
      return
    }

    const svgBuffer = fs.readFileSync(svgPath)

    // Generate favicon.ico (32x32 PNG, browsers accept PNG as .ico)
    console.log('📦 Generating favicon.ico (32x32)...')
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(icoPath)
      .catch((err) => {
        console.log('⚠️  Could not generate favicon.ico:', err.message)
        console.log('   SVG favicon will be used as fallback')
      })

    // Generate icon.png (Apple touch icon - 180x180)
    console.log('📦 Generating icon.png (180x180)...')
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(pngPath)

    console.log('✅ Favicons generated successfully!')
    console.log('   - favicon.svg (already exists)')
    console.log('   - icon.png (180x180)')
    console.log('   ⚠️  Note: favicon.ico needs manual conversion or use an online tool')
  } catch (error) {
    console.error('❌ Error generating favicons:', error.message)
  }
}

generateFavicons()
