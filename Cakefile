fs = require 'fs'

task 'build', 'rebuild team-tracker', () ->
  coffee = require('coffee-script')
  
  fs.writeFileSync 'index.js', "#!/usr/bin/env node\n\n#{coffee.compile fs.readFileSync('./index.coffee', 'utf8')}"
  fs.writeFileSync 'cleanup.js', "#!/usr/bin/env node\n\n#{coffee.compile fs.readFileSync('./cleanup.coffee', 'utf8')}"
