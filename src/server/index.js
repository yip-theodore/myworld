
const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const util = require('util')
const { exec } = require('child_process')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

const run = util.promisify(exec)
const rmDir = util.promisify(rimraf)
const readdir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)


const app = express();

app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const screenshotsLocation = path.join(__dirname, '../../screenshots')
const savedLocation = path.join(__dirname, '../client/saved')
const buildsLocation = path.join(__dirname, '../../builds')
const tempLocation = path.join(__dirname, 'tmp')

app.get('/', (req, res) => {
  res.render('index', {
    builds: fs.readdirSync(savedLocation).length
  })
})

// app.get('/:build', (req, res) => {
//   const { build } = req.params
//   // console.log(build)
//   // const builds = fs.readdirSync(buildsLocation)
//   // console.log(buildsLocation)
//   // res.send(build)
//   // app.use(express.static(path.join(buildsLocation, build)))
//   // res.sendFile(path.join(buildsLocation, build, 'index.html'))
// })


app.post('/api', async (req, res) => {
  try {
    
    const { screenshots } = req.body
  
    await mkdirp(tempLocation)
  
    screenshots.forEach(async (screenshot, i) => {
      const buffer = Buffer.from(screenshot, 'base64')
      const frameName = `${('00' + i).substr(-3)}.png`
      await writeFile(path.join(tempLocation, frameName), buffer)    
    });
  
    const savedFolder = await readdir(savedLocation)
    const newName = savedFolder.length + 1
    
  
    console.log(`📦  Saving to ${buildsLocation}/${newName}`)
  
    await run('yarn save')
    await run(`ffmpeg -i ${path.join(tempLocation, '%03d.png')} ${buildsLocation}/${newName}/preview.gif`)
    await rmDir(tempLocation)
  
    console.log('🔥  done!')
    res.send(`🌟 Successfully saved to ${buildsLocation}/${newName}!`)

  } catch ({ stdout, stderr }) {
    console.log(stdout)
    console.log(stderr)
  }
})

const port = 4000
app.listen(port, () => console.log(`🥝  Listening on port ${port}!`));



app.use(express.static(path.join(__dirname, '../../builds')));
// app.use('/screenshots', express.static(path.join(__dirname, '../../screenshots')));
app.use(express.static(__dirname))

app.set('views', __dirname)
app.set('view engine', 'pug')
