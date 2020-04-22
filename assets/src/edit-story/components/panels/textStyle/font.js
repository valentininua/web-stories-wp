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
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import styled from 'styled-components';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Numeric, Row, DropDown } from '../../form';
import { PAGE_HEIGHT } from '../../../constants';
import { useFont } from '../../../app/font';
import { getCommonValue } from '../utils';

const Space = styled.div`
  flex: 0 0 10px;
`;

const BoxedNumeric = styled(Numeric)`
  padding: 6px 6px;
  border-radius: 4px;
`;

function FontControls({ selectedElements, pushUpdate }) {
  const content = getCommonValue(selectedElements, 'content');
  const fontFamily = getCommonValue(selectedElements, 'fontFamily');
  const fontSize = getCommonValue(selectedElements, 'fontSize');
  const fontWeight = getCommonValue(selectedElements, 'fontWeight');
  const fontStyle = getCommonValue(selectedElements, 'fontStyle');

  const {
    state: { fonts },
    actions: { maybeEnqueueFontStyle, getFontWeight, getFontFallback },
  } = useFont();
  const fontWeights = useMemo(() => getFontWeight(fontFamily), [
    getFontWeight,
    fontFamily,
  ]);

  return (
    <>
      {fonts && (
        <Row>
          <DropDown
            data-testid="font"
            ariaLabel={__('Font family', 'web-stories')}
            options={fonts}
            value={fontFamily}
            onChange={async (value) => {
              const currentFontWeights = getFontWeight(value);
              const currentFontFallback = getFontFallback(value);
              const fontWeightsArr = currentFontWeights.map(
                ({ value: weight }) => weight
              );
              await maybeEnqueueFontStyle({
                fontFamily: value,
                content,
                fontWeight,
                fontStyle,
              });
              // Find the nearest font weight from the available font weight list
              // If no fontweightsArr available then will return undefined
              const newFontWeight =
                fontWeightsArr &&
                fontWeightsArr.reduce((a, b) =>
                  Math.abs(parseInt(b) - fontWeight) <
                  Math.abs(parseInt(a) - fontWeight)
                    ? b
                    : a
                );
              pushUpdate(
                {
                  fontFamily: value,
                  fontWeight: parseInt(newFontWeight),
                  fontFallback: currentFontFallback,
                },
                true
              );
            }}
          />
        </Row>
      )}
      <Row>
        {fontWeights && (
          <>
            <DropDown
              data-testid="font.weight"
              ariaLabel={__('Font weight', 'web-stories')}
              options={fontWeights}
              value={fontWeight}
              onChange={async (value) => {
                await maybeEnqueueFontStyle({
                  fontFamily,
                  content,
                  fontWeight: value,
                  fontStyle,
                });
                pushUpdate({ fontWeight: parseInt(value) }, true);
              }}
            />
            <Space />
          </>
        )}
        <BoxedNumeric
          data-testid="font.size"
          ariaLabel={__('Font size', 'web-stories')}
          value={fontSize}
          max={PAGE_HEIGHT}
          flexBasis={58}
          textCenter
          onChange={(value) => pushUpdate({ fontSize: value })}
        />
      </Row>
    </>
  );
}

FontControls.propTypes = {
  selectedElements: PropTypes.array.isRequired,
  pushUpdate: PropTypes.func.isRequired,
};

export default FontControls;
