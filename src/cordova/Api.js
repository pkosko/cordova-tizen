/*
    this file is found by cordova-lib when you attempt to
    'cordova platform add PATH' where path is this repo.
*/

/*jslint node: true */

var shell = require('shelljs');
var path = require('path');

var CordovaLogger = require('cordova-common').CordovaLogger;
var selfEvents = require('cordova-common').events;

// global variables
var templateDir;
var appName;
var packageId;

var PLATFORM_NAME = 'testplatform';

function setupEvents(externalEventEmitter) {
    if (externalEventEmitter) {
        // This will make the platform internal events visible outside
        selfEvents.forwardEventsTo(externalEventEmitter);
        return externalEventEmitter;
    }

    // There is no logger if external emitter is not present,
    // so attach a console logger
    CordovaLogger.get().subscribe(selfEvents);
    return selfEvents;
}

function Api(platform, platformRootDir, events) {

    this.platform = platform || PLATFORM_NAME;
    this.root = path.resolve(__dirname, '..');

    this.locations = {
        platformRootDir: platformRootDir,
        root: this.root,
        www: path.join(this.root, 'assets/www'),
        res: path.join(this.root, 'res'),
        platformWww: path.join(this.root, 'platform_www'),
        configXml: path.join(this.root, 'res/xml/config.xml'),
        defaultConfigXml: path.join(this.root, 'cordova/defaults.xml'),
        build: path.join(this.root, 'build'),
        // NOTE: Due to platformApi spec we need to return relative paths here
        cordovaJs: 'bin/templates/project/assets/www/cordova.js',
        cordovaJsSrc: 'cordova-js-src'
    };

}

Api.createPlatform = function (destination, config, options, events) {

    events = setupEvents(events);

    // create the destination and the standard place for our api to live
    // platforms/platformName/cordova/Api.js

    var apiSrcPath = __dirname; // default value
    // does options contain the info we desire?

    var projectName = config ? config.name() : "HelloCordova";

    events.emit('log', 'Creating Cordova project for cordova-platform-test:');
    events.emit('log', '\tPath: ' + destination);
    events.emit('log', '\tName: ' + projectName);

    shell.mkdir('-p', destination);

    // move a copy of our api to the new projects
    shell.cp('-r',apiSrcPath, destination);

    // I promise I will return
    return Promise.resolve(new Api(PLATFORM_NAME,destination,events));

};


Api.updatePlatform = function (destination, options, events) {
    events = setupEvents(events); // TODO check
    events.emit('log', "test-platform:Api:updatePlatform");
    // todo?: create projectInstance and fulfill promise with it.
    return Promise.resolve();
};

Api.prototype.getPlatformInfo = function () {
    console.log('log', "test-platform:Api:getPlatformInfo");
    // return PlatformInfo object

    return {
        "locations":this.locations,
        "root": this.root,
        "name": this.platform,
        "version": require('./version'),
        "projectConfig": this._config
    };
};

function copyTree(src, dst) {
    var files = shell.ls(src);
    var dstDirName = path.basename(dst);
    for (f in files) {
        var name = files[f];
        console.log("name " + name + " vs dst " + dst );
        if (name == dstDirName) {
            continue;
        } else {
            s = src + "/" + name;
            d = dst + "/";
            console.log("copying " + s + " to " + d);
            shell.cp('-Rf', s, d);
        }
    }
}

//TODO
Api.prototype.prepare = function (cordovaProject) {
    console.log('log', "test-platform:Api:prepare");
    //return require('./lib/prepare').prepare.call(this, cordovaProject);

    // TODO check if tizen CLI is available

    //creating application template using tizen cli
    // TODO read packageId from config
    packageId = "cordov0001"; // hardcoded package id
    // TODO allow call from different dirs
    var directory = ".";
    // TODO read the name from config
    appName = "cordovaTest";
    // TODO read profile from config
    var profile = "mobile-4.0";
    // TODO should we care about template??
    template = "WebBasicApplication";

    // **** creating Tizen application directory ***********************************
    templateDir = path.join(directory, appName);
    if (shell.test('-e', templateDir)) {
        // remove the directory - application will be created from the beginning
        //console.log("we should remove " + templateDir);
        shell.rm('-rf', templateDir);
    }

    // create application using tizen cli
    var command = "tizen create web-project -p " + profile + " -t " + template + " -n " + appName + " -- " + templateDir;
    shell.exec(command);

    // copy the cordova application content into tizen template
    // Fill the template with proper content of application
    copyTree(directory, templateDir);

    // TODO
    //modifyConfigFile(app_name, package_id, dir_name)

    // TODO
    //copyCordovaFiles(app_name, dir_name)
    return Promise.resolve();
};

//TODO
Api.prototype.addPlugin = function (plugin, installOptions) {
    console.log('log', "test-platform:Api:addPlugin");
    return Promise.resolve();
};

//TODO
Api.prototype.removePlugin = function (plugin, uninstallOptions) {
    console.log('log', "test-platform:Api:removePlugin");
    return Promise.resolve();
};

//TODO
Api.prototype.build = function (buildOptions) {
    console.log('log', "test-platform:Api:build");

    // TODO check directory passing into function
    var d = templateDir;

    var buildCommand = "tizen build-web -- " + d;
    shell.exec(buildCommand);

    var packageCommand = "tizen package -t wgt -- " + d;
    shell.exec(packageCommand);

    return Promise.resolve();
};

//TODO
Api.prototype.run = function(runOptions) {
    console.log('log', "test-platform:Api:run");
    // TODO check directory passing into function
    var d = templateDir;

    //TODO add checking if device is connected
    //TODO add starting emulator

    // installing application
    var installCommand = "tizen install -n " + appName + ".wgt -- " + d;
    shell.exec(installCommand);

    var runCommand = "tizen run -p " + packageId;
    shell.exec(runCommand);

    shell.exec("./platforms/cordova-test-platform/cordova/lib/runAsTizenApp.py .");
};

//TODO
Api.prototype.clean = function(cleanOptions) {
    console.log('log', "test-platform:Api:clean");
    // TODO check directory passing into function
    var d = templateDir;

    var cleanCommand = "tizen clean -- " + d;
    shell.exec(cleanCommand);
    return Promise.resolve();
};

//TODO
Api.prototype.requirements = function() {
    console.log('log', "test-platform:Api:requirements");
    return true;
};

module.exports = Api;
