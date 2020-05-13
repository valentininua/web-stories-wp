for i in chromium firefox webkit; do
    BROWSER=$i jest --runInBand --config=tests/e2e-playwright/jest.config.js &
done
wait
