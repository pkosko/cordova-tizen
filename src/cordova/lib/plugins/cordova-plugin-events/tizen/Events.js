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
var plugin_name = 'cordova-plugin-events.tizen.Events';

cordova.define(plugin_name, function(require, exports, module) {
// TODO: remove -> end

//////////////////////////// EventHandler
function EventHandler(name) {
  this.name = name;
}

EventHandler.prototype.startListener = function(l) {
  console.error('Event \"' + this.name + '\" is not suported.');
};

EventHandler.prototype.stopListener = function() {
  console.error('Event \"' + this.name + '\" is not suported.');
};

//////////////////////////// WindowEventHandler
function WindowEventHandler(name, event_type, callback, target) {
  EventHandler.call(this, name);
  this.event_type = event_type;
  this.callback = callback;
  this.target = target || window;
}

WindowEventHandler.prototype = Object.create(EventHandler.prototype);
WindowEventHandler.prototype.constructor = WindowEventHandler;

WindowEventHandler.prototype.startListener = function(l) {
  if (this.callback) {
    this.listener = l;
    this.target.addEventListener(this.event_type, this.callback);
  } else {
    Object.getPrototypeOf(WindowEventHandler.prototype).startListener.call(this, l);
  }
};

WindowEventHandler.prototype.stopListener = function() {
  if (this.callback) {
    this.target.removeEventListener(this.event_type, this.callback);
    this.listener = undefined;
  } else {
    Object.getPrototypeOf(WindowEventHandler.prototype).stopListener.call(this);
  }
};

//////////////////////////// HwKeyEventHandler
function HwKeyEventHandler(name, type) {
  var that = this;
  var callback = function(e) {
    if (type === e.keyName && that.listener) {
      that.listener(that.name);
    }
  };
  WindowEventHandler.call(this, name, 'tizenhwkey', callback);
}

HwKeyEventHandler.prototype = Object.create(WindowEventHandler.prototype);
HwKeyEventHandler.prototype.constructor = HwKeyEventHandler;

//////////////////////////// VisibilityEventHandler
function VisibilityEventHandler(name, hidden) {
  var prop, visibility_event, callback;

  if (typeof document.hidden !== 'undefined') {
    prop = 'hidden';
    visibility_event = 'visibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    prop = 'webkitHidden';
    visibility_event = 'webkitvisibilitychange';
  }

  if (prop) {
    var that = this;
    callback = function() {
      if (hidden === document[prop] && that.listener) {
        that.listener(that.name);
      }
    };
  }

  WindowEventHandler.call(this, name, visibility_event, callback, document);
}

VisibilityEventHandler.prototype = Object.create(WindowEventHandler.prototype);
VisibilityEventHandler.prototype.constructor = VisibilityEventHandler;

//////////////////////////// InputDeviceEventHandler
function InputDeviceEventHandler(name, type) {
  var callback;

  try {
    this.key = tizen.inputdevice.getKey(type);

    var that = this;
    callback = function(e) {
      if (that.key.code === e.keyCode && that.listener) {
        that.listener(that.name);
      }
    };
  } catch (e) {
    console.error('Exception: ' + e.message);
  }

  WindowEventHandler.call(this, name, 'keydown', callback);
}

InputDeviceEventHandler.prototype = Object.create(WindowEventHandler.prototype);
InputDeviceEventHandler.prototype.constructor = InputDeviceEventHandler;

InputDeviceEventHandler.prototype.startListener = function(l) {
  if (this.key) {
    try {
      tizen.inputdevice.registerKey(this.key.name);
    } catch (e) {
      console.error('Exception: ' + e.message);
    }
  }

  Object.getPrototypeOf(InputDeviceEventHandler.prototype).startListener.call(this, l);
};

InputDeviceEventHandler.prototype.stopListener = function() {
  if (this.key) {
    try {
      tizen.inputdevice.unregisterKey(this.key.name);
    } catch (e) {
      console.error('Exception: ' + e.message);
    }
  }

  Object.getPrototypeOf(InputDeviceEventHandler.prototype).stopListener.call(this);
};

//////////////////////////// all handlers
var handlers = {
  backbutton: new HwKeyEventHandler('backbutton', 'back'),
  menubutton: new HwKeyEventHandler('menubutton', 'menu'),
  searchbutton: new EventHandler('searchbutton'),
  startcallbutton: new EventHandler('startcallbutton'),
  endcallbutton: new EventHandler('endcallbutton'),
  volumedownbutton: new InputDeviceEventHandler('volumedownbutton', 'VolumeDown'),
  volumeupbutton: new InputDeviceEventHandler('volumeupbutton', 'VolumeUp'),
  pause: new VisibilityEventHandler('pause', true),
  resume: new VisibilityEventHandler('resume', false)
};

exports = {
  startListener: function(successCallback, errorCallback, args) {
    var e = args[0];
    if (handlers[e]) {
      handlers[e].startListener(successCallback);
    } else {
      console.error('Unknown event: ' + e);
    }
  },
  stopListener: function(successCallback, errorCallback, args) {
    var e = args[0];
    if (handlers[e]) {
      handlers[e].stopListener();
    } else {
      console.error('Unknown event: ' + e);
    }
  }
};

require('cordova/exec/proxy').add('Events', exports);

console.log('Loaded cordova.events API');

// TODO: remove when added to public cordova repository -> begin
});
// TODO: remove -> end
