# TV user interface for Z-Way server
Uses Z-Way HA API (ZAutomation) to control Z-Way home automation engine. Designed to be used with a remote control and shown on a HD TV.

## Compilation:

### Install gulp and dependencies
    npm install

### Build for debuging
    gulp build
    git checkout -- build/css/zwayfont.css build/fonts/*

### Build minimized files for production
    gulp build --production
    git checkout -- build/css/zwayfont.css build/fonts/*

## Interaction with Z-Way API
### Authentication in Z-Way API
Currently TV UI have no authentication. It relies on Z-Way having local user (user that automatically authenticates if request comes from localhost/127.0.0.1). Z-Way can also have anonymous user to serve TV UI and others.

### Use another Z-Way API
To use another Z-Way API server (not same as the UI is served from) add host and port arguments to the URL:

    index.html?host=HOST&port=PORT

## ToDo
- Add multilanguage support
- Implement more device types (InfoWidget)
- Add authentication
