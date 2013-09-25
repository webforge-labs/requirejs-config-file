var path = require('path');
var chai = require('chai');
var fs = require('fs-extra');
var expect = chai.expect;
var assert = chai.assert;
//chai.use(require('./helpers/file'));

var tmpDir = "files/tmp/";
var tmpPath = function (relativePath) {
  return (tmpDir+relativePath).split(/\//).join(path.sep);
};

if (!fs.existsSync(path)) {
  fs.mkdirsSync(tmpDir);
}

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

    describe("with a var require definition", function () {
      var configFile = new ConfigFile(fixture('var-config.js'));

      it("returns the properties from config", function (done) {
        configFile.read(function (err, config) {
          expect(err).to.not.exist;
          expect(config).to.include.keys('paths');
          done();
        });
      });
    });

    describe("with an parse error config", function() {
      var configFile = new ConfigFile(fixture('parse-error-config.js'));

      it("shows an error", function (done) {
        configFile.read(function(err) {
          expect(err).to.exist;
          expect(err).to.include('syntax error');
          done();
        });
      });
    });

    describe("with an empty config", function() {
      var configFile = new ConfigFile(fixture('empty-config.js'));

      it("reads the config file and returns an empty object without notice", function (done) {
        configFile.read(function(err, config) {
          expect(err).to.not.exist;
          expect(config).to.exist.and.to.be.a('object').and.to.be.empty;
          done();
        });
      });

    });
  });

  describe("#write()", function() {
    var testModify = function(configName, modify, done) {
      var configFilePath = tmpPath(configName);
      fs.copy(fixture(configName), configFilePath, function (err) {
        expect(err).to.not.exist;

        var configFile = new ConfigFile(configFilePath);

        configFile.read(function (err, config) {
          expect(err).to.not.exist;

          modify(config);

          configFile.write(function (err) {
            expect(err).to.not.exist;

            var expectedContents = fs.readFileSync(fixture('modified-'+configName)).toString();
            var actualContents = fs.readFileSync(configFilePath).toString();

            assert.equal(actualContents, expectedContents);
            done();
          });
        });
      });
    };

    it('writes the file with the modified config for a normal config', function (done) {
      testModify(
        'normal-config.js', 
        function (config) {
          config.paths['monster'] = '/path/to/monster';
        }, 
        done
      );
    });

    it('writes the file with the modified config for a var config', function (done) {
      testModify(
        'var-config.js', 
        function (config) {
          config.paths['lodash'] = '/path/to/lodash.min';
        },
        done
      );
    });

    it("writes an empty read config with a requirejs.config call", function(done) {
      testModify(
        'empty-config.js',
        function (config) {
          return config.baseUrl = './js-build/lib';
        },
        done
      );
    });
  });

  /*
  describe('#create', function () {
    beforeEach(function (done) {
      fs.unlink(tmpPath('new-config.js'), done);
    });

    it('writes the file with a new config in requirejs.config style if it is created without parameter', function (done) {
      var configFile = new ConfigFile(tmpPath('new-config.js'));

      configFile.create(function (config) {
        config.baseUrl = '/js-built/lib';
        config.paths['lodash'] = '/path/to/lodash.min';
        config.paths['jquery'] = '/path/to/jquery.1.8.2.min';
      });

      configFile.write(function(err) {
        expect(err).to.not.exist;

      });

      testModify(
        'empty-config.js',
        function (config) {
        },
        done
      );
    });
  });
  */
});