import * as express from 'express'
import { Request, Response, NextFunction, Errback } from 'express'
import * as bodyParser from 'body-parser'
import * as htmlPdf from 'html-pdf-chrome'
import { CreateOptions, OutputType } from 'html-pdf-chrome'
import * as fs from 'fs'
import * as uuid from 'uuid/v4'
import { promisify } from 'util'
import * as commander from 'commander'
import merge = require('lodash.merge')

const port = 3000

const app = express()
app.use(bodyParser.json({ limit: '50mb' }))

const writeFileAsync = promisify(fs.writeFile)
const unlinkAsync = promisify(fs.unlink)

commander
  .option('-t, --temp-dir <p>', 'Temporary files directory')
  .parse(process.argv)

const tempDir = commander.tempDir

app.get('', (req, res) => {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
  res.send(`PDF-MAKER v${ pkg.version }!\n`)
})

const returnTypes: {[x: string]: { method: 'toBase64' | 'toBuffer', mime: (what?: OutputType) => string } } = {
  'base64': {
    method: 'toBase64',
    mime: () => 'text/plain'
  },
  'buffer': {
    method: 'toBuffer',
    mime: (what: OutputType) => what === 'screenshot' ? 'image/png' : 'application/pdf'
  }
}

async function handler (req: Request, res: Response, next: NextFunction) {
  const fileName = `${ tempDir }/${ uuid() }.html`
  const defaultOptions: CreateOptions = {
    host: 'chrome',
    port: 9222,
    printOptions: {
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0
    }
  }
  try {
    await writeFileAsync(fileName, req.body.html)
    const options: CreateOptions = merge(defaultOptions, req.body.options)
    const outputType: OutputType = req.path.includes('screenshot') ? 'screenshot' : 'pdf'
    const pdf = await htmlPdf.create(`file:///${ fileName }`, options, outputType)
    const result = pdf[returnTypes[req.query.return || 'buffer'].method]()
    res.setHeader('Content-Type', returnTypes[req.query.return || 'buffer'].mime(outputType))
    res.send(result)
  }
  catch (error) {
    next(error)
  }
  finally {
    try {
      await unlinkAsync(fileName)
    }
    catch (e) {}
  }
}

app.post('/pdf', handler)
app.post('/screenshot', handler)
app.get('/test', (req, res, next) => {
  req.body.html = `
    <p>test</p>
  `
  handler(req, res, next)
})

app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
  next(err)
})

const server = app.listen(port)

console.log('Running on http://0.0.0.0:' + port)
