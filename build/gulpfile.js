var gulp = require('gulp'),
gp_concat = require('gulp-concat'),
gp_rename = require('gulp-rename'),
gp_minify = require('gulp-minify');
gp_selfExecute = require('gulp-self-execute');
umd = require('gulp-umd');
runSequence = require('run-sequence');
jsdoc = require('gulp-jsdoc3');

gulp.task('merge', function(){
    return gulp.src(["../src/HTTP.js", "../src/index.js", "../src/get.js", "../src/post.js", "../src/put.js", "../src/delete.js", "../src/sync.js", "../src/middleware.js"])
        .pipe(gp_concat('jsoffr.js'))
        .pipe(gulp.dest('../dist'))
});

gulp.task('doc', function(){
    var config = require('./config.json');
    return gulp.src(["../dist/jsoffr.js"])
        .pipe(jsdoc(config))
});

gulp.task('wrap', function() {
    return gulp.src(["../dist/jsoffr.js"])
    .pipe(umd({
        dependencies : function(file){ return ['jsldb'] },
        templateName: 'amdNodeWeb'
    }))
    .pipe(gulp.dest('../dist'));
});

gulp.task('build', function(){
    runSequence('merge', 'doc', function(){
        console.log('Wraping in self executing anonymous function');
        setTimeout(function(){
            runSequence('wrap', function(){
                console.log('done!');
            });
        }, 2000);
    });
})

gulp.task('default', ['build'   ], function(){});