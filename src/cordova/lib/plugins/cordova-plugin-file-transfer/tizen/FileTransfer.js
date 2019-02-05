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
var plugin_name = 'cordova-plugin-file-transfer.tizen.FileTransfer';

cordova.define(plugin_name, function(require, exports, module) {
// TODO: remove -> end

function getParentPath(filePath) {
  var pos = filePath.lastIndexOf('/');
  return filePath.substring(0, pos + 1);
}

function getFileName(filePath) {
  var pos = filePath.lastIndexOf('/');
  return filePath.substring(pos + 1);
}

function TizenErrCodeToErrCode(err_code) {
  switch (err_code) {
    case WebAPIException.NOT_FOUND_ERR:
      return FileTransferError.FILE_NOT_FOUND_ERR;

    case WebAPIException.URL_MISMATCH_ERR:
      return FileTransferError.INVALID_URL_ERR;

    case WebAPIException.NETWORK_ERR:
      return FileTransferError.CONNECTION_ERR;

    case WebAPIException.ABORT_ERR:
      return FileTransferError.ABORT_ERR;

    default:
      return FileTransferError.NOT_MODIFIED_ERR;
  }
}

function FileErrorCodeToErrCode(err_code) {
  switch(err_code) {
    case FileError.SECURITY_ERR:
      return FileTransferError.ABORT_ERR;
    default:
      return FileTransferError.FILE_NOT_FOUND_ERR;
  }
}

function checkURL(url) {
  return url.indexOf(' ') === -1;
}

var uploads = {};
var downloads = {};

var filePrefix = 'file://';

exports = {
  upload: function(successCallback, errorCallback, args) {
    var filePath = args[0],
        server = args[1],
        fileKey = args[2] || 'file',
        fileName = args[3] || 'image.jpg',
        mimeType = args[4] || 'image/jpeg',
        params = args[5],
        trustAllHosts = args[6], // not used
        chunkedMode = args[7],
        headers = args[8],
        id = args[9],
        httpMethod = args[10] || 'POST';

    if (0 !== filePath.indexOf(filePrefix)) {
      filePath = filePrefix + filePath;
    }

    var fail = function(code, status, response) {
      uploads[id] && delete uploads[id];
      var error = new FileTransferError(code, filePath, server, status, response);
      errorCallback && errorCallback(error);
    };

    if (!checkURL(server)) {
      fail(FileTransferError.INVALID_URL_ERR);
      return;
    }

    function successCB(entry) {
      if (entry.isFile) {
        entry.file(function(file) {
          function uploadFile(blobFile) {
            var fd = new FormData();

            fd.append(fileKey, blobFile, fileName);

            for (var prop in params) {
              if(params.hasOwnProperty(prop)) {
                 fd.append(prop, params[prop]);
              }
            }
            var xhr = uploads[id] = new XMLHttpRequest();

            xhr.open(httpMethod, server);

            // Fill XHR headers
            for (var header in headers) {
              if (headers.hasOwnProperty(header)) {
                xhr.setRequestHeader(header, headers[header]);
              }
            }

            xhr.onload = function(evt) {
              if (xhr.status === 200) {
                uploads[id] && delete uploads[id];
                successCallback({
                  bytesSent: file.size,
                  responseCode: xhr.status,
                  response: xhr.response
                });
              } else if (xhr.status === 404) {
                fail(FileTransferError.INVALID_URL_ERR, this.status, this.response);
              } else {
                fail(FileTransferError.CONNECTION_ERR, this.status, this.response);
              }
            };

            xhr.ontimeout = function(evt) {
              fail(FileTransferError.CONNECTION_ERR, this.status, this.response);
            };

            xhr.onerror = function() {
              fail(FileTransferError.CONNECTION_ERR, this.status, this.response);
            };

            xhr.onabort = function () {
              fail(FileTransferError.ABORT_ERR, this.status, this.response);
            };

            xhr.upload.onprogress = function (e) {
              successCallback(e);
            };

            xhr.send(fd);

            // Special case when transfer already aborted, but XHR isn't sent.
            // In this case XHR won't fire an abort event, so we need to check if transfers record
            // isn't deleted by filetransfer.abort and if so, call XHR's abort method again
            if (!uploads[id]) {
              xhr.abort();
            }
          }

          uploadFile(file);

        }, function(error) {
          fail(FileTransferError.CONNECTION_ERR);
        });
      }
    }

    function errorCB(error) {
      fail(FileErrorCodeToErrCode(error.code));
    }

    resolveLocalFileSystemURL(filePath, successCB, errorCB);
  },
  download: function(successCallback, errorCallback, args) {
    var url = args[0],
        filePath = args[1],
        trustAllHosts = args[2],  // not used
        id = args[3],
        headers = args[4];

    if (!checkURL(url)) {
      errorCallback(new FileTransferError(FileTransferError.INVALID_URL_ERR, url, filePath));
      return;
    }

    var dirPath = getParentPath(filePath);
    var fileName = getFileName(filePath);

    var xhr = downloads[id] = new XMLHttpRequest();

    function fail(code, body) {
      delete downloads[id];
      errorCallback(new FileTransferError(code,
                                          url,
                                          filePath,
                                          xhr.status,
                                          body,
                                          null));
    }

    xhr.addEventListener('progress', function (evt) {
      successCallback(evt);
    });

    xhr.addEventListener('abort', function (evt) {
      fail(FileTransferError.ABORT_ERR, xhr.response);
    });

    xhr.addEventListener('error', function (evt) {
      fail(FileTransferError.CONNECTION_ERR, xhr.response);
    });

    xhr.addEventListener('load', function (evt) {
      if ((xhr.status === 200 || xhr.status === 0) && xhr.response) {
        try {
          tizen.filesystem.resolve(dirPath, function (dir) {
            if (dir.isFile) {
              fail(FileTransferError.FILE_NOT_FOUND_ERR);
              return;
            }

            function writeFile(dir) {
              var file = dir.createFile(fileName);

              file.openStream(
                'rw',
                function (stream) {
                  stream.writeBytes(Array.prototype.slice.call(new Uint8Array(xhr.response)));

                  delete downloads[id];

                  resolveLocalFileSystemURL(
                    filePath,
                    function (fileEntry) {
                      fileEntry.filesystemName = fileEntry.filesystem.name;
                      successCallback(fileEntry);
                    }, function (err) {
                      fail(TizenErrCodeToErrCode(err.code));
                    });
                }, function (err) {
                  fail(TizenErrCodeToErrCode(err.code));
                }
              );
            }

            dir.deleteFile(
              filePath,
              function() {
                writeFile(dir);
              }, function (err) {
                writeFile(dir);
              });

          }, function (err) {
            fail(TizenErrCodeToErrCode(err.code));
          },
          'rw');
        } catch(e) {
          fail(FileTransferError.ABORT_ERR);
        }
      } else if (xhr.status === 404) {
        fail(FileTransferError.INVALID_URL_ERR,
             String.fromCharCode.apply(null, new Uint8Array(xhr.response)));
      } else {
        fail(FileTransferError.CONNECTION_ERR,
             String.fromCharCode.apply(null, new Uint8Array(xhr.response)));
      }
    });

    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    // Fill XHR headers
    for (var header in headers) {
      if (headers.hasOwnProperty(header)) {
        xhr.setRequestHeader(header, headers[header]);
      }
    }
    xhr.send();
  },
  abort: function(successCallback, errorCallback, args) {
    var id = args[0];
    if (uploads[id]) {
      uploads[id].abort();
      delete uploads[id];
    } else if (downloads[id]) {
      downloads[id].abort();
      delete downloads[id];
    } else {
      console.warn('Unknown file transfer ID: ' + id);
    }
  },
};

require("cordova/exec/proxy").add("FileTransfer", exports);

console.log('Loaded cordova.file-transfer API');

// TODO: remove when added to public cordova repository -> begin
});
// TODO: remove -> end
