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
import { Editor, EditorState } from 'draft-js';
import { fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { Fixture } from '../../../karma/fixture';
import { useStory } from '../../../app/story';
import { useInsertElement } from '../../../components/canvas';
import { TEXT_ELEMENT_DEFAULT_FONT } from '../../../app/font/defaultFonts';
import { getSelectionForAll } from '../../../components/richText/util';

describe('TextEdit integration', () => {
  let fixture;
  let editorStub;

  beforeEach(async () => {
    fixture = new Fixture();
    editorStub = fixture.stubComponent(Editor);

    await fixture.render();
  });

  afterEach(() => {
    fixture.restore();
  });

  it('should render ok', () => {
    expect(
      fixture.container.querySelector('[data-testid="fullbleed"]')
    ).toBeTruthy();
  });

  describe('add a text', () => {
    let element;
    let frame;

    beforeEach(async () => {
      const insertElement = await fixture.renderHook(() => useInsertElement());
      element = await fixture.act(() =>
        insertElement('text', {
          font: TEXT_ELEMENT_DEFAULT_FONT,
          content: 'hello world!',
        })
      );

      frame = fixture.querySelector(
        `[data-element-id="${element.id}"] [data-testid="textFrame"]`
      );
    });

    it('should render initial content', () => {
      expect(frame.textContent).toEqual('hello world!');
    });

    describe('edit mode', () => {
      let editor;
      let editLayer;

      beforeEach(() => {
        fixture.fireEvent.click(frame);
        editor = fixture.querySelector('[data-testid="textEditor"]');
        editLayer = fixture.querySelector('[data-testid="editLayer"]');
      });

      it('should mount editor', () => {
        expect(editor).toBeTruthy();
        // expect(editorStub.props.editorState).toBeTruthy();
        expect(editLayer).toBeTruthy();
      });

      it('should handle a commnad, exit and save', async () => {
        const draft = editor.querySelector('[contenteditable="true"]');
        await fixture.act(() => {
          draft.focus();
        });

        // Select all.
        await fixture.act(() => {
          document.execCommand('selectAll', false, null);
        });

        // @todo: Linux uses ctrlKey.
        fireEvent.keyDown(draft, {key: 'b', code: 'KeyB', keyCode: 66, metaKey: true});

        // Exit edit mode.
        fixture.fireEvent.mouseDown(editLayer);

        expect(
          fixture.querySelector('[data-testid="textEditor"]')
        ).toBeNull();

        // The element is still selected and updated.
        const storyContext = await fixture.renderHook(() => useStory());
        expect(storyContext.state.selectedElementIds).toEqual([
          element.id,
        ]);
        expect(storyContext.state.selectedElements[0].content).toEqual(
          '<strong>hello world!</strong>'
        );

        // The content is updated in the frame.
        expect(frame.innerHTML).toEqual(
          '<strong>hello world!</strong>'
        );
      });
    });

    describe('edit mode with editor stub', () => {
      let editor;
      let editLayer;

      beforeEach(() => {
        editorStub.mockImplementation((props, ref) => (
          <div ref={ref} contentEditable={true} />
        ));

        fixture.fireEvent.click(frame);
        editor = fixture.querySelector('[data-testid="textEditor"]');
        editLayer = fixture.querySelector('[data-testid="editLayer"]');
      });

      it('should mount editor', () => {
        expect(editor).toBeTruthy();
        expect(editorStub.props.editorState).toBeTruthy();
        expect(editLayer).toBeTruthy();
      });

      it('should handle a commnad, exit and save', async () => {
        // Select all.
        await fixture.act(() => {
          const { onChange, editorState } = editorStub.props;
          onChange(
            EditorState.forceSelection(
              editorState,
              getSelectionForAll(editorState.getCurrentContent())
            )
          );
        });

        // Run a command.
        await fixture.act(() => {
          const { handleKeyCommand, editorState } = editorStub.props;
          return handleKeyCommand('bold', editorState);
        });

        // Exit edit mode.
        fixture.fireEvent.mouseDown(editLayer);

        expect(
          fixture.querySelector('[data-testid="textEditor"]')
        ).toBeNull();

        // The element is still selected and updated.
        const storyContext = await fixture.renderHook(() => useStory());
        expect(storyContext.state.selectedElementIds).toEqual([
          element.id,
        ]);
        expect(storyContext.state.selectedElements[0].content).toEqual(
          '<strong>hello world!</strong>'
        );

        // The content is updated in the frame.
        expect(frame.innerHTML).toEqual(
          '<strong>hello world!</strong>'
        );
      });
    });
  });
});
