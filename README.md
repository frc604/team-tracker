# team-track

## what

team-track is a tool designed to bulk-scrape team award history from the FIRST website.

## warning

use this tool **sparingly**. if you're downloading a huge amount of data, it's
going to put a large-ish load on FIRST's servers.

if you're going to try to download the complete award history for all teams out
there, i'd recommend doing so in batches, of, say, 500 or so.

## installation

team-track requires [node.js](http://nodejs.org/) to run and
[git](http://git-scm.org/) to download the source files. once you've installed
both, you should be able to download and install team-track via:

    git clone https://github.com/frc604/team-track.git
    cd ./team-track
    npm install

## how

### scrape team 604's award history

    node index 604 604

### scrape team 1 to team 500's award history, ignoring nonexistant teams

    node index 1 500

### save that data to awards.csv

    node index 1 500 > awards.csv

### clean up the output, removing extra newlines

    node cleanup awards.csv > awards-formatted.csv

## building

to build team-track from its coffeescript source files, run:

    cake build

## tests

none are currently written. i'd rather not burden FIRST's servers with them.

## license

[MIT License](https://en.wikipedia.org/wiki/MIT_License)
