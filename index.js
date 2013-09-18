var fs = require('fs');
var esprima = require('esprima');
var _ = require('lodash');
var util= require('util');

exports.ConfigFile = function(filePath) {
  var that = this;
  this.filePath = filePath;

  this.read = function (callback) {
    fs.readFile(filePath, function(err, data) {
      if (err) return callback(err, null);

      var contents = data.toString();
      var program = esprima.parse(contents, {range: true});

      if (program.type === 'Program') {
        _.forEach(program.body, function(statement) {
          if (statement.expression && statement.expression.type === 'CallExpression') {
            var call = statement.expression;

            if (call.callee.object.name === 'requirejs' || call.callee.object.name === 'require' && call.callee.property.name === 'config') {
              that.readObjectExpression(call.arguments[0], contents, callback);
            }
          }
        });
      }

      //info.str = fileContents.substring(node.range[0], node.range[1]);
      //config = eval("(" + info.str + ")");
    });
  };

  this.readObjectExpression = function(objectExpression, contents, callback) {
    /* jshint evil:true */
    if (objectExpression && objectExpression.type === 'ObjectExpression') {
      var obj;
      try {
        obj = eval('('+contents.substring(objectExpression.range[0], objectExpression.range[1])+')');

      } catch (syntaxError) {
        return callback(syntaxError, null);
      }

      return callback(null, obj);
    }

    return callback('cannot read objectExpression from '+util.inspect(objectExpression));
  };
};