/*globals setTimeout, Promises*/
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function(exports) {
  "use strict";

  function bind(func, context) {
    return function() {
      var args = [].slice.call(arguments, 0);
      func.apply(context, args);
    };
  }

  function defer(callback) {
    var args = [].slice.call(arguments, 1);
    setTimeout(function() {
      callback.apply(null, args);
    }, 0);
  }


  function complete(arr, val) {
    if (arr) {
      var info;
      /*jshint boss: true*/
      while (info = arr.shift()) {
        var promise = info.promise;
        try {
          var returnedVal = info.callback(val);

          if (returnedVal && returnedVal.then) {
            var fulfill = bind(promise.fulfill, promise);
            var reject = bind(promise.reject, promise);
            return returnedVal.then(fulfill, reject);
          }

          defer(bind(promise.fulfill, promise), returnedVal);
        } catch(e) {
          defer(bind(promise.reject, promise), e);
        }
      }
    }
  }

  var Promise = function() {};
  Promise.prototype = {
    _state: "pending",
    then: function(onFulfilled, onRejected) {
      if (!this._fulfill) this._fulfill = [];
      if (!this._reject) this._reject = [];

      var returnedPromise = Promises.create();

      if (typeof onFulfilled === "function") {
        this._fulfill.push({
          callback: onFulfilled,
          promise: returnedPromise
        });
      }

      if (typeof onRejected === "function") {
        this._reject.push({
          callback: onRejected,
          promise: returnedPromise
        });
      }

      if (this._state === "fulfilled") {
        defer(complete, this._fulfill, this._value);
      }
      else if (this._state === "rejected") {
        defer(complete, this._reject, this._value);
      }

      return returnedPromise;
    },

    fulfill: function(value) {
      if (this._state !== "pending") throw new Error("promise already completed");

      this._value = value;
      this._state = "fulfilled";

      complete(this._fulfill, value);
    },

    reject: function(reason) {
      if (this._state !== "pending") throw new Error("promise already completed");

      this._value = reason;
      this._state = "rejected";

      complete(this._reject, reason);
    }
  };

  exports.Promises = {
    create: function() {
      return new Promise();
    }
  };

}(window));

