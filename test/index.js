var assert = require('assert');

var packages = require('../index.js').packages;
var messages = require('../index.js').messages;
var status = require('../index.js').status;

describe('Check installed packages', function() {
  it('should return my dependencies (none with public keys)', function(done) {
    packages(function (err, signed, unsigned) {
      assert.equal(err, null);
      assert.equal(signed.length, 1); // this is preeti, a test with public key
      assert.equal(signed[0].name, 'preeti');
      assert.equal(signed[0].publicKey, 'node_modules/preeti/public_key.asc');
      assert.equal(unsigned.length, 102);
      done();
    });
  });
});

describe('Check messages', function() {
  it('should return one verified message', function(done) {
    this.timeout(6000);
    messages({ name: 'omega-sqrt', publicKey: 'test/test_key.asc' }, function (err, verified, unverified) {
      assert.equal(err, null);
      assert.equal(verified.length, 1);
      assert.equal(unverified.length, 0);
      done();
    });
  });
});

describe('Check status of preeti', function() {
  it('should return one verified message', function(done) {
    this.timeout(6000);
    messages({ name: 'omega-sqrt', publicKey: 'test/test_key.asc' }, function (err, verified, unverified) {
      assert.equal(err, null);
      assert.equal(verified.length, 1);
      done();
    });
  });
});
