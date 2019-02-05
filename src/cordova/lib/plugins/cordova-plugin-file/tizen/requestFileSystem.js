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
cordova.define('cordova-plugin-file.tizen.requestFileSystem', function(require, exports, module) {
// TODO: remove -> end

var rootUtils = require('cordova-plugin-file.tizen.rootUtils');

module.exports = {
  requestFileSystem: function(successCallback, errorCallback, args) {
    var type = args[0];
    var size = args[1];
    var fsName;

    switch(type) {
      case LocalFileSystem.TEMPORARY:
        fsName = 'temporary';
        break;

      case LocalFileSystem.PERSISTENT:
        fsName = 'persistent';
        break;

      default:
        console.error('Unknown FS type: ' + type);
        errorCallback && errorCallback(FileError.TYPE_MISMATCH_ERR);
        return;
    }

    try {
      tizen.systeminfo.getPropertyValue('STORAGE', function (r) {
          for (var i = 0; i < r.units.length; ++i) {
            // both filesystems are located on internal storage
            if ('INTERNAL' === r.units[i].type) {
              if (size < r.units[i].availableCapacity) {
                rootUtils.getRoots(function(roots) {
                  for (var i = 0; i < roots.length; ++i) {
                    if (fsName === roots[i].filesystemName) {
                      successCallback({ 'name': fsName, 'root': roots[i] });
                      return;
                    }
                  }

                  console.error('Filesystem not found: ' + fsName);
                  errorCallback && errorCallback(FileError.NOT_FOUND_ERR);
                });
              } else {
                console.error('Quote exceeded, requested: ' + size + ', available: ' + r.units[i].availableCapacity);
                errorCallback && errorCallback(FileError.QUOTA_EXCEEDED_ERR);
              }
              return;
            }
          }

          console.error('Internal storage not found');
          errorCallback && errorCallback(FileError.NOT_FOUND_ERR);
        }, function(e) {
          console.error('Failed to get storage info: ' + fsName);
          errorCallback && errorCallback(FileError.NOT_FOUND_ERR);
        }
      );
    } catch (e) {
      console.error('Exception: ' + e);
      errorCallback && errorCallback(FileError.NOT_FOUND_ERR);
    }
  }
};

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
