var assert = require('assert');

var packages = require('../index.js').packages;
var messages = require('../index.js').messages;
var status = require('../index.js').status;

describe('Check installed packages', function() {
  it('should return my dependencies (none with public keys)', function(done) {
    packages(function (err, signed, unsigned) {
      assert.equal(err, null);
      assert.equal(signed.length, 1); // this is preeti, a test with public key
      assert.equal(unsigned.length, 98);
      done();
    });
  });
});

describe('Check messages', function() {
  it('should return one verified message', function(done) {
    messages('omega-sqrt', function (err, verified, unverified) {
      assert.equal(err, null);
      assert.equal(verified.length, 1);
      done();
    });
  });
});

describe('Check status of preeti', function() {
  it('should return one verified message', function(done) {
    messages('omega-sqrt', function (err, verified, unverified) {
      assert.equal(err, null);
      assert.equal(verified.length, 1);
      done();
    });
  });
});
