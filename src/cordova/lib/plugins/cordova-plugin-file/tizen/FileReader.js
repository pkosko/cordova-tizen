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
cordova.define('cordova-plugin-file.tizen.FileReader', function(require, exports, module) {
// TODO: remove -> end

var convertTizenFileError = require('cordova-plugin-file.tizen.Errors');
var rootUtils = require('cordova-plugin-file.tizen.rootUtils');

function read(operation, url, start, end, successCallback, errorCallback, encoding) {
  url = rootUtils.internalUrlToNativePath(url);

  if (!url) {
    errorCallback && errorCallback(FileError.ENCODING_ERR);
    return;
  }

  var fail = function(e) {
    errorCallback && errorCallback(convertTizenFileError(e));
  }
  var win = function(size) {
    successCallback && successCallback(size);
  }
  try {
    tizen.filesystem.resolve(url, function(file) {
      if (0 === end - start) {
        // nothing to read, report success
        win();
      } else {
        try {
          file.openStream('r', function(stream) {
            try {
              stream.position = start;
              var r = stream[operation](end - start);
              stream.close();
              win(r);
            } catch (e) {
              fail(e);
            }
          }, fail, encoding);
        } catch (e) {
          fail(e);
        }
      }
    }, fail, 'r');
  } catch (e) {
    fail(e);
  }
}

module.exports = {
  readAsText: function(successCallback, errorCallback, args) {
    read('read', args[0], args[2], args[3], function(r) {
      successCallback && successCallback(r || '');
    }, errorCallback, args[1]);
  },
  readAsDataURL: function(successCallback, errorCallback, args) {
    read('readBase64', args[0], args[1], args[2], function(r) {
      r = 'data:;base64,' + (r || '');  // MIME is missing because it's not passed to exec()
      successCallback && successCallback(r);
    }, errorCallback);
  },
  readAsBinaryString: function(successCallback, errorCallback, args) {
    read('readBytes', args[0], args[1], args[2], function(r) {
      r = r || [];
      var str = '';
      // this may be not so efficient, but
      //   String.fromCharCode.apply(null, r);
      // may throw if r.length is large enough
      for (var i = 0; i < r.length; ++i) {
        str += String.fromCharCode(r[i]);
      }
      successCallback && successCallback(str);
    }, errorCallback);
  },
  readAsArrayBuffer: function(successCallback, errorCallback, args) {
    read('readBytes', args[0], args[1], args[2], function(r) {
      successCallback && successCallback(r || []);
    }, errorCallback);
  },
};

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
