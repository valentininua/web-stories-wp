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
/* eslint no-await-in-loop: 0, no-console: 0 */
const playwright = require('playwright');

let supportedBrwosers = ['chromium', 'firefox', 'webkit'];
let headless = true;
let slowMo = headless ? undefined : 100;

const browserName = process.argv[2];
// DEBUG=pw:input
// console.log(process);
let browsers = browserName ? [browserName] : supportedBrwosers ;
// headless = false;

let debugSafari = false;
if (debugSafari) {
  browsers = ['webkit'];
  headless = false;
  // slowMo = 200;
}

const logWithLabel = label => (...args) => console.log(label, ...args);

(async () => {
  for (const browserType of browsers) {
    let browser;
    const log = logWithLabel(`[${browserType}]`);
    try {
      log('Start:', browserType);
      browser = await playwright[browserType].launch({
        headless,
        slowMo,
      });
      const context = await browser.newContext({
        viewport: { width: 1280, height: 1024 },
      });
      const page = await context.newPage();

      // Setup
      log('Login, we can skip it in the future with static build');
      await page.goto(
        'http://192.168.1.48:8899/wp-admin/post-new.php?post_type=web-story',
        { waitUntil: 'networkidle' }
      );
      await page.fill('#user_login', 'admin');
      await page.fill('#user_pass', 'password');
      await page.click('#wp-submit');
      await page.waitForSelector('[data-testid="fullbleed"]');
      await page.waitForSelector(
        '#library-pane-media [data-testid="mediaElement"]'
      ); // Just for now, wait for media

      // await page.waitForTimeout(55000);

      // Actual test
      await page.click('[aria-label="Add new text element"]'); // with DOM testing library it can be page.getByLabelText('Add new text element')

      if (debugSafari) {
        log('wait to select')
        await page.waitForTimeout(5000);
      }
      await page.click('[data-testid="textFrame"]');
      // await page.click('[data-testid="frameElement"]');
      await page.click('[contenteditable="true"]'); // Fix for Safari

      // Select all
      // v1
      // await page.keyboard.press('Control+A'); // NOTE On MacOS, keyboard shortcuts like ⌘ A -> Select All do not work.
      // v2
      await page.evaluate(() => document.execCommand('selectall', false, null));
      // v3
      const activeElement = await page.evaluateHandle(
        () => document.activeElement
      );
      // // activeElement works differently on Safari: ? "on macOS systems, elements that aren't text input elements are not typically focusable by default."
      log(await activeElement.innerHTML())
      // await activeElement.selectText();
      // await activeElement.type(text);

      if (debugSafari) {
        log('selectall')
        await page.waitForTimeout(5000);
      }

      const text = 'hello world!';
      await page.keyboard.type('hello world!');
      if (debugSafari) {
        log('typed hw')
        await page.waitForTimeout(5000);
      }

      // Select all
      await page.evaluate(() => document.execCommand('selectall', false, null));

      // Bold by key
      await page.keyboard.press('Meta+B');

      // Exit text editor, we should also test clickOutside
      await page.keyboard.press('Escape');

      await page.waitForSelector('[data-testid="textEditor"]', { state: 'detached' });

      // Insert image
      // await page.click('#library-pane-media [data-testid="mediaElement"]');

      // If we really need story data
      const storyData = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const interval = setInterval(() => {
              if (window.storyData) {
                clearInterval(interval);
                resolve(window.storyData);
              }
            }, 0);
          })
      );

      const elementText = storyData.pages[0].elements[1].content;
      log('Text element content:', elementText);
      // if (elementText !== text) {
      //   throw new Error(`Expected: ${text} but got ${elementText}`);
      // }

      // Clean up
      if (!headless) {
        await page.waitForTimeout(1000);
      }
      await page.screenshot({ path: `test-text-${browserType}.png` });
      log(`Done: ${browserType} ✅`);
    } catch (error) {
      log(error);
      log(`Done: ${browserType} ❌`);
    } finally {
      await browser.close();
      log();
    }
  }
})();
