TV UI for Z-Way server. Uses Z-Way HA API (ZAutomation) to control Z-Way home automation engine.

Compilation:

# Install gulp and dependencies
npm install

# Build for debuging
gulp build
git checkout -- build/css/zwayfont.css build/fonts/*

# Build minimized files for production
gulp build --production
git checkout -- build/css/zwayfont.css build/fonts/*

To use another Z-Way API server add host and port arguments to the URL:
index.html?host=HOST&port=PORT
