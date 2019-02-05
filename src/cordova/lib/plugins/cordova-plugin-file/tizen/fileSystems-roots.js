/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd All Rights Reserved
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

// TODO: remove when added to public cordova repository -> begin
cordova.define('cordova-plugin-file.tizen.fileSystems-roots', function(require, exports, module) {
// TODO: remove -> end

var rootUtils = require('cordova-plugin-file.tizen.rootUtils');

var channel = require('cordova/channel');

channel.waitForInitialization('onGetRootsReady');
channel.onCordovaReady.subscribe(function() {
  rootUtils.getRoots(function () {
    channel.initializationComplete('onGetRootsReady');
  });
});

module.exports = {
  requestAllFileSystems: function(successCallback, errorCallback, args) {
    rootUtils.getRoots(successCallback);
  }
};

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
