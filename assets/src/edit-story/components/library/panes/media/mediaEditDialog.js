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
import { useCallback, useEffect, useState } from 'react';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useAPI } from '../../../../app/api';
import Dialog from '../../../../components/dialog';
import { Plain } from '../../../../components/button';

const Image = styled.img`
  width: 100px;
  height: 100px;
`;

const Video = styled.video`
  width: 100px;
  height: 100px;
`;

const Input = styled.input`
  background: #ffffff;
  border: 1px solid #d3d4d4;
  box-sizing: border-box;
  border-radius: 4px;
`;

const imageDialogTitle = __('Edit Image', 'web-stories');
const videoDialogTitle = __('Edit Video', 'web-stories');
const imageDialogDescription = __(
  'Describe the appearance and function of an image. Leave empty if the image is purely decorative',
  'web-stories'
);
const videoDialogDescription = __(
  'Describe the appearance and function of a video. Leave empty if the video is purely decorative',
  'web-stories'
);

/**
 * Displays a dialog where the user can edit the selected media element.
 *
 * @param {Object} props Component props.
 * @param {Object} props.resource Selected media element's resource object.
 * @param {Object} props.showEditDialog If dialog should be displayed.
 * @param {Object} props.setShowEditDialog Callback to toggle dialog display.
 * @return {null|*} The dialog element.
 */
function MediaEditDialog({ resource, showEditDialog, setShowEditDialog }) {
  const { id, src, title, type, alt, poster, mimeType } = resource;
  const {
    actions: { updateMedia },
  } = useAPI();
  const [altText, setAltText] = useState(alt);
  const [shouldUpdate, setShouldUpdate] = useState(false);

  const handleAltTextChange = useCallback((evt) => {
    setAltText(evt.target.value);
  }, []);

  useEffect(() => {
    const updateMediaItem = async () => {
      try {
        await updateMedia(id, { alt_text: altText });
        setShowEditDialog(false);
      } catch (err) {
        // TODO Display error message
      } finally {
        setShouldUpdate(false);
      }
    };
    shouldUpdate ? updateMediaItem() : null;
  }, [altText, id, setShowEditDialog, shouldUpdate, updateMedia]);

  return (
    <Dialog
      open={showEditDialog}
      onClose={() => setShowEditDialog(false)}
      title={type == 'image' ? imageDialogTitle : videoDialogTitle}
      actions={
        <>
          <Plain onClick={() => setShowEditDialog(false)}>
            {__('Cancel', 'web-stories')}
          </Plain>
          <Plain onClick={() => setShouldUpdate(true)}>
            {__('Save', 'web-stories')}
          </Plain>
        </>
      }
    >
      {type == 'image' ? (
        <Image src={src} width={100} height={100} alt={alt} loading={'lazy'} />
      ) : (
        <Video key={src} poster={poster} preload="none" muted>
          <source src={src} type={mimeType} />
        </Video>
      )}
      {title}
      {sprintf(
        /* translators: %(width)d: image width and %(height)d: image height. */
        __('%(width)d X %(height)d pixels', 'web-stories'),
        resource
      )}
      <Input
        value={altText}
        type="text"
        placeholder={__('Alt text', 'web-stories')}
        onChange={handleAltTextChange}
      />
      {type == 'image' ? imageDialogDescription : videoDialogDescription}
    </Dialog>
  );
}

MediaEditDialog.propTypes = {
  resource: PropTypes.object,
  showEditDialog: PropTypes.bool,
  setShowEditDialog: PropTypes.func,
};

export default MediaEditDialog;
