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
import styled from 'styled-components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { PatternPropType } from '../../../types';
import ColorPreview from './colorPreview';
import OpacityPreview from './opacityPreview';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

function ColorInput({
  onChange,
  hasGradient,
  isMultiple,
  opacity,
  value,
  label,
}) {
  return (
    <Container>
      <ColorPreview
        onChange={onChange}
        hasGradient={hasGradient}
        isMultiple={isMultiple}
        value={value}
        label={label}
      />
      <OpacityPreview opacity={opacity} label={label} />
    </Container>
  );
}

ColorInput.propTypes = {
  value: PatternPropType,
  isMultiple: PropTypes.bool,
  hasGradient: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  opacity: PropTypes.number,
  label: PropTypes.string,
};

ColorInput.defaultProps = {
  defaultColor: null,
  isMultiple: false,
  hasGradient: false,
  opacity: null,
  labelledBy: null,
};

export default ColorInput;