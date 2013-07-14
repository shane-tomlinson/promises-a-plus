/*globals window: true, describe: true, it: true, assert:true*/
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function() {
  "use strict";

  var Promises = window.Promises;

  describe("Promises", function() {
    it("are createable", function() {
      var promise = Promises.create();
      assert.ok(promise);
    });

    it("have a function then", function() {
      var promise = Promises.create();
      assert.equal(typeof promise.then, "function");
    });

    describe("then", function() {
      it("takes onFulfilled, onRejected, and returns a promise", function() {
        var promise = Promises.create();
        var promise2 = promise.then(function() {}, function() {});
        assert.equal(typeof promise2.then, "function");
      });
    });

    describe("fulfill", function() {
      it("fulfills the promise", function(done) {
        var promise = Promises.create();
        promise.then(function(value) {
          assert.equal(value, "value");
          done();
        }, function(reason) {
          assert.ok(false);
        });

        promise.fulfill("value");
      });

      it("can be called before then", function(done) {
        var promise = Promises.create();
        promise.fulfill("value");

        var returned = false;

        promise.then(function(value) {
          assert.equal(returned, true);
          assert.equal(value, "value");
          done();
        });

        returned = true;
      });

      it("cannot be called after a promise is already completed", function() {
        var promise = Promises.create();

        promise.then(function() {}, function() {});
        promise.fulfill("yay!");

        assert.throws(function() {
          promise.fulfill("boo");
        });
      });

      it("chained promise order as expected", function(done) {
        var promise = Promises.create();

        var count = 0;

        var promise2 = promise.then(function(value) {
          assert.equal(count, 0);
          count++;
        });

        promise.then(function(value) {
          assert.equal(count, 1);
          count++;
        });

        promise2.then(function(value) {
          assert.equal(count, 2);
          done();
        });

        promise.fulfill("value");
      });

      it("undefined return value of fulfill is passed to next promise", function(done) {
        var promise = Promises.create();

        var promise2 = promise.then(function(value) {});

        promise2.then(function(value) {
          assert.equal(typeof value, "undefined");
          done();
        });

        promise.fulfill("value");
      });

      it("return value of fulfill is passed to promise2 but another fulfill on promise", function(done) {
        var promise = Promises.create();

        var promise2 = promise.then(function(value) {
          assert.equal(value, "value");

          return "value2";
        });

        promise.then(function(value) {
          assert.equal(value, "value");
        });

        promise2.then(function(value) {
          assert.equal(value, "value2");
          done();
        });

        promise.fulfill("value");
      });

      it("returning a promise (returnedPromise) in onFulfill fulfills promise2 to returnedPromise",
          function(done) {
        var promise = Promises.create();

        var returnedPromise = Promises.create();

        var promise2 = promise.then(function() {
          return returnedPromise;
        });

        promise2.then(function(value) {
          assert.equal(value, "value2");
          done();
        });

        promise.fulfill("value");

        assert.equal(promise2._state, returnedPromise._state);
        returnedPromise.fulfill("value2");
      });

      it("throwing an exception in onFulfill calls onReject of promise2 with exception", function(done) {
        var promise = Promises.create();

        var promise2 = promise.then(function() {
          throw new Error("promise2's error");
        });

        promise2.then(function(value) {
          assert.ok(false);
        }, function(reason) {
          assert.equal(String(reason), "Error: promise2's error");
          done();
        });

        promise.fulfill("value");
      });

      it("pass fulfillment value to first registered onFulfilled", function(done) {
        var promise = Promises.create();

        promise.then(null, function(value) {
          assert.ok(false);
        }).then(function(value) {
          assert.equal(value, "value");
          done();
        }, function(reason) {
          assert.ok(false);
        });

        promise.fulfill("value");
      });
    });

    describe("reject", function() {
      it("rejects the promise", function(done) {
        var promise = Promises.create();

        var promise2 = promise.then(function(value) {
          assert.ok(false);
        }, function(reason) {
          assert.equal(reason, "reason");
          done();
        });

        promise.reject("reason");
      });

      it("can be called before then", function(done) {
        var promise = Promises.create();
        promise.reject("reason");

        var returned = false;

        promise.then(function(value) {
          assert.ok(false);
        }, function(reason) {
          assert.equal(returned, true);
          assert.equal(reason, "reason");
          done();
        });

        returned = true;
      });

      it("cannot be called after a promise is already completed", function() {
        var promise = Promises.create();

        promise.then(function() {}, function() {});
        promise.fulfill("yay!");

        assert.throws(function() {
          promise.reject("boo");
        });
      });

      it("value returned from onReject is passed to promise2's onFulfill", function(done) {
        var promise = Promises.create();

        var promise2 = promise.then(function(value) {
          assert.ok(false);
        }, function(reason) {
          // even though this promise is rejected, this returned value should
          // call the fulfill function of promise2.
          return "rejectvalue";
        });

        promise2.then(function(value) {
          assert.equal(value, "rejectvalue");
          done();
        }, function() {
          assert.ok(false);
        });

        promise.reject("reason");
      });

      it("exception thrown in onRejected is passed to promise2's onRejected", function(done) {
        var promise = Promises.create();

        var promise2 = promise.then(function(value) {
          assert.ok(false);
        }, function(reason) {
          // this error should be propagated to promise2's onRejected
          throw new Error("rejected onRejected");
        });

        promise2.then(function(value) {
          assert.ok(false);
        }, function(reason) {
          assert.equal(String(reason), "Error: rejected onRejected");
          done();
        });

        promise.reject("reason");
      });

      it("pass rejection to first registered onRejected", function(done) {
        var promise = Promises.create();

        promise.then(function(value) {
          assert.ok(false);
        }, null).then(function(value) {
          assert.ok(false);
        }, function(reason) {
          assert.equal(reason, "reason");
          done();
        });

        promise.reject("reason");
      });
    });
  });

}());

