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

/**
 * External dependencies
 */
import { shallowEqual } from 'react-pure-render';
import React, { useCallback, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';

export { createContext, useContext } from 'use-context-selector';

/**
 * This hook returns a part of the context value by selector.
 * It will trigger a re-render only if the selected value has changed.
 *
 * @param {React.Context} context
 * @param {function(Object):Object} selector Returns a fragment of the context
 * that the consumer is interested in.
 * @param {function(Object, Object):boolean} equalityFn Used to compare the
 * selected context value. If the context fragment has not changed, a re-render
 * will not be triggered.
 * @return {Object} The selected context fragment.
 */
const useContextSelectorWithEqFn = (context, selector, equalityFn) => {
  const ref = useRef();

  // Update the selector fn to memoize the selected value by [equalityFn].
  const patchedSelector = equalityFn
    ? useCallback(
        (state) => {
          const selected = selector(state);
          if (equalityFn(ref.current, selected)) {
            return ref.current;
          }
          ref.current = selected;
          return selected;
        },
        [selector, equalityFn]
      )
    : selector;
  return useContextSelector(context, patchedSelector);
};

/**
 * This hook returns a part of the context value by selector.
 * It will trigger a re-render only if the selected value has changed, as
 * detected by a shallow equals of the selected context value.
 *
 * @param {React.Context} context
 * @param {function(Object):Object} selector Returns the part of the context
 * that the consumer is interested in.
 * @return {Object} The selected context fragment.
 */
export const useContextSelectorShallow = (context, selector) =>
  useContextSelectorWithEqFn(context, selector, shallowEqual);

export const identity = (state) => state;
