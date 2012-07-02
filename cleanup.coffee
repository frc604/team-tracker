# strip out repeat newlines and spaces from the output of index.coffee

fs   = require 'fs'
path = require 'path'

process.argv.splice 0, 2

file = process.argv.pop()

if not file?
  console.warn 'Specify a file to manipulate.'
  process.exit 1
else
  file = fs.readFileSync path.join(process.cwd(), file), 'utf8'

  file = file.replace /(\n)+/g, '\n'
  file = file.replace /( )+/g, ' '
  file = file.trim()

  console.log file
