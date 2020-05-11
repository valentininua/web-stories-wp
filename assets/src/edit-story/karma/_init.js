
let rootEl;

beforeEach(() => {
  rootEl = document.createElement('test-root');
  rootEl.id = 'test-root-' + Math.floor(Math.random() * 10000000);
  rootEl.innerHTML = `
    <style>
      test-root, test-body {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        margin: 0;
      }
      test-body > div {
        width: 100%;
        height: 100%;
      }
    </style>
    <test-body>
    </test-body>
  `;
  document.body.appendChild(rootEl);
  const body = rootEl.querySelector('test-body');

  spyOnProperty(document, 'documentElement', 'get').and.returnValue(rootEl);
  spyOnProperty(document, 'body', 'get').and.returnValue(body);
  // @todo: ideally we can find a way to use a new <head> for each test, but
  // styled-components uses some side-effect-y global constants to manage
  // the stylesheet state, e.g. `masterSheet`.
  // See https://github.com/styled-components/styled-components/blob/4add697ac770634300f7775fc880882b5497bdf4/packages/styled-components/src/models/StyleSheetManager.js#L25
});

afterEach(() => {
  rootEl.remove();
});
