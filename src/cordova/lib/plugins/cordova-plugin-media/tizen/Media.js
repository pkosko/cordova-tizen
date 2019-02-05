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
var plugin_name = 'cordova-plugin-media.tizen.Media';

cordova.define(plugin_name, function(require, exports, module) {
// TODO: remove -> end
    function MediaError (code, msg) {
        Object.defineProperties(this, {
            code: {
                value: code || null,
                writable: false
            },
            message: {
                value: msg || "",
                writable: false
            }
        });
    }
    Object.assign(MediaError, window.MediaError);

    var audioObjects = {};
    var recorder = null;

    // creates the audio context
    var audioContext = window.AudioContext || window.webkitAudioContext;
    var context = new audioContext();

    function Recorder(_filename, _errorCallback) {
        var recorder = null;
        var recording = false;
        var recordingLength = 0;
        var volume = null;
        var audioInput = null;
        var sampleRate = null;
        var filename = _filename;
        var audioBlob = null;
        var leftchannel;
        var rightchannel;
        var errorCallback = _errorCallback;

        this.rec = function(){
            if (navigator.mediaDevices.getUserMedia){
                navigator.mediaDevices.getUserMedia({audio:true})
                  .then(onGetUserMedia)
                  .catch(function(e) {
                       console.log('Error capturing audio: ' + e.name + ': ' + e.message);
                   });
            } else {
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia || navigator.msGetUserMedia;
                if(navigator.getUserMedia) {
                    navigator.getUserMedia({audio: true}, onGetUserMedia, function(e) {
                        console.log('Error capturing audio: ' + e.name + ': ' + e.message);
                    })
                } else {
                    console.log('getUserMedia not supported in this browser.');
                }
            }
        }

        this.stop = function (){
            recording = false;
            var tracks = audioBlob.getAudioTracks();

            tracks.forEach(function(track) {
                track.stop();
            });

            recorder.disconnect();

            // flat the left and right channels down
            var leftBuffer = mergeBuffers(leftchannel, recordingLength);
            var rightBuffer = mergeBuffers(rightchannel, recordingLength);
            // interleave both channels together
            var interleaved = interleave(leftBuffer, rightBuffer);

            // create the buffer and view to create the .WAV file
            var buffer = new ArrayBuffer(44 + interleaved.length * 2);
            var view = new DataView(buffer);

            // write the WAV container
            // RIFF chunk descriptor
            writeUTFBytes(view, 0, 'RIFF');
            view.setUint32(4, 44 + interleaved.length * 2, true);
            writeUTFBytes(view, 8, 'WAVE');
            // FMT sub-chunk
            writeUTFBytes(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            // stereo (2 channels)
            view.setUint16(22, 2, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 4, true);
            view.setUint16(32, 4, true);
            view.setUint16(34, 16, true);
            // data sub-chunk
            writeUTFBytes(view, 36, 'data');
            view.setUint32(40, interleaved.length * 2, true);

            // write the PCM samples
            var lng = interleaved.length;
            var index = 44;
            var volume = 1;
            for (var i = 0; i < lng; i++){
                view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
                index += 2;
            }

            handleReadBlob(buffer);
        }

        function onGetUserMedia(stream){
            recording = true;
            recordingLength = 0;

            audioBlob = stream;

            // retrieve the current sample rate to be used for WAV packaging
            sampleRate = context.sampleRate;

            // creates a gain node
            volume = context.createGain();

            // creates an audio node from the microphone incoming stream
            audioInput = context.createMediaStreamSource(stream);

            // connect the stream to the gain node
            audioInput.connect(volume);

            /* From the spec: This value controls how frequently the audioprocess event is
             dispatched and how many sample-frames need to be processed each call.
             Lower values for buffer size will result in a lower (better) latency.
             Higher values will be necessary to avoid audio breakup and glitches */
            var bufferSize = 2048;
            recorder = context.createScriptProcessor(bufferSize, 2, 2);

            rightchannel = [];
            leftchannel = [];
            recorder.onaudioprocess = function(sample){
                if (!recording) {
                    return;
                }
                var left = sample.inputBuffer.getChannelData(0);
                var right = sample.inputBuffer.getChannelData(1);
                // clone the samples
                leftchannel.push(new Float32Array(left));
                rightchannel.push(new Float32Array(right));
                recordingLength += bufferSize;
            }

            //  connect the recorder
            volume.connect (recorder);
            recorder.connect (context.destination);
        }

        function handleReadBlob(buffer) {
            var array = new Uint8Array(buffer);
            var arr = [];
            for (var i=0; i<array.length; i++){
                arr[i] = array[i];
            }

            function onsuccess(dir) {
                var recFile
                try {
                    recFile = dir.createFile(filename);
                    if (recFile != null) {
                        recFile.openStream('w', function (fs) {
                            try {
                                fs.writeBytes(arr);
                                fs.close();
                            } catch (error) {
                                errorCallback(new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
                            }
                        }, function (error) {
                            console.log('Failed to open stream error: ' + error.message);
                            errorCallback(new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
                        }, 'UTF-8');
                    }
                } catch (error) {
                    console.log('Error during saving record to file');
                    errorCallback(new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
                }
            }

            function onerror(error) {
                console.log('The error ' + error + ' occurred when resolving documents folder');
                errorCallback(new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
            }

            try {
                tizen.filesystem.resolve('documents', onsuccess, onerror, 'rw');
            }
            catch(error) {
                console.log('Caught error during documents folder resolve: ' + error.message);
                errorCallback(new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
            }
        }

        function mergeBuffers(channelBuffer, recordingLength){
            var result = new Float32Array(recordingLength);
            var offset = 0;
            var lng = channelBuffer.length;
            for (var i = 0; i < lng; i++){
                var buffer = channelBuffer[i];
                result.set(buffer, offset);
                offset += buffer.length;
            }
            return result;
        }

        function interleave(leftChannel, rightChannel){
            var length = leftChannel.length + rightChannel.length;
            var result = new Float32Array(length);

            var inputIndex = 0;

            for (var index = 0; index < length;){
                result[index++] = leftChannel[inputIndex];
                result[index++] = rightChannel[inputIndex];
                inputIndex++;
            }
            return result;
        }

        function writeUTFBytes(view, offset, string){
            var lng = string.length;
            for (var i = 0; i < lng; i++){
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }
    }

  exports = {
  create: function(successCallback, errorCallback, args) {
    var id = args[0], src = args[1];

    console.log('media::create() - id =' + id + ', src =' + src);

    recorder = new Recorder(src, function(error) {
        console.log('Recorder error callback');
        Media.onStatus(id, Media.MEDIA_ERROR, error);
    });
    audioObjects[id] = new Audio();
    audioObjects[id].isReady = false;

    audioObjects[id].onStalledCB = function () {
      console.log('media::onStalled()');

      audioObjects[id].timer = setTimeout(
        function () {
          audioObjects[id].pause();

          if (audioObjects[id].currentTime !== 0)
            audioObjects[id].currentTime = 0;

          console.log('media::onStalled() - MEDIA_ERROR -> ' + MediaError.MEDIA_ERR_ABORTED);

          var err = new MediaError(MediaError.MEDIA_ERR_ABORTED, 'Stalled');

          Media.onStatus(id, Media.MEDIA_ERROR, err);
      }, 2000);
    };

    audioObjects[id].onEndedCB = function () {
        console.log('media::onEndedCB() - MEDIA_STATE -> MEDIA_STOPPED');

        Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STOPPED);
    };

    audioObjects[id].onErrorCB = function (event) {
        var err = event.srcElement.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ?
            new MediaError(MediaError.MEDIA_ERR_ABORTED) :
            event.srcElement.error;

        console.log('media::onErrorCB() - MEDIA_ERROR -> ' + err);

        Media.onStatus(id, Media.MEDIA_ERROR, err);
    };

    audioObjects[id].onPlayCB = function () {
        console.log('media::onPlayCB() - MEDIA_STATE -> MEDIA_STARTING ' + audioObjects[id].src);

        Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STARTING);
    };

    audioObjects[id].onPlayingCB = function () {
        console.log('media::onPlayingCB() - MEDIA_STATE -> MEDIA_RUNNING ' + audioObjects[id].src);

        Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_RUNNING);
    };

    audioObjects[id].onDurationChangeCB = function () {
        console.log('media::onDurationChangeCB() - MEDIA_DURATION -> ' +  audioObjects[id].duration);

        Media.onStatus(id, Media.MEDIA_DURATION, audioObjects[id].duration);
    };

    audioObjects[id].onTimeUpdateCB = function () {
        console.log('media::onTimeUpdateCB() - MEDIA_POSITION -> ' +  audioObjects[id].currentTime);

        Media.onStatus(id, Media.MEDIA_POSITION, audioObjects[id].currentTime);
    };

    audioObjects[id].onSeekedCB = function () {
        console.log('media::onSeekedCB() - MEDIA_POSITION -> ' +  audioObjects[id].currentTime);

        Media.onStatus(id, Media.MEDIA_POSITION, audioObjects[id].currentTime);
    };

    audioObjects[id].onCanPlayCB = function () {
        console.log('media::onCanPlayCB() ' + audioObjects[id].src);

        window.clearTimeout(audioObjects[id].timer);

        if (audioObjects[id].isReady) {
            audioObjects[id].play();
        }
    };

    audioObjects[id].addEventListener('error', audioObjects[id].onErrorCB);
    audioObjects[id].addEventListener('stalled', audioObjects[id].onStalledCB);
    audioObjects[id].addEventListener('canplay', audioObjects[id].onCanPlayCB);
    audioObjects[id].addEventListener('ended', audioObjects[id].onEndedCB);
    audioObjects[id].addEventListener('timeupdate', audioObjects[id].onTimeUpdateCB);
    audioObjects[id].addEventListener('durationchange', audioObjects[id].onDurationChangeCB);
    audioObjects[id].addEventListener('playing', audioObjects[id].onPlayingCB);
    audioObjects[id].addEventListener('play', audioObjects[id].onPlayCB);
    audioObjects[id].addEventListener('seeked', audioObjects[id].onSeekedCB);
  },
  startPlayingAudio: function(successCallback, errorCallback, args) {
    var id = args[0], src = args[1];

    console.log('media::startPlayingAudio() - id =' + id + ', src =' + src);

    audioObjects[id].isReady = true;

    if (!audioObjects[id].src) {

        var setSrc = function(id, src) {
            //assigning src sets playbackRate to default value equal to 1
            //so if playbackRate was set before first run of play() function
            //it should be saved and restored.
            var rate = audioObjects[id].playbackRate;

            audioObjects[id].src = src;
            audioObjects[id].playbackRate = rate;
        };

        if(RegExp('^((file\:\/\/)|(/)).*').test(src)) {
            try {
                tizen.filesystem.resolve(src, function() {
                    setSrc(id, src);
                }, function(error) {
                    console.log('Filesystem resolve failed');
                    Media.onStatus(id, Media.MEDIA_ERROR, new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
                }, 'r');
            } catch (error) {
                console.log('Error during filesystem resolve');
                Media.onStatus(id, Media.MEDIA_ERROR, new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
            }
            return;
        }

        if(RegExp('.*!(\/\/).*').test(src)) {
            try {
                tizen.filesystem.resolve('documents', function(dir) {
                    setSrc(id, dir.toURI() + '/' + src);
                }, function(error) {
                    console.log('Documents filesystem resolve failed');
                    Media.onStatus(id, Media.MEDIA_ERROR, new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
                }, 'r');
            } catch (error) {
                console.log('Caught error during documents folder resolve: ' + error.message);
                Media.onStatus(id, Media.MEDIA_ERROR, new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
            }
            return;
        }
        setSrc(id, src);
        return;
    }

    audioObjects[id].play();
  },
  stopPlayingAudio: function(successCallback, errorCallback, args) {
      var id = args[0];

      clearTimeout(audioObjects[id].timer);

      audioObjects[id].pause();
      audioObjects[id].isReady = false;

      if (audioObjects[id].currentTime !== 0)
          audioObjects[id].currentTime = 0;

      console.log('media::stopPlayingAudio() - MEDIA_STATE -> MEDIA_STOPPED');

      Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_STOPPED);
  },
  seekToAudio: function(successCallback, errorCallback, args) {
      console.log('media::seekToAudio()');
      var id = args[0], seconds = args[1] / 1000;

      audioObjects[id].currentTime = seconds;
  },
  pausePlayingAudio: function(successCallback, errorCallback, args) {
      var id = args[0];

      console.log('media::pausePlayingAudio() - MEDIA_STATE -> MEDIA_PAUSED');

      audioObjects[id].pause();
      audioObjects[id].isReady = false;

      Media.onStatus(id, Media.MEDIA_STATE, Media.MEDIA_PAUSED);
  },
  getCurrentPositionAudio: function(successCallback, errorCallback, args) {
      var id = args[0];
      console.log('media::getCurrentPositionAudio()');

      successCallback(audioObjects[id].currentTime);
  },
  startRecordingAudio: function(successCallback, errorCallback, args) {
      var id = args[0];
      console.log('media::startRecordingAudio()');
      try {
          tizen.filesystem.resolve('documents', function() {
              recorder.rec();
          }, function (error) {
              Media.onStatus(id, Media.MEDIA_ERROR, new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
          }, 'rw');
      } catch (error) {
        Media.onStatus(id, Media.MEDIA_ERROR, new MediaError(MediaError.MEDIA_ERR_ABORTED, error.message));
        return;
      }
  },
  stopRecordingAudio: function(successCallback, errorCallback, args) {
      var id = args[0];
      console.log('media::stopRecordingAudio()');

      recorder.stop();
  },
  release: function(successCallback, errorCallback, args) {
      exports.stopPlayingAudio(successCallback, errorCallback, args);
      var id = args[0];

      audioObjects[id].removeEventListener('canplay', audioObjects[id].onCanPlayCB);
      audioObjects[id].removeEventListener('ended', audioObjects[id].onEndedCB);
      audioObjects[id].removeEventListener('timeupdate', audioObjects[id].onTimeUpdateCB);
      audioObjects[id].removeEventListener('durationchange', audioObjects[id].onDurationChangeCB);
      audioObjects[id].removeEventListener('playing', audioObjects[id].onPlayingCB);
      audioObjects[id].removeEventListener('play', audioObjects[id].onPlayCB);
      audioObjects[id].removeEventListener('error', audioObjects[id].onErrorCB);
      audioObjects[id].removeEventListener('error', audioObjects[id].onStalledCB);
      audioObjects[id].removeEventListener('seeked', audioObjects[id].onSeekedCB);

      delete audioObjects[id];
      console.log('media::release()');
  },
  setVolume: function(successCallback, errorCallback, args) {
      var id = args[0], volume = args[1];

      console.log('media::setVolume()');

      audioObjects[id].volume = volume;
  },
  //cordova common layer supports setRate function for ios platform only
  //it is for future use
  setRate: function(successCallback, errorCallback, args) {
      var id = args[0], rate = args[1];

      console.log('media::setRate()');

      audioObjects[id].playbackRate = rate;
  }
};
require('cordova/exec/proxy').add('Media', exports);

console.log('Loaded cordova.media API');

// TODO: remove when added to public cordova repository -> begin
});
// TODO: remove -> end
