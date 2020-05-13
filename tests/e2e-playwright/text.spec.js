jest.setTimeout(35 * 1000);
const browserType = process.env.BROWSER;

describe('Text element editor', () => {
  beforeAll(async () => {
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
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should display "google" text on page', async () => {
    // Quick add text element
    await page.click('[aria-label="Add new text element"]');

    // Enter edit mode
    await page.click('[data-testid="textFrame"]');
    await page.click('[contenteditable="true"]'); // Fix for Safari

    // Select all
    // v1
    // await page.keyboard.press('Control+A'); // NOTE On MacOS, keyboard shortcuts like ⌘ A -> Select All do not work.
    // v2
    await page.evaluate(() => document.execCommand('selectall', false, null));
    // v3
    // const activeElement = await page.evaluateHandle(
    //   () => document.activeElement
    // );
    // // activeElement works differently on Safari: ? "on macOS systems, elements that aren't text input elements are not typically focusable by default."
    // await activeElement.selectText();
    // await activeElement.type(text);

    const text = 'hello world!';
    await page.keyboard.type(text);

    // Select all
    await page.evaluate(() => document.execCommand('selectall', false, null));

    // Bold by key
    await page.keyboard.press('Meta+B');

    // Exit text editor, we should also test clickOutside
    await page.keyboard.press('Escape');

    await page.waitForSelector('[data-testid="textEditor"]', {
      state: 'detached',
    });

    // Insert image
    await page.click('#library-pane-media [data-testid="mediaElement"]');

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
    console.log({ elementText });

    const frame = await page.$(`[data-testid="textFrame"]`);
    const innerHTML = await frame.innerHTML();
    expect(innerHTML).toEqual(
      `<span style="font-weight: 700">${text}</span>`
    );

    await page.screenshot({ path: `test-text-${browserType}.png` });
  });
});
