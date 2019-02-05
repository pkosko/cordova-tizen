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

cordova.define("cordova-plugin-events.register", function(require, exports, module) {

var cordova = require('cordova');
var channel = require('cordova/channel');
var exec = require('cordova/exec');

var PLUGIN_NAME = 'Events';

var handled_events = {};

function fireEventListener(e) {
  if (handled_events[e]) {
    if ('pause' === e) {
      // pause event needs to be fired synchronously, otherwise it will appear
      // after the application is resumed
      cordova.fireDocumentEvent(e, null, true);
    } else {
      cordova.fireDocumentEvent(e);
    }
  } else {
    console.error('Unknown event: ' + e);
  }
}

function addChannelListener(ch, event_name) {
  ch.onHasSubscribersChange = function() {
    var start = this.numHandlers > 0;
    var method = start ? 'startListener' : 'stopListener';
    var callback = start ? fireEventListener : null;
    exec(callback, null, PLUGIN_NAME, method, [event_name]);
  };
  handled_events[event_name] = event_name;
}

function createChannelForButton(button) {
  var ch = cordova.addDocumentEventHandler(button);
  addChannelListener(ch, button);
}

var buttons = [
  'backbutton',
  'menubutton',
  'searchbutton',
  'startcallbutton',
  'endcallbutton',
  'volumedownbutton',
  'volumeupbutton'
];

for (var i = 0; i < buttons.length; ++i) {
  createChannelForButton(buttons[i]);
}

var events = {
  pause: channel.onPause,
  resume: channel.onResume
};

for (var e in events) {
  if (events.hasOwnProperty(e)) {
    addChannelListener(events[e], e);
  }
}

});
