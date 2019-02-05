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
cordova.define('cordova-plugin-file.tizen.Entry', function(require, exports, module) {
// TODO: remove -> end

var convertTizenFileError = require('cordova-plugin-file.tizen.Errors');
var rootUtils = require('cordova-plugin-file.tizen.rootUtils');

var resolveParent = function(srcURL, errorCallback, rest){
  try {
    tizen.filesystem.resolve(
        srcURL,
        function (srcFile) {
          var parentDir = srcFile.parent;
          if (!parentDir) {
            console.error('Error - could not resolve file ' + srcURL);
            errorCallback && errorCallback(FileError.ENCODING_ERR);
          } else {
            rest(srcFile, parentDir);
          }
        }, function (err) {
          console.error('Error - resolve file ' + srcURL + ' failed');
          errorCallback && errorCallback(convertTizenFileError(err));
        },
    'r');
  } catch (exception) {
    console.error('Error - resolve ' + srcURL + ' file thrown exception');
    errorCallback && errorCallback(convertTizenFileError(exception));
  }
};

var changeFile = function(method, successCallback, errorCallback, args) {
  var srcURL = rootUtils.internalUrlToNativePath(args[0]);
  var name = args[2];
  var destDir = rootUtils.internalUrlToNativePath(args[1]);
  var destURL = destDir + '/' + name;

  function fail(e, msg) {
    console.error(msg);
    if (errorCallback) {
      errorCallback(e);
    }
  }

  if (!srcURL || !destDir) {
    fail(FileError.ENCODING_ERR, 'Error - Failed to decode internal URL.');
    return;
  }

  if (!rootUtils.isValidFileName(name)) {
    fail(FileError.ENCODING_ERR, 'Error - Disallowed character detected in the file name: ' + name);
    return;
  }

  if (-1 !== (destURL + '/').indexOf(srcURL + '/')) {
    fail(FileError.INVALID_MODIFICATION_ERR, 'Error - Cannot copy/move onto itself.');
    return;
  }

  function performAction(srcFile, parentDir) {
    try {
      parentDir[method](srcFile.fullPath,
          destURL,
          true,
          function () {
            try {
              tizen.filesystem.resolve(
                destURL,
                function (destFile) {
                  var destEntry = rootUtils.createEntry(destFile);
                  destEntry.isDirectory = destFile.isDirectory;
                  successCallback && successCallback(destEntry);
                }, function (err) {
                  fail(convertTizenFileError(err), 'Error - resolve result entry failed');
                }
              );
            } catch (exception) {
              fail(convertTizenFileError(exception), 'Error - resolve result entry thrown exception');
            }
          }, function (err) {
            fail(convertTizenFileError(err), 'Error - ' + method + ' operation failed');
          }
      );
    } catch (exception) {
      fail(convertTizenFileError(exception), 'Error - ' + method + ' operation thrown exception');
    }
  }

  try {
    tizen.filesystem.resolve(destDir, function(d) {
      resolveParent (srcURL, errorCallback,
          function(srcFile, parentDir) {
            try {
              // check if destination entry exists
              tizen.filesystem.resolve(destURL, function(d) {
                // destination exists, we may proceed only if it's the same type
                // as source
                if (d.isFile === srcFile.isFile && d.isDirectory === srcFile.isDirectory) {
                  performAction(srcFile, parentDir);
                } else {
                  fail(FileError.INVALID_MODIFICATION_ERR, 'Error - source and destination have mismatched types');
                }
              }, function() {
                // error means that we're safe to proceed
                performAction(srcFile, parentDir);
              }, 'r');
            } catch (exception) {
              fail(convertTizenFileError(exception), 'Error - resolve destination entry threw exception');
            }
          }
      );
    }, function() {
      fail(FileError.NOT_FOUND_ERR, 'Error - destination directory does not exist');
    }, 'r');
  } catch (e) {
    fail(convertTizenFileError(e), 'Error - resolve destination directory threw exception');
  }
};

module.exports = {
  getFileMetadata: function(successCallback, errorCallback, args) {
    var uri = rootUtils.internalUrlToNativePath(args[0]);
    if (!uri) {
      errorCallback && errorCallback(FileError.ENCODING_ERR);
      return;
    }
    try {
      tizen.filesystem.resolve(uri, function (file) {
        var result = { 'size': file.fileSize, 'lastModifiedDate': file.modified };
        successCallback && successCallback(result);
      }, function (err) {
        errorCallback && errorCallback(convertTizenFileError(err));
      }, 'r');
    } catch (exception) {
      console.error('Error - resolve failed');
      errorCallback && errorCallback(convertTizenFileError(exception));
    }
  },
  setMetadata: function(successCallback, errorCallback, args) {
    console.error('setMetadata - Not supported');
    errorCallback && errorCallback(FileError.ENCODING_ERR);
  },
  moveTo: function(successCallback, errorCallback, args) {
    changeFile('moveTo', successCallback, errorCallback, args);
  },
  copyTo: function(successCallback, errorCallback, args) {
    changeFile('copyTo', successCallback, errorCallback, args);
  },
  remove: function(successCallback, errorCallback, args) {
    var url = rootUtils.internalUrlToNativePath(args[0]);

    if (!url) {
      errorCallback && errorCallback(FileError.ENCODING_ERR);
      return;
    }

    if (rootUtils.isRootUri(url)) {
      console.error('It is not allowed to remove root directory.');
      errorCallback && errorCallback(FileError.NO_MODIFICATION_ALLOWED_ERR);
      return;
    }

    resolveParent(url,  errorCallback,
        function(srcFile, parentDir){
          var method = srcFile.isFile ? 'deleteFile' : 'deleteDirectory';
          var args = [srcFile.fullPath,
                      false,
                      function() {successCallback && successCallback();},
                      function(err) {
                        console.error('Error - ' + method + ' failed');
                        errorCallback && errorCallback(convertTizenFileError(err));
                        }];
          if (srcFile.isFile) {
            //remove recursive flag
            args.splice(1, 1);
          }
          try {
            parentDir[method].apply(parentDir, args);
          } catch (exception) {
            console.error('Error - ' + method + ' thrown exception ' + JSON.stringify(exception));
            errorCallback && errorCallback(convertTizenFileError(exception));
          }
        }
    );
  },
  getParent: function(successCallback, errorCallback, args) {
    var url = rootUtils.internalUrlToNativePath(args[0]);

    if (!url) {
      errorCallback && errorCallback(FileError.ENCODING_ERR);
      return;
    }

    if (rootUtils.isRootUri(url)) {
      successCallback && successCallback(rootUtils.findFilesystem(url));
      return;
    }

    resolveParent(url, errorCallback,
        function(srcFile, parentDir){
          successCallback && successCallback(rootUtils.createEntry(srcFile.parent));
        }
    );
  }
};

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
