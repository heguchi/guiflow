var fs = require("fs");
var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var Menu = electron.Menu;
var dialog = electron.dialog;
const Config = require('electron-config');
const config = new Config();
const path = require('path');

app.on('window-all-closed', function() {
    app.quit();
});

var exec = require('child_process').exec;

var warn = function(message) {
    dialog.showMessageBox({
        type: "warning",
        title: "warning",
        message: message,
        buttons: ["close"]
    });
};
var sendToFocusedBrowser = function(channel) {
    return function() {
        var win = BrowserWindow.getFocusedWindow();
        if (!win) {
            return warn("no selected window");
        }
        win.webContents.send(channel);
    };
};
var mainMenu = {
    label: app.getName(),
    submenu: [{
        label: 'About guiflow',
        click: function() {
            dialog.showMessageBox({
                type: "info",
                title: "about guiflow",
                message: "version : 0.01",
                buttons: ["close"]
            });
        }
    }, {
        type: 'separator'
    }, {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function() {
            app.quit();
        }
    }, {
        label: 'Toggle Full Screen',
        accelerator: 'F11',
        click: function() {
            var win = BrowserWindow.getFocusedWindow();
            if (win) {
                win.setFullScreen(!win.isFullScreen());
            }
        }
    }, {
        label: 'Toggle Dev Tool',
        accelerator: 'F5',
        click: function() {
            var win = BrowserWindow.getFocusedWindow();
            if (win) {
                win.toggleDevTools();
            }
        }
    }]
};
var fileMenu = {
    label: 'File',
    submenu: [{
        label: 'New File',
        accelerator: 'CmdOrCtrl+N',
        click: function() {
            createWindow();
        },
    }, {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click: function() {
            dialog.showOpenDialog({
                defaultPath: getRecentDirectory(),
                properties: ['openFile'],
                filters: [{
                    name: 'Documents',
                    extensions: ['txt', 'md', 'text']
                }, ],
            }, function(fileNames) {
                if (fileNames) {
                    setRecentDirectory(fileNames[0]);
                    createWindow(fileNames[0]);
                }
            });
        },
    }, {
        label: "Save",
        accelerator: 'CmdOrCtrl+S',
        onlyFocusedWindow: true,
        click: sendToFocusedBrowser("save"),
    }, {
        label: "Save As...",
        accelerator: 'Shift+CmdOrCtrl+S',
        click: sendToFocusedBrowser("saveAs"),
    }]
};

var editMenu = {
    label: 'Edit',
    submenu: [{
            label: "Undo",
            accelerator: 'CmdOrCtrl+Z',
            click: sendToFocusedBrowser("undo"),
        }, {
            label: "Redo",
            accelerator: 'CmdOrCtrl+Y',
            click: sendToFocusedBrowser("redo"),
        }, {
            type: 'separator'
        }, {
            label: "Cut",
            accelerator: 'CmdOrCtrl+X',
            click: sendToFocusedBrowser("cut"),
        }, {
            label: "Copy",
            accelerator: 'CmdOrCtrl+C',
            click: sendToFocusedBrowser("copy"),
        }, {
            label: "Paste",
            accelerator: 'CmdOrCtrl+V',
            click: sendToFocusedBrowser("paste"),
        }, {
            label: "Select All",
            accelerator: 'CmdOrCtrl+A',
            click: sendToFocusedBrowser("selectAll"),
        },

    ]
};

var createWindow = function(fileName) {
    var mainWindow = null;
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        title: "guiflow -- " + (fileName ? fileName : "Untitled")
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
    if (fileName) {
        setTimeout(function() {
            mainWindow.webContents.send("open", fileName);
        }, 1000);
    }
    if (process.env.DEBUG) {
        mainWindow.toggleDevTools();
    }
};

var getRecentDirectory = function() {
  if (!config.has('recentDirectory')) config.set('recentDirectory', app.getPath('userDesktop'));
  return config.get('recentDirectory');
};

var setRecentDirectory = function(filepath) {
  config.set('recentDirectory', path.dirname(filepath));
};

app.on('ready', function() {
    var fileName = process.argv[2];
    var builtMenu = Menu.buildFromTemplate([
        mainMenu, fileMenu, editMenu
    ]);
    app.on("browser-window-blur", function() {});
    app.on("browser-window-focus", function() {});
    Menu.setApplicationMenu(builtMenu);
    var firstWindow = createWindow(fileName);

});
