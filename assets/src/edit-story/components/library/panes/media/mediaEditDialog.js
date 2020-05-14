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
import styled, { css } from 'styled-components';
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
import { useSnackbar } from '../../../../app/snackbar';
import UseMedia from '../../../../app/media/useMedia';

const styledMediaThumbnail = css`
  display: flex;
  width: 152px;
  margin-right: 28px;
`;

const Image = styled.img`
  ${styledMediaThumbnail}
`;

const Video = styled.video`
  ${styledMediaThumbnail}
`;

const DialogBody = styled.div`
  max-width: 452px;
  display: flex;
  justify-content: left;
  align-items: flex-start;
`;

const MetadataTextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const MediaTitleText = styled.div`
  font-weight: bold;
  color: #3c4043;
`;

const MediaSizeText = styled.div`
  font-size: 16px;
  color: #3c4043;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.fg.v13};
  border: 1px solid #d3d4d4;
  box-sizing: border-box;
  border-radius: 4px;
  font-size: 15px;
  padding: 7px 10px;
  margin-top: 20px;
  margin-bottom: 4px;
`;

const DialogDescription = styled.div`
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.grayout};
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
  const {
    id,
    src,
    title,
    width,
    height,
    type,
    alt,
    poster,
    mimeType,
  } = resource;
  const {
    actions: { updateMedia },
  } = useAPI();
  const {
    actions: { updateMediaElement },
  } = UseMedia();
  const { showSnackbar } = useSnackbar();
  const [altText, setAltText] = useState(alt);
  const [shouldUpdate, setShouldUpdate] = useState(false);

  const handleAltTextChange = useCallback((evt) => {
    setAltText(evt.target.value);
  }, []);

  useEffect(() => {
    const updateMediaItem = async () => {
      setShouldUpdate(false);
      try {
        // Update server.
        await updateMedia(id, { alt_text: altText });
        // Update internal state.
        updateMediaElement({ id, alt: altText });
        setShowEditDialog(false);
      } catch (err) {
        showSnackbar({
          message: __(
            'Failed to update media item, please try again.',
            'web-stories'
          ),
        });
      }
    };
    shouldUpdate ? updateMediaItem() : null;
  }, [
    altText,
    id,
    resource,
    setShowEditDialog,
    shouldUpdate,
    showSnackbar,
    updateMedia,
    updateMediaElement,
  ]);

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
      <DialogBody>
        {type == 'image' ? (
          <Image src={src} alt={alt} loading={'lazy'} />
        ) : (
          <Video key={src} poster={poster} preload="none" muted>
            <source src={src} type={mimeType} />
          </Video>
        )}
        <MetadataTextContainer>
          <MediaTitleText>{title}</MediaTitleText>
          <MediaSizeText>
            {sprintf(
              /* translators: 1: image width. 2: image height. */
              __('%1$d x %2$d pixels', 'web-stories'),
              width,
              height
            )}
          </MediaSizeText>
          <Input
            value={altText}
            type="text"
            placeholder={__('Alt text', 'web-stories')}
            onChange={handleAltTextChange}
          />
          <DialogDescription>
            {type == 'image' ? imageDialogDescription : videoDialogDescription}
          </DialogDescription>
        </MetadataTextContainer>
      </DialogBody>
    </Dialog>
  );
}

MediaEditDialog.propTypes = {
  resource: PropTypes.object,
  showEditDialog: PropTypes.bool,
  setShowEditDialog: PropTypes.func,
};

export default MediaEditDialog;
