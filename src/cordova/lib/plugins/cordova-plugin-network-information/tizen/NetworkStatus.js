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
var plugin_name = 'cordova-plugin-network-information.tizen.NetworkStatus';

cordova.define(plugin_name, function(require, exports, module) {
// TODO: remove -> end

var cordova = require('cordova');

function toCordovaConnectionType(type) {
  switch (type) {
    case 'NONE':
      return Connection.NONE;

    case '2G':
      return Connection.CELL_2G;

    case '2.5G':
      // TODO: In cordova documentation there is no information about 2.5G
      // so instead 2G is returned
      return Connection.CELL_2G;

    case '3G':
      return Connection.CELL_3G;

    case '4G':
      return Connection.CELL_4G;

    case 'WIFI':
      return Connection.WIFI;

    case 'ETHERNET':
      return Connection.ETHERNET;

    default:
      return Connection.UNKNOWN;
  }
}

function onSuccessCallback(info) {
  var type = toCordovaConnectionType(info.networkType);

  if (Connection.NONE === type || Connection.UNKNOWN === type) {
    cordova.fireDocumentEvent('offline');
  } else {
    cordova.fireDocumentEvent('online');
  }
}

function onErrorCallback(e) {
  console.error('Error appeared ' + e.name + ', message ' + e.message);
}

// TODO currently method addPropertyValueChangeListener is registered only to SIM1 and
// ignore changes on SIM2 (if device has dual SIM standby mode). Consider to use
// method addPropertyValueChangeListenerArray to get information from both SIM, but
// which type should be returned then?
tizen.systeminfo.addPropertyValueChangeListener('NETWORK', onSuccessCallback, onErrorCallback);

exports = {
  getConnectionInfo: function(successCallback, errorCallback, args) {
    tizen.systeminfo.getPropertyValue('NETWORK', function(info) {
      successCallback(toCordovaConnectionType(info.networkType));
    }, function(e){
        if (errorCallback) {
          errorCallback(e);
        }
      });
  }
};

require('cordova/exec/proxy').add('NetworkStatus', exports);

console.log('Loaded cordova.networkinformation API');

// TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
