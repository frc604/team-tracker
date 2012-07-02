fs      = require 'fs'
path    = require 'path'

request = require 'request'
jsdom   = require 'jsdom'

# utility function to call a callback on the next tick
callback = (cb) ->
  args = [].slice.call(arguments, 1)
  process.nextTick () ->
    cb.apply undefined, args

# for a team, return a url to their "My FIRST" page
grab_team_url = (team, cb) ->
  request { uri: "http://frclinks.frclinks.com/t/#{escape team}" }, (err, resp, body) ->
    if err?
      callback cb, err
      return
    
    if body.indexOf('No information') isnt -1
      callback cb, '404'
      return

    body = body.split 'url='
    if body.length < 2
      callback cb, '404'
      return

    callback cb, undefined, body[1].split('"')[0]

# for a team, return the contents of their "My FIRST" page
grab_team_page = (team, cb) ->
  grab_team_url team, (err, url) ->
    if err?
      callback cb, err
      return

    request { uri: url }, (err, resp, body) ->
      if err?
        callback cb, err
        return
      
      callback cb, undefined, body

# for a team, return a jQuerified jsDOM of their "My FIRST" page
grab_team_dom = (team, cb) ->
  grab_team_page team, (err, body) ->
    if err?
      callback cb, err
      return

    jsdom.env { html: body, scripts: [ path.join process.cwd(), 'jquery-1.7.2.min.js' ] }, cb

# for a team, return a csv dump of their awards over the years
scrape_team_awards = (team, cb) ->
  grab_team_dom team, (err, window) ->
    if err?
      callback cb, err, team
      return

    $ = window.jQuery

    rows = $('th:contains(Season)')
      .last()
      .parent()
      .parent()                                   # at this point, we have the "Team History" table
      .find('tr:not(:first)')                     # now we grab every row but the header
      .map ->                                     # return an array containing, for each row, ...
        $(this)
          .find('td')
          .map ->                                 # an array, containing...
            $(this)
              .text()
              .trim()
              .replace(/[^a-zA-Z0-9\&\' \n]/g, '')
              .replace(/( )+/, ' ')               # the cleaned, trimmed text of each td in the row
    
    # format it as csv, filtering out rows where no awards were won
    csv = do ->
      for row in rows when row[2] isnt ''
        # remove the year from the event name
        row[1] = row[1].substring row[0].length + 1

        # split up the per-year awards field into each individual award
        awards = row[2].split('\n').filter (award) ->
          award isnt ''

        # filter out "2000 and prior award listings may be incomplete"
        awards = awards.filter (award) ->
          award.indexOf('incomplete') is -1

        "#{team},#{row[0]},#{row[1]},#{award}" for award in awards

    # flatten out the resulting array into a string
    ret = ''

    for item in csv
      if Array.isArray item
        ret += '\n' + item.join '\n'
      else
        ret += '\n' + item

    ret = ret.trim()
    ret = ret.replace /(\n)+/, '\n'

    callback cb, undefined, team, ret

process.argv.splice 0, 2

min = parseInt process.argv[0]
max = parseInt process.argv[1]

if not min? or not max? or isNaN(min) or isNaN(max) or max < min
  console.warn 'Please specify a team range to scrape, in the format: [min] [max]'
  process.exit 1
else
  for i in [min..max]
    scrape_team_awards i, (err, team, csv) ->
      if err?
        console.warn 'Error on team %s: ', team, err if err isnt '404'
      else
        console.log csv
