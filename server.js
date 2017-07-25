const express = require('express')
const bodyParser = require('body-parser')
const htmlPdf = require('html-pdf-chrome')
const fs = require('fs')

const port = 3000

const app = express()
app.use(bodyParser.json())

app.get('/', (req, res) => {
  const package = JSON.parse(fs.readFileSync('./package.json'))
  res.send(`PDF-MAKER v${ package.version }!`)
})

const defaultOptions = {
  host: 'chrome',
  port: 9222
}

async function handler (req, res) {
  const options = Object.assign(defaultOptions, { printOptions: req.body.options })
  try {
    const pdf = await htmlPdf.create(req.body.html, options)
    const buffer = pdf.toBuffer()
    res.setHeader('Content-Type', 'application/pdf')
    res.send(buffer)
  }
  catch (error) {
    res.status(500).send(error)
  }
}

app.post('/', handler)

app.get('/test', (req, res) => {
  req.body.html = `
    <p>test</p>
  `
  handler(req, res)
})

app.use((err, req, res, next) => {
  res.status(500).send(err.message || 'Error desconocido.')
})

app.listen(port)

console.log('Running on http://localhost:' + port)
