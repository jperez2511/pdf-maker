const express = require('express')
const bodyParser = require('body-parser')
const pdf = require('html-pdf')
const fs = require('fs')

const port = 3000

const app = express()
app.use(bodyParser.json())

app.get('/', (req, res) => {
  const package = JSON.parse(fs.readFileSync('./package.json'))
  res.send(`PDF-MAKER v${ package.version }`)
})

app.post('/', (req, res) => {
  pdf.create(req.body.html, { width: '80mm', height: '297mm', margin: '0' })
    // .toStream((error, stream) => {
    //   if (error) {
    //     res.status(500).send(error)
    //   }
    //   else {
    //     res.setHeader('Content-Type', 'application/pdf')
    //     stream.pipe(res)
    //   }
    // })
    .toBuffer((err, buffer) => {
      if (err) {
        res.status(500).send(err)
      }
      else {
        res.setHeader('Content-Type', 'application/pdf')
        res.send(buffer)
      }
    })
})

app.use((err, req, res, next) => {
  res.status(500).send(err.message || 'Error desconocido.')
})

app.listen(port)

console.log('Running on http://localhost:' + port)
