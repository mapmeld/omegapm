#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
var readInstalled = require('read-installed');
var request = require('request');
var prettyjson = require('prettyjson');

if (process.argv.length > 2) {
  var cliCommand = process.argv[2];
  if (cliCommand === 'status') {
    status();
  } else {
    console.log('Command not recognized: try - omegapm status');
  }
  //else if (cliCommand === 'sign') {
  //}
} else if (process.argv.length) {
  console.log('Issue a command: for example - omegapm status');
}

function packages(callback) {
  readInstalled('.', {}, function (err, data) {
    // data.dependencies
    if (err) {
      return callback(err, [], []);
    }

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    data.dependencies = data.dependencies || {};
    data.devDependencies = data.devDependencies || {};
    var pkgNames = Object.keys(data.dependencies).concat(Object.keys(data.devDependencies)).filter(onlyUnique);

    var withKeys = [];
    var withoutKeys = [];
    pkgNames.map(function(name) {
      var pkg = data.dependencies[name] || data.devDependencies[name];
      if (pkg.publicKey && fs.existsSync(path.join(path.join('node_modules', name), pkg.publicKey))) {
        withKeys.push(name);
      } else {
        withoutKeys.push(name);
      }
    });

    callback(null, withKeys, withoutKeys);
  });
}

function messages(package, callback) {
  request('http://omegapm.org/messages/' + package, function (err, response, body) {
    if (err) {
      return callback(err);
    }
    callback(null, JSON.parse(body), []);
  });
}

function status(callback) {
  packages(function (err, signed, unsigned) {
    if (err) {
      if (callback) {
        return callback(err, {});
      }
      throw err;
    }
    if (!signed.length) {
      if (callback) {
        return callback('none of your dependencies have a public key, so they cannot be used with OmegaPM', {});
      }
      return console.log('none of your dependencies have a public key, so they cannot be used with OmegaPM');
    }

    var verifiedByPackage = {};
    function checkPackage(i) {
      if (i >= signed.length) {
        if (callback) {
          return callback(null, verifiedByPackage);
        }
        return console.log(prettyjson.render(verifiedByPackage));
      }

      messages(signed[i], function (err, verified, unverified) {
        if (err) {
          if (callback) {
            return callback(err, {});
          }
          throw err;
        }

        verifiedByPackage[signed[i]] = verified;
        return checkPackage(i + 1);
      });
    }
    checkPackage(0);
  });
}

module.exports = {
  packages: packages,
  messages: messages,
  status: status
}
