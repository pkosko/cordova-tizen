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
cordova.define('cordova-plugin-file.tizen.DirectoryReader', function(require, exports, module) {
// TODO: remove -> end

var convertTizenFileError = require('cordova-plugin-file.tizen.Errors');
var rootUtils = require('cordova-plugin-file.tizen.rootUtils');

module.exports = {
  readEntries: function(successCallback, errorCallback, args) {
    var uri = rootUtils.internalUrlToNativePath(args[0]);

    if (!uri) {
      errorCallback && errorCallback(FileError.ENCODING_ERR);
      return;
    }

    var fail = function(e) {
      errorCallback && errorCallback(convertTizenFileError(e));
    }
    try {
      tizen.filesystem.resolve(uri,
        function (f) {
          f.listFiles(function(v) {
            var retVal = [];
            for (var i = 0; i < v.length; ++i) {
              var obj = rootUtils.createEntry(v[i], rootUtils.findFilesystem(v[i].toURI()).filesystemName);
              obj.isDirectory = v[i].isDirectory;
              obj.isFile = v[i].isFile;
              retVal.push(obj);
            };
            successCallback(retVal);
          }, fail);
        }, fail, 'r');
    } catch (e) {
      fail(e);
    }
  }
};

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
