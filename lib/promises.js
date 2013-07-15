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
    /*jshint validthis: true*/
    if (this._callbacks) {
      var info;
      /*jshint boss: true*/
      while (info = this._callbacks.shift()) {
        var promise = info.promise;
        try {
          var returnedVal = this._value;
          if (typeof info[this._state] === "function") {
            returnedVal = info[this._state](this._value);
            if (returnedVal && typeof returnedVal.then === "function") {
              var fulfill = bind(promise.fulfill, promise);
              var reject = bind(promise.reject, promise);
              return returnedVal.then(fulfill, reject);
            }

            defer(bind(promise.fulfill, promise), returnedVal);
          } else {
            defer(bind(promise[this._state], promise), returnedVal);
          }

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
      if (!this._callbacks) this._callbacks = [];

      var returnedPromise = exports.Promises.create();

      this._callbacks.push({
        fulfill: onFulfilled,
        reject: onRejected,
        promise: returnedPromise
      });


      if (this._state === "fulfill" || this._state === "reject") {
        defer(bind(complete, this));
      }

      return returnedPromise;
    },

    fulfill: function(value) {
      if (this._state !== "pending") throw new Error("promise already completed");

      this._value = value;
      this._state = "fulfill";

      complete.call(this);
      return this;
    },

    reject: function(reason) {
      if (this._state !== "pending") throw new Error("promise already completed");

      this._value = reason;
      this._state = "reject";

      complete.call(this);
      return this;
    },

    otherwise: function(func) {
      return this.then(null, func);
    },

    ensure: function(func) {
      return this.then(func, func);
    }
  };

  exports.Promises = {
    create: function() {
      return new Promise();
    }
  };

}(typeof module !== "undefined" ? module.exports : window));

