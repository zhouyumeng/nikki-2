var argv            = require('yargs').argv;
var _               = require('lodash');
var path            = require('path');
var prettyjson      = require('prettyjson');
var config          = require('./config');
var daemonize       = require('./daemonize');
var signals         = require('./signals');
var staticproxy     = require('./static-proxy');
var socket          = require('./socket');
var serveIndex      = require('./serve-index');
var utils           = require('./utils');
var blankline       = console.log;
var defaultProject  = config.get('projects.default');
var port            = argv.port || config.get('app.port');
var host            = argv.host || config.get('app.host');

var run = function() {
  var app = require('http').createServer(handler)
  
  if (defaultProject === 'cwd') {
      defaultProject = process.cwd();
  }
  
  var url     = 'http://' + host + ':' + port + '/' + defaultProject;
  var open    = _.has(argv, 'open') ? argv.open : config.get('app.open');
  
  app.listen(port);
  
  if (open) {
      var open = require("open");
      open(url);
  } else {
      blankline();
      console.log('Open your browser at ' + url + ' to access the IDE')
  }
  
  function handler (req, res) {
      if (!path.extname(req.url)) {
          serveIndex(req, res);
      }
  
      staticproxy('/bower_components', req, res);
      staticproxy('/client', req, res);
  }
  
  /**
   * HERE STARTS THE FUN!
   */
  socket.startTheFun(app);
}

module.exports = function() {
  blankline();
  console.log(prettyjson.render({'Configuration used': config.get()}, {noColor: true}));

  if (argv.daemon) {
    signals.setup();
    run();
  } else {
    daemonize(port);
  }
}