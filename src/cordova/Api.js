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
var tizenTemplate = require('./utils/TizenTemplate.js');

console.log("---------------------------------- LOADING cordova-tizen ----------------------------------");

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
    console.log("tizen:Api");

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
    console.log("test-platform:Api:createPlatform");
    events = setupEvents(events);

    // create the destination and the standard place for our api to live
    // platforms/platformName/cordova/Api.js

    var apiSrcPath = __dirname; // default value
    // does options contain the info we desire?
    //console.log("CONFIG:\n" + JSON.stringify(config, null, 2) + "\n");

    var projectName = config ? config.name() : "HelloCordova";

    console.log('Creating Cordova project for cordova-tizen:');
    console.log('\tPath: ' + destination);
    console.log('\tName: ' + projectName);

    shell.mkdir('-p', destination);

    // move a copy of our api to the new projects
    shell.cp('-r', apiSrcPath, destination);

    // I promise I will return
    return Promise.resolve(this);
};

Api.updatePlatform = function (destination, options, events) {
    console.log("test-platform:Api:updatePlatform");
    events = setupEvents(events); // TODO check
    // todo?: create projectInstance and fulfill promise with it.
    return Promise.resolve();
};

Api.prototype.getPlatformInfo = function () {
    console.log("test-platform:Api:getPlatformInfo");
    // TODO return true values
    var result = {
        "locations":this.locations,
        "root": this.root,
        "name": this.platform,
        "version": require('./version'),
        "projectConfig": this._config
    };
    //console.log("Plaform info:\n" + JSON.stringify(result, null, 2) + "\n");
    return result;
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
            s = path.resolve(path.join(src, name));
            d = path.resolve(dst);
            //console.log("copying " + s + " to " + d);
            shell.cp('-Rf', s, d);
        }
    }
}

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

    //TODO add filesystem privilege

    // save a changed file
    config.write(configFile);
}

function copyCordovaFiles() {
    // copy 'lib' directory
    copyTree(src, dst);
    // copy cordova.js file

}

function prepareTizenApp() {
    console.log("p.kosko: prepareTizenApp");

    // take the main directory of application cutting the path on 'platforms'
    directory = path.resolve(__dirname).split('/platforms/')[0];

    // read the name from config from application's main directory
    var config = new TizenConfig(path.join(directory, 'config.xml'));
    var appName = config.getName();
    var packageId = config.getPackageId();
    // TODO read profile from config ??

    tizenTemplate.setTemplateDir(path.join(path.resolve(directory), "." + appName));
    tizenTemplate.setProjectName(appName);

    console.log("prepareTizenApp: " + appName + " templateDir: " + tizenTemplate.getTemplateDir());

    // **** creating Tizen application directory ***********************************
    if (shell.test('-e', tizenTemplate.getTemplateDir())) {
        // remove the directory - application will be created from the beginning
        //console.log("we should remove " + tizenTemplate.getTemplateDir());
        shell.rm('-rf', tizenTemplate.getTemplateDir());
        shell.mkdir(tizenTemplate.getTemplateDir());
    }

    // copy the cordova application content into tizen template
    // Fill the template with proper content of application
    copyTree(directory, tizenTemplate.getTemplateDir());

    // TODO
    modifyConfigFile(path.resolve(tizenTemplate.getTemplateDir()), 'config.xml');

    // TODO
    //copyCordovaFiles(app_name, dir_name)
    console.log("prepareTizenApp: templateDir: " + tizenTemplate.getTemplateDir());
}

//TODO
Api.prototype.prepare = function (cordovaProject) {
    console.log("test-platform:Api:prepare");
    //return require('./lib/prepare').prepare.call(this, cordovaProject);

    // TODO check if tizen CLI is available

    prepareTizenApp();
    console.log("prepare: templateDir: " + tizenTemplate.getTemplateDir());

    return Promise.resolve();
};

//TODO
Api.prototype.addPlugin = function (plugin, installOptions) {
    console.log("test-platform:Api:addPlugin");
    return Promise.resolve();
};

//TODO
Api.prototype.removePlugin = function (plugin, uninstallOptions) {
    console.log("test-platform:Api:removePlugin");
    return Promise.resolve();
};


//TODO
Api.prototype.build = function (buildOptions) {
    console.log("test-platform:Api:build");
    console.log("build: templateDir: " + tizenTemplate.getTemplateDir());


    //prepareTizenApp();
    // TODO check directory passing into function
    var d = tizenTemplate.getTemplateDir();

    var buildCommand = "tizen build-web -- " + d;
    console.log("COMMAND: "  + buildCommand + " (templateDir: " + tizenTemplate.getTemplateDir() + ")");
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
    console.log("test-platform:Api:run");
    // TODO check directory passing into function
    var d = tizenTemplate.getTemplateDir();

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
    var wgtName = tizenTemplate.getProjectName();
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
    console.log("test-platform:Api:clean");
    // TODO check directory passing into function
    var d = tizenTemplate.getTemplateDir();

    var cleanCommand = "tizen clean -- " + d;
    console.log("COMMAND: "  + cleanCommand);
    shell.exec(cleanCommand);
    return Promise.resolve();
};

//TODO
Api.prototype.requirements = function() {
    console.log("test-platform:Api:requirements");
    return true;
};

module.exports = Api;
