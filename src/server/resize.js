const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')

const run = util.promisify(exec)
const readdir = util.promisify(fs.readdir)

const savedLocation = path.join(__dirname, '../client/saved')
const buildsNb = fs.readdirSync(savedLocation).length

function* geIndex () {
  let index = 0
  while (index < buildsNb) {
    index += 1
    yield index
  }
}

(async () => {
  for (const index of geIndex()) {
    console.log(index)
    const files = await readdir(path.join(__dirname, `../../builds/${index}`))
    const extension = files.some(file => file === 'preview.gif') ? 'gif' : 'png'
    console.log(extension)

    await run(`ffmpeg -i builds/${index}/preview.${extension} -vf scale=256:144 builds/${index}/resized.${extension}`)
    await run(`mv builds/${index}/preview.${extension} builds/${index}/preview-large.${extension}`)
    await run(`mv builds/${index}/resized.${extension} builds/${index}/preview.${extension}`)
  }
})()