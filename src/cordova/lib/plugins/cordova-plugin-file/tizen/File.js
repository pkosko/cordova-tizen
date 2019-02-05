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
var plugin_name = 'cordova-plugin-file.tizen.File';

cordova.define(plugin_name, function(require, exports, module) {
// TODO: remove -> end

var modules = [
  'DirectoryEntry',
  'DirectoryReader',
  'Entry',
  'FileReader',
  'fileSystemPaths',
  'fileSystems-roots',
  'FileWriter',
  'requestFileSystem',
  'resolveLocalFileSystemURI'
];

// merge methods from submodules into this one
for (var i = 0; i < modules.length; ++i) {
  var m = require('cordova-plugin-file.tizen.' + modules[i]);
  for (var prop in m) {
    if (m.hasOwnProperty(prop)) {
      exports[prop] = m[prop];
    }
  }
}

require("cordova/exec/proxy").add("File", exports);

console.log('Loaded cordova.file API');

// TODO: remove when added to public cordova repository -> begin
});
// TODO: remove -> end
