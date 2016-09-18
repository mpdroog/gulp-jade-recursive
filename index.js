/**
 * Jade incremental build-map.
 * What? This file keeps track of all Jade-files
 *  that include/extend other Jade-files so when a
 *  incremental build has to be done we know what 'base files'
 *  need to be rebuilt
 * @author mdroog <rootdev@gmail.com>
 */
'use strict';
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var through = require('through2');
var File = require('vinyl');

// Built map of connected files
var map = {};
function loadMap(pattern) {
  glob(pattern, {}, function (err, files) {
    if (err) {
      throw err;
    }

    for (var i = 0; i < files.length; i++) {
      var body = fs.readFileSync(files[i], 'utf8').replace(/\r\n|\r/g, "\n").split("\n");
      // Match all include/extend patterns
      for (var l = 0; l < body.length; l++) {
        var line = body[l].trim().toLowerCase();
        if (line.indexOf("include") === 0 || line.indexOf("extend") === 0) {
          var tokens = body[l].trim().split(" ");
          var file = path.resolve(path.dirname(files[i]) + "/" + tokens[tokens.length-1]);
          if (! map.hasOwnProperty(file)) {
            map[ file ] = [];
          }
          map[ file ].push(files[i]);
        }
      }
    }
    //console.log(map);
    //console.log("Affected::ready");
  });
}

// Walk on map and get our changes
function recursivelyFindAffected(file) {
  this.push(new File({
    base: "",
    path: file,
    contents: new Buffer(fs.readFileSync(file, 'utf8'))
  }));

  var affected = map[ file ];
  if (affected) {
    for (var i = 0; i < affected.length; i++) {
      //console.log("File=" + file + " affected=" + affected[i]);
      this.push(new File({
        base: "",
        path: affected[i],
        contents: new Buffer(fs.readFileSync(affected[i], 'utf8'))
      }));
      recursivelyFindAffected.call(this, affected[i]);
    }
  } else {
    //console.log("File=" + file + " affected=0");
  }
}

module.exports = function(basedir) {
  loadMap(basedir);
  return through.obj(function(file, enc, cb) {
    recursivelyFindAffected.call(this, file.path);
    //console.log("Affected::done");
    cb();
  });
};
