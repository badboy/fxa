/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This model limits the number of emails a component can send

define([
  'backbone',
  'lib/constants'
], function (Backbone, Constants) {
  'use strict';

  function shouldResend (tries, maxTries) {
    return tries === 1 || tries === maxTries;
  }

  var EmailResend = Backbone.Model.extend({
    defaults: {
      tries: 0
    },

    initialize: function (opt) {
      opt = opt || {};
      this.maxTries = opt.maxTries || Constants.EMAIL_RESEND_MAX_TRIES;
    },

    incrementRequestCount: function () {
      var tries = this.get('tries') + 1;
      this.set('tries', tries);

      if (tries >= this.maxTries) {
        this.trigger('maxTriesReached');
      }
    },

    shouldResend: function () {
      return shouldResend(this.get('tries'), this.maxTries);
    },

    reset: function () {
      this.set('tries', 0);
    }
  });

  return EmailResend;
});
