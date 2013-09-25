var fs = require('fs');
var esprima = require('esprima');
var _ = require('lodash');
var util= require('util');
var stringifyObject = require("stringify-object");

exports.ConfigFile = function(filePath) {
  var that = this;

  this.config = null;

  /**
   * null = never read
   * var = config was read with var require = {...}
   * requirejs = config was read with requirejs.config({...})
   * require = config was read with require.config({...})
   * empty = no config expression was found (but read() was called)
   */
  this.type = null;

  /**
   * The position where the object expression should be written back to
   */
  this.range = null;

  this.contents = null;

  this.read = function (callback) {
    fs.readFile(filePath, function(err, data) {
      if (err) return callback(err, null);

      that.contents = data.toString();
      var program;

      try {
        program = esprima.parse(that.contents, {range: true});
      } catch (ex) {
        return callback('could not read: '+filePath+' because it has syntax errors: '+ex, null);
      }

      that.type = 'empty';
      if (program.type === 'Program') {
        _.forEach(program.body, function(statement) {

          if (statement.expression && statement.expression.type === 'CallExpression') {
            var call = statement.expression;

            if (call.callee.type === 'MemberExpression' && (call.callee.object.name === 'requirejs' || call.callee.object.name === 'require') && call.callee.property.name === 'config') {
              that.type = call.callee.object.name === 'require' ? 'require' : 'requirejs';
              that.readObjectExpression(call.arguments[0], callback);
              return false;
            }
          } else if(statement.type === 'VariableDeclaration') {
            _.forEach(statement.declarations, function(declarator) {
              if (declarator.id.name === 'require') {
                that.type = 'var';
                that.readObjectExpression(declarator.init, callback);
                return false;
              }
            });

            if (that.type === 'var') return false;
          }
        });
      }

      if (that.type === 'empty') {
        callback("cannot find config in file", null);
      }
    });
  };

  this.write = function(callback) {
    if (!this.range) {
      throw new Error('The config cannot be written. Was it read() before? The config expression has to be found to allow writing');
    }

    var contents = that.contents.substring(0, that.range[0]) + that.buildConfig() + that.contents.substring(that.range[1]);

    fs.writeFile(filePath, contents, callback);
  };

  this.buildConfig = function() {
    return stringifyObject(
      that.config, 
      {
        indent: '  '
      }
    );
  };

  this.readObjectExpression = function(objectExpression, callback) {
    /* jshint evil:true */
    if (objectExpression && objectExpression.type === 'ObjectExpression') {
      try {
        that.config = eval('('+that.contents.substring(objectExpression.range[0], objectExpression.range[1])+')');

      } catch (syntaxError) {
        return callback(syntaxError, null);
      }

      that.range = objectExpression.range;
      return callback(null, that.config);
    }

    return callback('cannot read objectExpression from '+util.inspect(objectExpression));
  };
};