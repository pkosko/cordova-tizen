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
var plugin_name = 'cordova-plugin-device-motion.tizen.Accelerometer';

cordova.define(plugin_name, function(require, exports, module) {
// TODO: remove -> end

var successCB = null;
var count = 0;

function listener(eventData) {
  var accel = {};

  accel.x = eventData.acceleration.x;
  accel.y = eventData.acceleration.y;
  accel.z = eventData.acceleration.z;
  accel.timestamp = new Date().getTime();

  if (accel.x === null || accel.y === null || accel.z === null) {
    // Ignore first event with nulls
    return;
  }

  if (count++ === 0) {
    return;
  }

  successCB && successCB(accel);
}

var Accelerometer = {
  start: function (success, error) {
    if (!successCB) {
      count = 0;
      successCB = success;
      window.addEventListener('devicemotion', listener, false);
    }
  }, stop: function () {
    window.removeEventListener('devicemotion', listener, false);
    successCB = null;
  }
};

module.exports = Accelerometer;
require('cordova/exec/proxy').add('Accelerometer', Accelerometer);

console.log('Loaded cordova.device-motion API');

// TODO: remove when added to public cordova repository -> begin
});
// TODO: remove -> end
