/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO: remove when added to public cordova repository -> begin
var plugin_name = 'cordova-plugin-globalization.tizen.Globalization';
cordova.define(plugin_name, function(require, exports, module) {
// TODO: remove -> end

var SELECTOR_DATE_STR = 'date';
var SELECTOR_TIME_STR = 'time';
var SELECTOR_DATE_AND_TIME_STR = SELECTOR_DATE_STR + ' and ' + SELECTOR_TIME_STR;

var FORMAT_SHORT_STR = 'short';
var FORMAT_MEDIUM_STR = 'medium';
var FORMAT_LONG_STR = 'long';
var FORMAT_FULL_STR = 'full';

var TYPE_WIDE = 'wide';
var TYPE_NARROW = 'narrow';

var ITEM_MONTHS = 'months';
var ITEM_DAYS = 'days';

var NUMBER_TYPE_DECIMAL = 'decimal';
var NUMBER_TYPE_PERCENT = 'percent';
var NUMBER_TYPE_CURRENCY = 'currency';

function Globalization_getPreferredLanguage(successCb, errorCb) {
  // TODO Indicates the current language setting in the (LANGUAGE)_(REGION) syntax.
  // The language setting is in the ISO 630-2 format and the region setting is in the ISO 3166-1 format.
  tizen.systeminfo.getPropertyValue('LOCALE',
    function (locale) {
      // replacing '_' with '-' to satisfy cordova language and region separator
      var result = locale.language.replace('_', '-');
      successCb( {'value': result} );
    },
    function(error) {
      console.log('Cordova, getLocaleName, An error occurred ' + error.message);
      errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR ,
          'cannot retrieve language name'));
    }
  );
}

function Globalization_dateToString(timestamp, successCb, errorCb, options) {
  var formatLength = (options && options.formatLength) || FORMAT_SHORT_STR;
  var selector = (options && options.selector) || SELECTOR_DATE_AND_TIME_STR;

  try {
    tizen.cordova.globalization.dateToString(timestamp, formatLength, selector, successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

function Globalization_stringToDate(dateString, successCb, errorCb, options) {
  var formatLength = (options && options.formatLength) || FORMAT_SHORT_STR;
  var selector = (options && options.selector) || SELECTOR_DATE_AND_TIME_STR;

  try {
    tizen.cordova.globalization.stringToDate(dateString, formatLength, selector, successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

function Globalization_getDatePattern(successCb, errorCb, options) {
  var formatLength = (options && options.formatLength) || FORMAT_SHORT_STR;
  var selector = (options && options.selector) || SELECTOR_DATE_AND_TIME_STR;

  try {
    tizen.cordova.globalization.getDatePattern(formatLength, selector, successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

function Globalization_getDateNames(successCb, errorCb, options) {
  var type = (options && options.type) || TYPE_WIDE;
  var item = (options && options.item) || ITEM_MONTHS;

  try {
    tizen.cordova.globalization.getDateNames(type, item, successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

function Globalization_isDayLightSavingsTime(timestamp, successCb, errorCb) {
  var tzdate = new tizen.TZDate(new Date(timestamp)); //creates tzdate with local default timezone
  if (tzdate) {
    var result = tzdate.isDST();
    setTimeout( function() {
      successCb ( {'dst' : result} );
    }, 0);
  } else {
    setTimeout( function() {
      errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR , "cannot get information"));
    }, 0);
  }
}

function Globalization_getFirstDayOfWeek(successCb, errorCb) {
  try {
    tizen.cordova.globalization.getFirstDayOfWeek(successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

function Globalization_numberToString(number, successCb, errorCb, options) {
  var type = (options && options.type) || NUMBER_TYPE_DECIMAL;

  try {
    tizen.cordova.globalization.numberToString(number, type, successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

function Globalization_stringToNumber(numberStr, successCb, errorCb, options) {
  var type = (options && options.type) || NUMBER_TYPE_DECIMAL;

  try {
    tizen.cordova.globalization.stringToNumber(numberStr, type, successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

function Globalization_getNumberPattern(successCb, errorCb, options) {
  var type = (options && options.type) || NUMBER_TYPE_DECIMAL;

  try {
    tizen.cordova.globalization.getNumberPattern(type, successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

function Globalization_getCurrencyPattern(currencyCode, successCb, errorCb) {
  try {
    tizen.cordova.globalization.getCurrencyPattern(currencyCode, successCb, errorCb);
  } catch (e) {
    errorCb(new GlobalizationError(GlobalizationError.UNKNOWN_ERROR,
    'globalization not initialized'));
  }
}

exports = {
    getPreferredLanguage: function (successCb, errorCb, args) {
      Globalization_getPreferredLanguage(successCb, errorCb);
    },
    getLocaleName: function (successCb, errorCb, args) {
      Globalization_getPreferredLanguage(successCb, errorCb);
    },
    dateToString: function (successCb, errorCb, args) {
      Globalization_dateToString(args[0]['date'], successCb, errorCb, args[0]['options']);
    },
    stringToDate: function (successCb, errorCb, args) {
      Globalization_stringToDate(args[0]['dateString'], successCb, errorCb, args[0]['options']);
    },
    getDatePattern: function (successCb, errorCb, args) {
      Globalization_getDatePattern(successCb, errorCb, args[0]['options']);
    },
    getDateNames: function (successCb, errorCb, args) {
      Globalization_getDateNames(successCb, errorCb, args[0]['options']);
    },
    isDayLightSavingsTime: function (successCb, errorCb, args) {
      Globalization_isDayLightSavingsTime(args[0]['date'], successCb, errorCb);
    },
    getFirstDayOfWeek: function (successCb, errorCb, args) {
      Globalization_getFirstDayOfWeek(successCb, errorCb);
    },
    numberToString: function (successCb, errorCb, args) {
      Globalization_numberToString(args[0]['number'], successCb, errorCb, args[0]['options']);
    },
    stringToNumber: function (successCb, errorCb, args) {
      Globalization_stringToNumber(args[0]['numberString'], successCb, errorCb, args[0]['options']);
    },
    getNumberPattern: function (successCb, errorCb, args) {
      Globalization_getNumberPattern(successCb, errorCb, args[0]['options']);
    },
    getCurrencyPattern: function (successCb, errorCb, args) {
      Globalization_getCurrencyPattern(args[0]['currencyCode'], successCb, errorCb);
    }
};

require("cordova/exec/proxy").add("Globalization", exports);
console.log('Loaded cordova.globalization API');

// TODO: remove when added to public cordova repository -> begin
});
// TODO: remove -> end
