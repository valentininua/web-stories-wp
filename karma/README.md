


## Common issues:

### Annoying firewall question: "Do you want to the application Chromium.app to accept incoming network connections?"

See https://github.com/puppeteer/puppeteer/issues/4752

```sh
sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-*/chrome-mac/Chromium.app
```

### The browser window needs to be visible for some actions

* page.click(selector) seems to require visibility.
????
