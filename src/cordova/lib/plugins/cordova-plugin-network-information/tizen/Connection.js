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
var plugin_name_type = 'cordova-plugin-network-information.tizen.Connection';

cordova.define(plugin_name_type, function(require, exports, module) {
//TODO: remove -> end

var exec = require('cordova/exec');

function NetworkConnection() {
  this.type = Connection.UNKNOWN;
  var that = this;
  function successCallback(info) {
    that.type = info;
  }

  function errorCallback() {
    that.type = Connection.UNKNOWN;
  }

  function getType() {
    exec(successCallback, errorCallback, 'NetworkStatus', 'getConnectionInfo', []);
  }

  document.addEventListener('offline', getType);
  document.addEventListener('online', getType);
}
var me = new NetworkConnection();

module.exports = me;

//TODO: remove when added to public cordova repository -> begin
});
// TODO: remove -> end
