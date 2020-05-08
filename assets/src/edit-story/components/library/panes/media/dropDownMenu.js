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
import { useEffect, useState, useRef } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useAPI } from '../../../../app/api';
import DropDownList from '../../../../components/form/dropDown/list';
import Popup from '../../../../components/popup';
import { ReactComponent as More } from '../../../../icons/more_horiz.svg';

const MoreIcon = styled(More)`
  height: 28px;
  width: 28px;
`;

const IconContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
`;

/**
 * Get a More icon that displays a dropdown menu on click.
 *
 * @param {Object} props Component props.
 * @param {number} props.mediaId Selected media element.
 * @param {boolean} props.showDisplayIcon If the More icon should be displayed.
 * @param {function(boolean)} props.menuCallback Callback for when menu is opened / closed.
 * @return {null|*} Element or null if should not display the More icon.
 */
function DropDownMenu({ mediaId, showDisplayIcon, menuCallback }) {
  const {
    actions: { deleteMedia },
  } = useAPI();
  const options = [
    { name: __('Edit', 'web-stories'), value: 'edit' },
    { name: __('Delete', 'web-stories'), value: 'delete' },
  ];

  const [showMenu, setShowMenu] = useState(false);
  const [shouldDelete, setShouldDelete] = useState(false);
  const moreRef = useRef();

  const onClickMoreIcon = () => {
    setShowMenu(true);
    menuCallback(showMenu);
  };

  useEffect(() => {
    const deleteMediaItem = async () => {
      try {
        await deleteMedia(mediaId);
        // TODO Refresh media library
      } catch (err) {
        // TODO Display error message
      } finally {
        setShouldDelete(false);
      }
    };
    shouldDelete ? deleteMediaItem() : null;
  }, [deleteMedia, mediaId, shouldDelete]);

  const handleCurrentValue = (value) => {
    setShowMenu(false);
    menuCallback(showMenu);
    switch (value) {
      case 'edit':
        // TODO(#354): Edit Media Metadata via Media Library Hover Menu
        break;
      case 'delete':
        setShouldDelete(true);
        break;
      default:
        break;
    }
  };

  const toggleOptions = () => {
    setShowMenu(false);
    menuCallback(showMenu);
  };

  useEffect(() => menuCallback(showMenu), [showMenu, menuCallback]);

  // Keep icon and menu displayed if menu is open (even if user's mouse leaves the area).
  return (
    (showDisplayIcon || showMenu) && (
      <>
        <IconContainer ref={moreRef}>
          <MoreIcon
            onClick={onClickMoreIcon}
            aria-pressed={showMenu}
            aria-haspopup={true}
            aria-expanded={showMenu}
          />
        </IconContainer>
        <Popup anchor={moreRef} isOpen={showMenu} width={160}>
          <DropDownList
            handleCurrentValue={handleCurrentValue}
            options={options}
            toggleOptions={toggleOptions}
          />
        </Popup>
      </>
    )
  );
}

DropDownMenu.propTypes = {
  mediaId: PropTypes.number,
  showDisplayIcon: PropTypes.bool,
  menuCallback: PropTypes.func,
};

export default DropDownMenu;
