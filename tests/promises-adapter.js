/*globals  */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Promises = require("../lib/promises").Promises;

/**
 * This is an adapter to work with the promises-test suite
 * https://github.com/promises-aplus/promises-tests.git
 */

module.exports = {
  fulfilled: function(value) {
    return Promises.create().fulfill(value);
  },
  rejected: function(reason) {
    return Promises.create().reject(reason);
  },
  pending: function() {
    var promise = Promises.create();
    return {
      promise: promise,
      fulfill: function(value) {
        try {
          // The tests cannot deal with exceptions.
          promise.fulfill(value);
        } catch(e) {
        }
      },
      reject: function(reason) {
        try {
          promise.reject(reason);
        } catch(e) {
        }
      }
    };
  }
};


