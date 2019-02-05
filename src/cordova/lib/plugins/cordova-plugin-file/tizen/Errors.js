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
cordova.define('cordova-plugin-file.tizen.Errors', function(require, exports, module) {
// TODO: remove -> end

/**
 * Function converting a Tizen error to a cordova error
 *
 * {unsigned short} WebAPIError error
 */
function convertTizenFileError(err) {
  switch (err.name) {
    case 'InvalidValuesError':
      return FileError.ENCODING_ERR;

    case 'NotFoundError':
      return FileError.NOT_FOUND_ERR;

    case 'IOError':
      return FileError.INVALID_MODIFICATION_ERR;

    case 'SecurityError':
      return FileError.SECURITY_ERR;

    default:
      return FileError.ENCODING_ERR;
  }
}

module.exports = convertTizenFileError;

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
