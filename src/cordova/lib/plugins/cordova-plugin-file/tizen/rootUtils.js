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
cordova.define('cordova-plugin-file.tizen.rootUtils', function(require, exports, module) {
// TODO: remove -> end

var rootUtils = (function() {
  var filePrefix = 'file:///';

  function stripTrailingSlash(str) {
    if (filePrefix !== str && '/' === str.substr(-1)) {
      return str.substr(0, str.length - 1);
    }
    return str;
  }

  function getName(uri) {
    return getFullPath(uri).replace(/^.*(\\|\/|\:)/, '');
  }

  function getFullPath(uri) {
    var tmp = findFilesystem(uri);
    tmp = getNativeUrl(uri).substring(tmp.nativeURL.length);
    if (!tmp) {
      tmp = '/';
    }
    if ('/' !== tmp[0]) {
      tmp = '/' + tmp;
    }
    return tmp;
  }

  function getNativeUrl(uri) {
    return stripTrailingSlash(uri);
  }

  function createEntry(file, fsName) {
    var uri = file.toURI();
    return {
      name: getName(uri),
      fullPath: getFullPath(uri),
      nativeURL: encodeURI(getNativeUrl(uri)),
      filesystemName: fsName
    };
  }

  var roots_to_resolve = [
    {
      filesystemName: 'temporary',
      name: '',
      fullPath: '/',
      nativeURL: 'wgt-private-tmp'
    },
    {
      filesystemName: 'persistent',
      name: '',
      fullPath: '/',
      nativeURL: 'wgt-private'
    }
  ];

  var roots = [
    {
      filesystemName: 'root',
      name: '',
      fullPath: '/',
      nativeURL: 'file:///'
    }
  ];

  var name_to_root;

  function getRoots(successCallback) {
    if (roots_to_resolve.length > 0) {
      tizen.filesystem.resolve(roots_to_resolve[0].nativeURL, function(dir) {
        roots_to_resolve[0].nativeURL = getNativeUrl(dir.toURI());
        roots.push(roots_to_resolve[0]);
        roots_to_resolve.splice(0, 1); // remove first item

        // we've resolved one root, check if there are any other
        getRoots(successCallback);
      }, function(e) {
        console.error(e);
        // in case of an error, return the roots we have so far
        successCallback(roots);
      });
    } else {
      if (!name_to_root) {
        name_to_root = {};
        for (var i = 0; i < roots.length; ++i) {
          name_to_root[roots[i].filesystemName] = roots[i];
        }
      }
      successCallback(roots.slice());
    }
  }

  function strncmp(str1, str2, n) {
    str1 = str1.substring(0, n);
    str2 = str2.substring(0, n);
    return ((str1 === str2) ? 0 : ((str1 > str2) ? 1 : -1 ));
  }

  function findFilesystem(uri) {
    var nativeUrl = getNativeUrl(uri);
    for (var i = roots.length - 1; i > 0; --i) {
      if (0 === strncmp(nativeUrl, roots[i].nativeURL, roots[i].nativeURL.length)) {
        return roots[i];
      }
    }

    return roots[0];  // root filesystem
  }

  function isRootUri(uri) {
    var fs = findFilesystem(uri);
    return (fs.nativeURL === getNativeUrl(uri));
  }

  // http://www.w3.org/TR/2011/WD-file-system-api-20110419/#naming-restrictions
  var disallowedCharacters = [ '/', '\\', '<', '>', ':', '?', '*', '"', '|' ];

  function isValidFileName(name) {
    for (var i = 0; i < disallowedCharacters.length; ++i) {
      if (-1 !== name.indexOf(disallowedCharacters[i])) {
        return false;
      }
    }

    return true;
  }

  var localhost = '//localhost/'
  var cdvPrefix = 'cdvfile:///';

  function internalUrlToNativePath(url) {
    var input = url;

    // skip parameters
    url = url.split('?')[0];

    // remove localhost
    url = url.replace(localhost, '///');

    if (0 === url.indexOf(cdvPrefix)) {
      // cdvfile protocol
      url = url.substring(cdvPrefix.length);

      var idx = url.indexOf('/');

      if (-1 !== idx) {
        var fsName = url.substring(0, idx);
        var fullPath = url.substring(idx);
        url = name_to_root[fsName] ? name_to_root[fsName].nativeURL + fullPath : undefined;
      } else {
        // malformed URL
        url = undefined;
      }
    } else if (0 === url.indexOf(filePrefix)) {
      // check if the filesystem for this URL exists
      var found = false;
      for (var i = 0; i < roots.length && !found; ++i) {
        if (0 === url.indexOf(roots[i].nativeURL)) {
          found = true;
        }
      }

      if (!found) {
        url = undefined;
      }
    } else {
      // backwards compatibility, device absolute path
      // only TEMPORARY and PERSISTENT paths are allowed
      url = filePrefix + url.substring(1);  // skip '/'
      if (0 !== url.indexOf(name_to_root.temporary.nativeURL) &&
          0 !== url.indexOf(name_to_root.persistent.nativeURL)) {
        url = undefined;
      }
    }

    if (url) {
      url = decodeURI(getNativeUrl(url));
    } else {
      console.error('Failed to decode internal URL: ' + input);
    }

    return url;
  }

  return {
    getRoots: getRoots,
    findFilesystem: findFilesystem,
    getName: getName,
    getFullPath: getFullPath,
    getNativeUrl: getNativeUrl,
    stripTrailingSlash: stripTrailingSlash,
    createEntry: createEntry,
    isRootUri: isRootUri,
    isValidFileName: isValidFileName,
    internalUrlToNativePath: internalUrlToNativePath
  };
})();

module.exports = rootUtils;

//TODO: remove when added to public cordova repository -> begin
});
//TODO: remove -> end
