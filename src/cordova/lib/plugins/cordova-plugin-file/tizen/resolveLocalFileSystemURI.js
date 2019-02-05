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
cordova.define('cordova-plugin-file.tizen.resolveLocalFileSystemURI', function(require, exports, module) {
// TODO: remove -> end

var convertTizenFileError = require('cordova-plugin-file.tizen.Errors');
var rootUtils = require('cordova-plugin-file.tizen.rootUtils');

var filePrefix = 'file://';

module.exports = {
  resolveLocalFileSystemURI: function(successCallback, errorCallback, args) {
    var path = rootUtils.internalUrlToNativePath(args[0]);

    if (!path) {
      errorCallback && errorCallback(FileError.ENCODING_ERR);
      return;
    }

    function onResolve(file) {
      var filesystem = rootUtils.findFilesystem(file.toURI());

      var entry = rootUtils.createEntry(file, filesystem.filesystemName);
      entry.isDirectory = file.isDirectory;

      successCallback(entry);
    }

    function onError(error) {
      errorCallback && errorCallback(convertTizenFileError(error));
    }

    try {
      tizen.filesystem.resolve(path, onResolve, onError, 'r');
    } catch (e) {
      onError(e);
    }
  },
  _getLocalFilesystemPath: function(successCallback, errorCallback, args) {
    var path = rootUtils.internalUrlToNativePath(args[0]);

    if (!path) {
      errorCallback && errorCallback(FileError.ENCODING_ERR);
    } else {
      if (0 === path.indexOf(filePrefix)) {
        path = path.substring(filePrefix.length);
      }
      successCallback && successCallback(path);
    }
  },
};

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
