const fs = require('fs')
const path = require('path')

const savedLocation = path.join(__dirname, '../client/saved')
const buildsNb = fs.readdirSync(savedLocation).length

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Welcome to my world!</title>
  <link rel="stylesheet" href="src/server/style.css">
</head>
<body>
  ${[...Array(buildsNb)].map((_, i) => {
    const index = buildsNb - i
    return `
      <a href="builds/${index}/index.html">
        <div>
          <img src="builds/${index}/preview.gif" onerror="this.src='builds/${index}/preview.png'; this.onerror = null">
        </div>
        <p>${('000' + index).substr(-3)}</p>
      </a>
    `
  }).join('')}
</body>
</html>
`

const outputLocation = path.join(__dirname, '../../index.html')

fs.writeFileSync(outputLocation, html)
