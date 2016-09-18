gulp-jade-recursive
===============
Easing incremental builds with Gulp and Jade by
keeping track of a dependency tree (include/extend statements)
and kicking off a rebuild for every file that is affected by the changed file.

Usage
```
npm install gulp-jade-recursive
```

Why create this plugin?
Because `gulp-jade-find-affected` didn't work for me.

gulpfile.js for incremental multi-lang static pages
```
var gulp = require('gulp');
var watch = require('gulp-watch');
var data = require('gulp-data');
var jade = require('gulp-jade');
var recursive = require('gulp-jade-recursive');
var foreach = require('gulp-foreach');
var merge = require('merge-stream');
var filter = require('gulp-filter');

function tpl(lang, tube) {
  return tube
  // Return data to be available in Jade-templates
  .pipe(data(function(file) {
    return {
       var: "value",
    };
  }))
  .pipe(jade())
  .pipe(gulp.dest('build/'+lang+"/"));
}

gulp.task('default', [], function() {
  // Watch all Jade-files for changes
  return watch('src/static/**/*.jade')
  // Let this plugin maintain a map and return all affected files
  .pipe(recursive('src/static/**/*.jade'))
  // Only build the pages
  .pipe(filter('src/static/pages/**/*.jade'))
  // We want NL(Dutch) and EN(English) so use foreach to trigger both
  .pipe(foreach(function(stream, file) {
     // Build single file to multi-lang
     return merge(
       tpl('nl', gulp.src(file.path)),
       tpl('en', gulp.src(file.path))
     );
   }));
});
```

TODO
* New include/extend statements do not update the map yet.

