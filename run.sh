for i in chromium firefox webkit; do
    node tests/e2e-playwright/text.js $i &
done
wait
