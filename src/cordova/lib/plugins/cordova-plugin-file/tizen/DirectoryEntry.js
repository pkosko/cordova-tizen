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
cordova.define('cordova-plugin-file.tizen.DirectoryEntry', function(require, exports, module) {
// TODO: remove -> end

  var convertTizenFileError = require('cordova-plugin-file.tizen.Errors');
  var rootUtils = require('cordova-plugin-file.tizen.rootUtils');

  function sanitizePath(path) {
    var prepend = '/' === path[0];
    var input = path.split('/');
    var output = [];

    for (var i = 0; i < input.length; ++i) {
      var part = input[i];
      switch (part) {
        case '':
        case '.':
          // ignore
          break;

        case '..':
          // remove previous part
          output.pop();
          break;

        default:
          output.push(part);
          break;
      }
    }

    return (prepend ? '/' : '') + output.join('/');
  }

  var getFunction = function(successCallback, errorCallback, args, isDirectory) {
    var uri = rootUtils.internalUrlToNativePath(args[0]),
        path = rootUtils.stripTrailingSlash(args[1]),
        options = args[2] || {},
        create_flag = !!options.create,
        exclusive_flag = !!options.exclusive,
        absolute_path = '';

    if (!uri) {
      errorCallback && errorCallback(FileError.ENCODING_ERR);
      return;
    }

    if ('/' === path[0]) {
      // path seems absolute, checking if path is a child of this object URI
      if (0 === path.indexOf(uri)) {
        // path is child - OK
        absolute_path = path;
      } else {
        // path is not a child - calling error callback
        console.error('Error - path is not a child of current directory entry')
        errorCallback && errorCallback(FileError.INVALID_STATE_ERR);
        return;
      }
    } else {
      // path seems to be relative path, combining absolute path
      absolute_path = uri + '/' + path;
    }

    var root = rootUtils.findFilesystem(absolute_path).nativeURL;
    var clean_path = sanitizePath(absolute_path);

    if (0 !== clean_path.indexOf(root)) {
      // we went above the root directory, force the absolute path to be
      // at least in that directory
      clean_path = root + '/' + sanitizePath(absolute_path.substring(root.length + 1));
    }

    var parent_path = clean_path.substring(0, clean_path.lastIndexOf('/'));
    var child_name = clean_path.substring(clean_path.lastIndexOf('/') + 1);

    if (!rootUtils.isValidFileName(child_name)) {
      console.error('Disallowed character detected in file name: ' + child_name);
      errorCallback && errorCallback(FileError.ENCODING_ERR);
      return;
    }

    var resolveSuccess = function(dir) {
      // clean_path points to existing destination
      if (create_flag && exclusive_flag) {
        console.error('Error while resolving dir - already exist dir');
        errorCallback && errorCallback(FileError.PATH_EXISTS_ERR);
      } else if (!create_flag && dir.isDirectory !== isDirectory) {
        console.error('Error while resolving dir - already exist file');
        errorCallback && errorCallback(FileError.TYPE_MISMATCH_ERR);
      } else {
        successCallback && successCallback(rootUtils.createEntry(dir));
      }
    };

    var resolveError = function(e) {
      if (create_flag) {
        // should create directory
        try {
          // resolve parent
          tizen.filesystem.resolve(parent_path,
              function(dir) {
                // create object
                var new_obj;
                if (isDirectory) {
                  new_obj = dir.createDirectory(child_name);
                } else {
                  new_obj = dir.createFile(child_name);
                }

                successCallback && successCallback(rootUtils.createEntry(new_obj));
              },
              function () {
                console.error('Error -  immediate parent does not exist');
                errorCallback && errorCallback(FileError.INVALID_STATE_ERR);
              },
              'rw'
          );
        } catch (err) {
          console.error('Error - Could not resolve');
          errorCallback && errorCallback(convertTizenFileError(err));
        }
      } else {
        console.error('Error - create flag is false - new directory would not be created');
        errorCallback && errorCallback(FileError.NOT_FOUND_ERR);
      }
    };

    // try to resolve
    try {
      tizen.filesystem.resolve(clean_path, resolveSuccess, resolveError, 'rw');
    } catch (err) {
      console.error('Error - Could not resolve');
      errorCallback && errorCallback(convertTizenFileError(err));
    }
  };

module.exports = {
  getDirectory: function(successCallback, errorCallback, args) {
    getFunction(successCallback, errorCallback, args, true);
  },
  removeRecursively: function(successCallback, errorCallback, args) {
    var uri = rootUtils.internalUrlToNativePath(args[0]);

    if (!uri) {
      errorCallback && errorCallback(FileError.ENCODING_ERR);
      return;
    }

    if (rootUtils.isRootUri(uri)) {
      console.error('It is not allowed to remove root directory.');
      errorCallback && errorCallback(FileError.NO_MODIFICATION_ALLOWED_ERR);
      return;
    }

    // resolve parent
    var tmp_path = uri[uri.length-1] === '/' ? uri.substring(0, uri.lastIndexOf('/')) : uri;
    var parent_path = tmp_path.substring(0, tmp_path.lastIndexOf('/')+1);
    try {
      tizen.filesystem.resolve(
          parent_path,
          function(dir) {
            try {
              if (dir.isDirectory) {
                dir.deleteDirectory(
                    uri,
                    true,
                    function() {
                      successCallback && successCallback();
                    }, function(e) {
                      console.error('Error - recursively deletion failed');
                      errorCallback && errorCallback(FileError.NO_MODIFICATION_ALLOWED_ERR);
                    });
              } else {
                console.error('Error - entry is not a directory');
                errorCallback && errorCallback(FileError.INVALID_STATE_ERR);
              }
            } catch (err) {
              console.error('Error - Could not deleteDirectory');
              errorCallback && errorCallback(convertTizenFileError(err));
            }
          }, function(e) {
            console.error('Error: ' + e.message);
            errorCallback && errorCallback(convertTizenFileError(e));
          }, 'rw'
      );
    } catch (err) {
      console.error('Error - Could not resolve');
      errorCallback && errorCallback(convertTizenFileError(err));
    }
  },
  getFile: function(successCallback, errorCallback, args) {
    getFunction(successCallback, errorCallback, args, false);
  }
};

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
