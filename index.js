#!/usr/bin/env node

(function() {
  var callback, fs, grab_team_dom, grab_team_page, grab_team_url, i, jsdom, max, min, path, request, scrape_team_awards, _i;

  fs = require('fs');

  path = require('path');

  request = require('request');

  jsdom = require('jsdom');

  callback = function(cb) {
    var args;
    args = [].slice.call(arguments, 1);
    return process.nextTick(function() {
      return cb.apply(void 0, args);
    });
  };

  grab_team_url = function(team, cb) {
    return request({
      uri: "http://frclinks.frclinks.com/t/" + (escape(team))
    }, function(err, resp, body) {
      if (err != null) {
        callback(cb, err);
        return;
      }
      if (body.indexOf('No information') !== -1) {
        callback(cb, '404');
        return;
      }
      body = body.split('url=');
      if (body.length < 2) {
        callback(cb, '404');
        return;
      }
      return callback(cb, void 0, body[1].split('"')[0]);
    });
  };

  grab_team_page = function(team, cb) {
    return grab_team_url(team, function(err, url) {
      if (err != null) {
        callback(cb, err);
        return;
      }
      return request({
        uri: url
      }, function(err, resp, body) {
        if (err != null) {
          callback(cb, err);
          return;
        }
        return callback(cb, void 0, body);
      });
    });
  };

  grab_team_dom = function(team, cb) {
    return grab_team_page(team, function(err, body) {
      if (err != null) {
        callback(cb, err);
        return;
      }
      return jsdom.env({
        html: body,
        scripts: [path.join(process.cwd(), 'jquery-1.7.2.min.js')]
      }, cb);
    });
  };

  scrape_team_awards = function(team, cb) {
    return grab_team_dom(team, function(err, window) {
      var $, csv, item, ret, rows, _i, _len;
      if (err != null) {
        cb(err);
        return;
      }
      $ = window.jQuery;
      rows = $('th:contains(Season)').last().parent().parent().find('tr:not(:first)').map(function() {
        return $(this).find('td').map(function() {
          return $(this).text().trim().replace(/[^a-zA-Z0-9\&\' \n]/g, '').replace(/( )+/, ' ');
        });
      });
      csv = (function() {
        var award, awards, row, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = rows.length; _i < _len; _i++) {
          row = rows[_i];
          if (!(row[2] !== '')) {
            continue;
          }
          row[1] = row[1].substring(row[0].length + 1);
          awards = row[2].split('\n').filter(function(award) {
            return award !== '';
          });
          awards = awards.filter(function(award) {
            return award.indexOf('incomplete') === -1;
          });
          _results.push((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (_j = 0, _len1 = awards.length; _j < _len1; _j++) {
              award = awards[_j];
              _results1.push("" + team + "," + row[0] + "," + row[1] + "," + award);
            }
            return _results1;
          })());
        }
        return _results;
      })();
      ret = '';
      for (_i = 0, _len = csv.length; _i < _len; _i++) {
        item = csv[_i];
        if (Array.isArray(item)) {
          ret += '\n' + item.join('\n');
        } else {
          ret += '\n' + item;
        }
      }
      ret = ret.trim();
      ret = ret.replace(/(\n)+/, '\n');
      return callback(cb, void 0, ret);
    });
  };

  process.argv.splice(0, 2);

  min = parseInt(process.argv[0]);

  max = parseInt(process.argv[1]);

  if (!(min != null) || !(max != null) || isNaN(min) || isNaN(max) || max < min) {
    console.warn('Please specify a team range to scrape, in the format: [min] [max]');
    process.exit(1);
  } else {
    for (i = _i = min; min <= max ? _i < max : _i > max; i = min <= max ? ++_i : --_i) {
      scrape_team_awards(i, function(err, csv) {
        if (err != null) {
          if (err !== '404') {
            return console.warn(err);
          }
        } else {
          return console.log(csv);
        }
      });
    }
  }

}).call(this);
