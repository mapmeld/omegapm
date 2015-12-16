#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
var readInstalled = require('read-installed');
var request = require('request');
var openpgp = require('openpgp');
var prettyjson = require('prettyjson');

if (process.argv.length > 2) {
  var cliCommand = process.argv[2];
  if (cliCommand === 'status') {
    status();
  } else if (cliCommand === 'sign') {
    console.log('Command not yet implemented: omegapm sign');
  } else {
    console.log('Command not recognized: try - omegapm status');
  }
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
        withKeys.push({
          name: name,
          publicKey: path.join(path.join('node_modules', name), pkg.publicKey)
        });
      } else {
        withoutKeys.push({
          name: name
        });
      }
    });

    callback(null, withKeys, withoutKeys);
  });
}

function messages(package, callback) {
  if (!package || !package.name) {
    throw 'package has no name';
  }
  if (!package.publicKey || !fs.existsSync(package.publicKey)) {
    throw 'package has no publicKey set, or no publicKey file exists';
  }

  request('http://omegapm.org/messages/' + package.name, function (err, response, body) {
    if (err) {
      return callback(err, [], []);
    }

    var allMessages = JSON.parse(body);
    if (!allMessages.length || (allMessages.length === 1 && allMessages[0] === "couldn't find that package =-(")) {
      return callback(null, [], []);
    }

    var pubKeyRead = fs.readFileSync(package.publicKey, { encoding: 'utf-8' }) + "";
    var pubKey = openpgp.key.readArmored(pubKeyRead).keys[0];
    var verified = [];
    var unverified = [];

    function verifyMessage(m) {
      if (m >= allMessages.length) {
        return callback(null, verified, unverified);
      }

      var clearMessage = openpgp.cleartext.readArmored(allMessages[m]);

      openpgp.verifyClearSignedMessage(pubKey, clearMessage)
        .then(function(sigCheck) {
          if (sigCheck.signatures[0].valid) {
            verified.push(allMessages[m]);
          } else {
            unverified.push(allMessages[m]);
          }
          verifyMessage(m + 1);
        })
        .catch(function(err) {
          if (err) {
            throw err;
          }
        });
    }
    verifyMessage(0);
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
    var messageCount = 0;
    function checkPackage(i) {
      if (i >= signed.length) {
        if (callback) {
          return callback(null, verifiedByPackage);
        }
        if (messageCount) {
          return console.log(prettyjson.render(verifiedByPackage));
        } else {
          return console.log('Out of ' + signed.length + ' packages with public keys (' + signed.join(', ') + '), none had messages.');
        }
      }

      messages(signed[i], function (err, verified, unverified) {
        if (err) {
          if (callback) {
            return callback(err, {});
          }
          throw err;
        }

        if (unverified.length) {
          console.log('some unverified messages for ' + signed[i].name);
        }

        verifiedByPackage[signed[i].name] = verified;
        messageCount++;
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
