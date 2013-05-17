'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');


var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.mainJsFile = '';
  this.mainCoffeeFile = 'console.log "\'Allo from CoffeeScript!"';

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  var welcome =
  '\n     _-----_' +
  '\n    |       |' +
  '\n    |'+'--(o)--'.red+'|   .--------------------------.' +
  '\n   `---------´  |    '+'Welcome to Yeoman,'.yellow.bold+'    |' +
  '\n    '+'( '.yellow+'_'+'´U`'.yellow+'_'+' )'.yellow+'   |   '+'ladies and gentlemen!'.yellow.bold+'  |' +
  '\n    /___A___\\   \'__________________________\'' +
  '\n     |  ~  |'.yellow +
  '\n   __'+'\'.___.\''.yellow+'__' +
  '\n ´   '+'`  |'.red+'° '+'´ Y'.red+' `\n';

  console.log(welcome);

  var prompts = [{
    name: 'gist',
    message: 'Is this project a gist?',
    default: false,
    warning: 'Yes: Barebones, one-off, CDN-backed d3 project for bl.ocks.org/'
  }];

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit('error', err);
    }

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.gist = props.gist;

    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function h5bp() {
  this.copy('404.html', 'app/404.html');
  this.copy('robots.txt', 'app/robots.txt');
  this.copy('htaccess', 'app/.htaccess');
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
    this.write('app/styles/main.css', 'body {\n    background: #fafafa;\n}\n\n.hero-unit {\n    margin: 50px auto 0 auto;\n    width: 300px;\n}');
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  // prepare default content text
  var defaults = ['HTML5 Boilerplate', 'Twitter Bootstrap'];
  var contentText = [
    '        <div class="container">',
    '            <div class="hero-unit">',
    '                <h1>\'Allo, \'Allo!</h1>',
    '                <p>You now have</p>',
    '                <ul>'
  ];

  this.mainJsFile = 'console.log(\'\\\'Allo \\\'Allo!\');';

  // iterate over defaults and create content string
  defaults.forEach(function (el) {
    contentText.push('                    <li>' + el  +'</li>');
  });

  contentText = contentText.concat([
    '                </ul>',
    '                <p>installed.</p>',
    '                <h3>Enjoy coding! - Yeoman</h3>',
    '            </div>',
    '        </div>',
    ''
  ]);

  // append the default content
  this.indexFile = this.indexFile.replace('<body>', '<body>\n' + contentText.join('\n'));
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
AppGenerator.prototype.requirejs = function requirejs() {
  if (this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', ['bower_components/requirejs/require.js'], {
      'data-main': 'scripts/main'
    });

    // add a basic amd module
    this.write('app/scripts/app.js', [
      '/*global define */',
      'define([], function () {',
      '    \'use strict\';\n',
      '    return \'\\\'Allo \\\'Allo!\';',
      '});'
    ].join('\n'));

    this.mainJsFile = [
      'require.config({',
      '    paths: {',
      '        jquery: \'../bower_components/jquery/jquery\',',
      '        bootstrap: \'vendor/bootstrap\'',
      '    },',
      '    shim: {',
      '        bootstrap: {',
      '            deps: [\'jquery\'],',
      '            exports: \'jquery\'',
      '        }',
      '    }',
      '});',
      '',
      'require([\'app\', \'jquery\', \'bootstrap\'], function (app, $) {',
      '    \'use strict\';',
      '    // use app here',
      '    console.log(app);',
      '    console.log(\'Running jQuery %s\', $().jquery);',
      '});'
    ].join('\n');
  }
};

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.write('app/index.html', this.indexFile);
  this.write('app/scripts/main.js', this.mainJsFile);
  this.write('app/scripts/hello.coffee', this.mainCoffeeFile);
};
