import { scene, camera, renderer, onResize } from './app'

const frames = 60

window.addEventListener('keyup', async ({ key }) => {
  
  if (key !== 's') return
  
  console.log('⏳ Taking screenshots…')
  
  resize(640, 360)

  const screenshots = await new Promise(
    (resolve, reject) => snap([], 0, resolve)
  )
  resize()

  const response = await fetch('/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ screenshots })
  })

  const data = await response.text()
  console.log(data)
})

const snap = (screenshots, i, resolve) => {

  if (screenshots.length === frames) {
    return resolve(screenshots)
  }
  if (i % 3 === 0) {
    const dataUrl = renderer.domElement.toDataURL()
    const [ _, base64] = dataUrl.split(',')
  
    screenshots.push(base64)
  }
  window.requestAnimationFrame(() => snap(screenshots, i + 1, resolve))
}

const resize = (
  width = window.innerWidth,
  height = window.innerHeight
) => {
  if (onResize) {
    onResize(width, height)
  } else {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  
  renderer.setSize(width, height)
  renderer.render(scene, camera)
}

window.addEventListener('resize', () => resize())



