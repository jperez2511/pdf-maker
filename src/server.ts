import * as express from 'express'
import { Request, Response, NextFunction, Errback } from 'express'
import * as bodyParser from 'body-parser'
import * as htmlPdf from 'html-pdf-chrome'
import * as fs from 'fs'
import * as uuid from 'uuid/v4'
import { promisify } from 'util'

const port = 3000

const app = express()
app.use(bodyParser.json({ limit: '50mb' }))

app.get('/', (req, res) => {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
  res.send(`PDF-MAKER v${ pkg.version }!\n`)
})

const defaultOptions = {
  host: 'chrome',
  port: 9222
}

const writeFileAsync = promisify(fs.writeFile)
const unlinkAsync = promisify(fs.unlink)

async function handler (req: Request, res: Response, next: NextFunction) {
  const fileName = `/var/lib/html/${ uuid() }.html`
  const options = Object.assign(
    defaultOptions,
    {
      printOptions: Object.assign(
        {
          marginTop: 0,
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0
        },
        req.body.options
      )
    }
  )
  try {
    await writeFileAsync(fileName, req.body.html)
    const pdf = await htmlPdf.create(`file:///${ fileName }`, options)
    const buffer = pdf.toBuffer()
    res.setHeader('Content-Type', 'application/pdf')
    res.send(buffer)
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

app.post('/', handler)

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
