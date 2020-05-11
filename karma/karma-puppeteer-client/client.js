/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

;(function (global) {
  /* global karmaPuppeteer */
  'use strict'

  function noCleanup() {}

  function withSelector(methodName) {
    return function(var_args) {
      var args = Array.prototype.slice.call(arguments, 0);
      var node = args[0].nodeType ? args[0] : null;
      var cleanup = noCleanup;
      if (node) {
        var uniqueId = Math.random();
        node.setAttribute('karma_puppeteer_id', uniqueId);
        args[0] = '[karma_puppeteer_id="' + uniqueId + '"]';
        cleanup = function() {
          node.removeAttribute('karma_puppeteer_id');
        };
      }
      return global['__karma_puppeteer_' + methodName].apply(null, args)
        .then(function(value) {
          cleanup();
          return value;
        }, function(reason) {
          cleanup();
          throw reason;
        });
    };
  }

  window.karmaPuppeteer = {
    click: withSelector('click'),
    focus: withSelector('focus'),
  };

}(typeof window !== 'undefined' ? window : global))
