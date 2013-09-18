var path = require('path');
var chai = require('chai');
var fs = require("fs");
var expect = chai.expect;
var assert = chai.assert;
//chai.use(require('./helpers/file'));

var tmpDir = "files/tmp/";
var tmpPath = function (relativePath) {
  return (tmpDir+relativePath).split(/\//).join(path.sep);
};

var fixture = function(relativePath) {
  return ('files/fixtures/'+relativePath).split(/\//).join(path.sep);
};

// Class Under Test
var ConfigFile = require('../index').ConfigFile;

describe("ConfigFile", function() {

  describe("#read()", function () {

    describe("with a non-existing file", function() {
      var configFile = new ConfigFile(fixture('non-existing-config.js'));

      it("returns an error", function(done) {
        configFile.read(function(err) {
          expect(err).to.exist;
          expect(err.toString()).to.contain('non-existing-config.js');
          done();
        });
      });
    });

    describe("with a requirejs.config() call with a define() in the file", function() {
      var configFile = new ConfigFile(fixture('config-with-define.js'));

      it("returns all the properties in the config", function(done) {
        var config = configFile.read(function (err, config) {
          expect(err).to.not.exist;

          expect(config).to.include.keys('paths');
          done();
        });
      });
    });


    describe("with a normal requirejs.config() call in the file", function() {
      var configFile = new ConfigFile(fixture('normal-config.js'));

      it("returns the config as an object", function (done) {
        configFile.read(function (err, config) {
          expect(err).to.not.exist;
          expect(config).to.exist.and.to.be.an.object;
          done();
        });
      });

      it("returns all the properties in the config", function(done) {
        var config = configFile.read(function (err, config) {
          expect(err).to.not.exist;
          expect(config).to.include.keys('paths');
          done();
        });
      });
    });

    describe("witha var require definition", function () {
      var configFile = new ConfigFile(fixture('var-config.js'));

      it("returns the properties from config", function (done) {
        configFile.read(function (err, config) {
          expect(err).to.not.exist;
          expect(config).to.include.keys('paths');
          done();
        });
      });
    });
  });


  describe("#write()", function() {
  });

});