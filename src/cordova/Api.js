/*
    this file is found by cordova-lib when you attempt to
    'cordova platform add PATH' where path is this repo.
*/

/*jslint node: true */

var shell = require('shelljs');
var path = require('path');

var CordovaLogger = require('cordova-common').CordovaLogger;
var selfEvents = require('cordova-common').events;
var TizenConfig = require('./utils/TizenConfig.js');

// global variables
var templateDir;
var projectName;
var packageId;

var PLATFORM_NAME = 'cordova-tizen';

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
    console.log('log', "tizen:Api");
    console.log("p.kosko platform: " + platform)
    console.log("p.kosko platformRootDir: " + platformRootDir)

    this.platform = PLATFORM_NAME;
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
    console.log('log', "test-platform:Api:createPlatform");
    events = setupEvents(events);

    // create the destination and the standard place for our api to live
    // platforms/platformName/cordova/Api.js

    var apiSrcPath = __dirname; // default value
    // does options contain the info we desire?
    console.log("CONFIG:\n" + JSON.stringify(config, null, 2) + "\n");

    projectName = config ? config.name() : "HelloCordova";
    var packageName = config ? config.packageName() : "io.cordova.hellocordova";

    events.emit('log', 'Creating Cordova project for cordova-tizen:');
    events.emit('log', '\tapiSrcPath: ' + apiSrcPath);
    events.emit('log', '\tPath: ' + destination);
    events.emit('log', '\tName: ' + projectName);
    events.emit('log', '\tPackageName: ' + packageName);

    shell.mkdir('-p', destination);

    // move a copy of our api to the new projects
    shell.cp('-r', apiSrcPath, destination);

    // I promise I will return
    return Promise.resolve(new Api(PLATFORM_NAME, destination, events));
};


Api.updatePlatform = function (destination, options, events) {
    console.log('log', "test-platform:Api:updatePlatform");
    console.log("p.kosko - updatePlatform");
    events = setupEvents(events); // TODO check
    events.emit('log', "test-platform:Api:updatePlatform");
    // todo?: create projectInstance and fulfill promise with it.
    return Promise.resolve();
};

Api.prototype.getPlatformInfo = function () {
    console.log('log', "test-platform:Api:getPlatformInfo");
    console.log("getPlatformInfo: templateDir: " + templateDir);
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
        //console.log("name " + name + " vs dst " + dst );
        if (name == dstDirName) {
            continue;
        } else {
            s = src + "/" + name;
            d = dst + "/";
            //console.log("copying " + s + " to " + d);
            shell.cp('-Rf', s, d);
        }
    }
};

function modifyConfigFile(directory, file) {
    var configFile = path.join(directory, 'config.xml')
    var config = new TizenConfig(configFile);

    // setup necessary xml tags
    config.addXmlnsTizen();
    // TODO generate packageID
    // TODO parse common version
    config.addTizenApplicationNode("gM6KuxOYKJ", "3.0");
    // TODO handle file different from www/index.html
    config.changeContentSrc();

    // save a changed file
    config.write(configFile);
};

function prepareTizenApp() {
    console.log("p.kosko: prepareTizenApp");

    //creating application template using tizen cli
    // TODO allow call from different dirs
    var directory = ".";
    // TODO read the name from config
    appName = projectName ? projectName : "cordovaTest";
    // TODO read profile from config
    var profile = "mobile-4.0";
    // TODO should we care about template??
    template = "WebBasicApplication";

    // **** creating Tizen application directory ***********************************
    templateDir = path.join(path.resolve(directory), appName);
    console.log("prepareTizenApp: templateDir: " + templateDir);

    if (shell.test('-e', templateDir)) {
        // remove the directory - application will be created from the beginning
        //console.log("we should remove " + templateDir);
        shell.rm('-rf', templateDir);
        shell.mkdir(templateDir);
    }

    // create application using tizen cli
    /*var command = "tizen create web-project -p " + profile + " -t " + template + " -n " + appName + " -- " + path.resolve(directory);
    console.log("COMMAND: "  + command);
    var res = shell.exec(command);
    if (res.code != 0) {
        console.log ("error: " + res.output);
        return;
    }*/

    // copy the cordova application content into tizen template
    // Fill the template with proper content of application
    copyTree(directory, templateDir);

    // TODO
    modifyConfigFile(path.resolve(templateDir), 'config.xml')

    // TODO
    //copyCordovaFiles(app_name, dir_name)
    console.log("prepareTizenApp: templateDir: " + templateDir);
}

//TODO
Api.prototype.prepare = function (cordovaProject) {
    console.log('log', "test-platform:Api:prepare");
    //return require('./lib/prepare').prepare.call(this, cordovaProject);

    // TODO check if tizen CLI is available

    prepareTizenApp();
    console.log("prepare: templateDir: " + templateDir);

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
    console.log("build: templateDir: " + templateDir);


    //prepareTizenApp();
    // TODO check directory passing into function
    var d = templateDir;

    var buildCommand = "tizen build-web -- " + d;
    console.log("COMMAND: "  + buildCommand + " (templateDir: " + templateDir + ")");
    //console.log("COMMAND: "  + buildCommand);
    var res = shell.exec(buildCommand);
    if (res.code != 0) {
        console.log ("error: " + res.output);
        return;
    }

    var packageCommand = "tizen package -t wgt -- " + d;
    console.log("COMMAND: "  + packageCommand);
    var res = shell.exec(packageCommand);
    if (res.code != 0) {
        console.log ("error: " + res.output);
        return;
    }

    return Promise.resolve();
};

//TODO
Api.prototype.run = function(runOptions) {
    console.log('log', "test-platform:Api:run");
    // TODO check directory passing into function
    var d = templateDir;

    var sdbCheckCommand = "sdb devices";
    var res = shell.exec(sdbCheckCommand);
    if (res.code != 0) {
        console.log ("error: " + res.output);
        return;
    } else {
        //TODO add checking if device is connected
        //TODO add starting emulator
        var lines = res.output.split('\n');
        var length = lines.length -1; // ignoring last empty line
        console.log("\"" + lines + "\"");
        console.log("lines.length " + length);
        if (length == 1) {
            console.log("No devices connected");
            return;
        } else if (length > 2) {
            console.log("Choose device to use");
            // TODO support proper option?
            return;
        } else {
            console.log("Devices OK");
        }
    }

    // installing application
    // TODO get real name of package
    var wgtName = "HelloCordova";
    var installCommand = "tizen install -n " + wgtName + ".wgt -- " + d;
    console.log("COMMAND: "  + installCommand);
    var res = shell.exec(installCommand);
    if (res.code != 0) {
        console.log ("error: " + res.output);
        return;
    }
    // looking for package name in result
    var regex = /(?:\([a-zA-Z0-9]+\))/g;
    var name = res.output.match(regex).toString();
    name = name.substring(1, name.length-1);
    console.log("packageId: \"" + name + "\"");
    packageId = name;

    var runCommand = "tizen run -p " + packageId;
    console.log("COMMAND: "  + runCommand);
    var res = shell.exec(runCommand);
    if (res.code != 0) {
        console.log ("error: " + res.output);
        return;
    }
};

//TODO
Api.prototype.clean = function(cleanOptions) {
    console.log('log', "test-platform:Api:clean");
    // TODO check directory passing into function
    var d = templateDir;

    var cleanCommand = "tizen clean -- " + d;
    console.log("COMMAND: "  + cleanCommand);
    shell.exec(cleanCommand);
    return Promise.resolve();
};

//TODO
Api.prototype.requirements = function() {
    console.log('log', "test-platform:Api:requirements");
    return true;
};

module.exports = Api;
