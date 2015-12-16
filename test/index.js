// from NodeJS core
var assert = require('assert');

// from OmegaPM
var packages = require('../index.js').packages;
var messages = require('../index.js').messages;
var status = require('../index.js').status;

describe('Check installed packages', function() {
  it('should return my dependencies (one with public key)', function(done) {
    packages(function (err, signed, unsigned) {
      assert.equal(err, null);
      // one module with public key: preeti
      assert.equal(signed.length, 1);
      assert.equal(signed[0].name, 'preeti');
      assert.equal(signed[0].publicKey, 'node_modules/preeti/public_key.asc');

      // all other modules without public keys
      assert.equal(unsigned.length, 102);
      done();
    });
  });
});

describe('Check messages', function() {
  it('should return one verified message', function(done) {
    this.timeout(6000);
    // should have one verified message from omega-sqrt
    messages({ name: 'omega-sqrt', publicKey: 'test/test_key.asc' }, function (err, verified, unverified) {
      assert.equal(err, null);
      assert.equal(verified.length, 1);
      assert.equal(unverified.length, 0);
      done();
    });
  });
});

describe('Check status of dependencies', function() {
  it('should return one verified message', function(done) {
    this.timeout(6000);
    // should have one verified message from omega-sqrt
    status(function (err, verifiedByPackage) {
      assert.equal(err, null);
      assert.equal(Object.keys(verifiedByPackage).length, 1);
      assert.equal(verifiedByPackage['preeti'].length, 0);
      done();
    });
  });
});
