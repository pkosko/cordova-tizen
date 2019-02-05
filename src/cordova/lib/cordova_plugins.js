
cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-console/www/logger.js",
        "id": "cordova-plugin-console.logger",
        "clobbers": [
            "cordova.logger"
        ]
    },
    {
        "file": "plugins/cordova-plugin-console/www/console-via-logger.js",
        "id": "cordova-plugin-console.console",
        "clobbers": [
            "console"
        ]
    },
    {
        "file": "plugins/cordova-plugin-device/www/device.js",
        "id": "cordova-plugin-device.device",
        "clobbers": [
            "device"
        ]
    },
    {
      "file": "plugins/cordova-plugin-device/tizen/Device.js",
      "id": "cordova-plugin-device.tizen.Device",
      "runs": true
    },
    {
        "file": "plugins/cordova-plugin-device-motion/www/accelerometer.js",
        "id": "cordova-plugin-device-motion.Accelerometer",
        "clobbers": [
            "navigator.accelerometer"
        ]
    },
    {
        "file": "plugins/cordova-plugin-device-motion/www/Acceleration.js",
        "id": "cordova-plugin-device-motion.Acceleration",
        "clobbers": [
            "navigator.Acceleration"
        ]
    },
    {
      "file": "plugins/cordova-plugin-device-motion/tizen/Accelerometer.js",
      "id": "cordova-plugin-device-motion.tizen.Accelerometer",
      "runs": true
    },
    {
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "id": "cordova-plugin-dialogs.notification",
        "merges": [
            "navigator.notification"
        ]
    },
    {
      "file": "plugins/cordova-plugin-dialogs/tizen/Notification.js",
      "id": "cordova-plugin-dialogs.tizen.Notification",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-events/www/register.js",
      "id": "cordova-plugin-events.register",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-events/tizen/Events.js",
      "id": "cordova-plugin-events.tizen.Events",
      "runs": true
    },
    {
        "file": "plugins/cordova-plugin-file/www/DirectoryEntry.js",
        "id": "cordova-plugin-file.DirectoryEntry",
        "clobbers": [
            "window.DirectoryEntry"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/DirectoryReader.js",
        "id": "cordova-plugin-file.DirectoryReader",
        "clobbers": [
            "window.DirectoryReader"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/Entry.js",
        "id": "cordova-plugin-file.Entry",
        "clobbers": [
            "window.Entry"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/File.js",
        "id": "cordova-plugin-file.File",
        "clobbers": [
            "window.File"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileEntry.js",
        "id": "cordova-plugin-file.FileEntry",
        "clobbers": [
            "window.FileEntry"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileError.js",
        "id": "cordova-plugin-file.FileError",
        "clobbers": [
            "window.FileError"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileReader.js",
        "id": "cordova-plugin-file.FileReader",
        "clobbers": [
            "window.FileReader"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileSystem.js",
        "id": "cordova-plugin-file.FileSystem",
        "clobbers": [
            "window.FileSystem"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileUploadOptions.js",
        "id": "cordova-plugin-file.FileUploadOptions",
        "clobbers": [
            "window.FileUploadOptions"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileUploadResult.js",
        "id": "cordova-plugin-file.FileUploadResult",
        "clobbers": [
            "window.FileUploadResult"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/FileWriter.js",
        "id": "cordova-plugin-file.FileWriter",
        "clobbers": [
            "window.FileWriter"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/Flags.js",
        "id": "cordova-plugin-file.Flags",
        "clobbers": [
            "window.Flags"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/LocalFileSystem.js",
        "id": "cordova-plugin-file.LocalFileSystem",
        "clobbers": [
            "window.LocalFileSystem"
        ],
        "merges": [
            "window"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/Metadata.js",
        "id": "cordova-plugin-file.Metadata",
        "clobbers": [
            "window.Metadata"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/ProgressEvent.js",
        "id": "cordova-plugin-file.ProgressEvent",
        "clobbers": [
            "window.ProgressEvent"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/fileSystems.js",
        "id": "cordova-plugin-file.fileSystems"
    },
    {
        "file": "plugins/cordova-plugin-file/www/fileSystems-roots.js",
        "id": "cordova-plugin-file.fileSystems-roots"
    },
    {
        "file": "plugins/cordova-plugin-file/www/requestFileSystem.js",
        "id": "cordova-plugin-file.requestFileSystem",
        "clobbers": [
            "window.requestFileSystem"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/resolveLocalFileSystemURI.js",
        "id": "cordova-plugin-file.resolveLocalFileSystemURI",
        "merges": [
            "window"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file/www/fileSystemPaths.js",
        "id": "cordova-plugin-file.fileSystemPaths",
        "merges": [
            "cordova"
        ],
        "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/Errors.js",
      "id": "cordova-plugin-file.tizen.Errors",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/rootUtils.js",
      "id": "cordova-plugin-file.tizen.rootUtils",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/DirectoryEntry.js",
      "id": "cordova-plugin-file.tizen.DirectoryEntry",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/DirectoryReader.js",
      "id": "cordova-plugin-file.tizen.DirectoryReader",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/Entry.js",
      "id": "cordova-plugin-file.tizen.Entry",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/FileReader.js",
      "id": "cordova-plugin-file.tizen.FileReader",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/fileSystemPaths.js",
      "id": "cordova-plugin-file.tizen.fileSystemPaths",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/fileSystems-roots.js",
      "id": "cordova-plugin-file.tizen.fileSystems-roots",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/FileWriter.js",
      "id": "cordova-plugin-file.tizen.FileWriter",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/requestFileSystem.js",
      "id": "cordova-plugin-file.tizen.requestFileSystem",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/resolveLocalFileSystemURI.js",
      "id": "cordova-plugin-file.tizen.resolveLocalFileSystemURI",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/File.js",
      "id": "cordova-plugin-file.tizen.File",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-file/tizen/FileSystem.js",
      "id": "cordova-plugin-file.tizen.FileSystem",
      "merges": [
        "window.FileSystem"
      ]
    },
    {
        "file": "plugins/cordova-plugin-file-transfer/www/FileTransferError.js",
        "id": "cordova-plugin-file-transfer.FileTransferError",
        "clobbers": [
            "window.FileTransferError"
        ]
    },
    {
        "file": "plugins/cordova-plugin-file-transfer/www/FileTransfer.js",
        "id": "cordova-plugin-file-transfer.FileTransfer",
        "clobbers": [
            "window.FileTransfer"
        ]
    },
    {
      "file": "plugins/cordova-plugin-file-transfer/tizen/FileTransfer.js",
      "id": "cordova-plugin-file-transfer.tizen.FileTransfer",
      "runs": true
    },
    {
        "file": "plugins/cordova-plugin-network-information/www/network.js",
        "id": "cordova-plugin-network-information.network",
        "clobbers": [
            "navigator.connection",
            "navigator.network.connection"
        ]
    },
    {
        "file": "plugins/cordova-plugin-network-information/www/Connection.js",
        "id": "cordova-plugin-network-information.Connection",
        "clobbers": [
            "Connection"
        ]
    },
    {
      "file": "plugins/cordova-plugin-network-information/tizen/NetworkStatus.js",
      "id": "cordova-plugin-network-information.tizen.NetworkStatus",
      "runs": true
    },
    {
      "file": "plugins/cordova-plugin-network-information/tizen/Connection.js",
      "id": "cordova-plugin-network-information.tizen.Connection",
      "clobbers": [
          "navigator.connection",
          "navigator.network.connection"
      ]
    },
    {
        "file": "plugins/cordova-plugin-globalization/www/GlobalizationError.js",
        "id": "cordova-plugin-globalization.GlobalizationError",
        "clobbers": [
            "window.GlobalizationError"
        ]
    },
    {
        "file": "plugins/cordova-plugin-globalization/www/globalization.js",
        "id": "cordova-plugin-globalization.globalization",
        "clobbers": [
            "navigator.globalization"
        ]
    },
    {
      "file": "plugins/cordova-plugin-globalization/tizen/Globalization.js",
      "id": "cordova-plugin-globalization.tizen.Globalization",
      "runs": true
    },
    {
        "file": "plugins/cordova-plugin-media/www/MediaError.js",
        "id": "cordova-plugin-media.MediaError",
        "clobbers": [
            "window.MediaError"
        ]
    },
    {
        "file": "plugins/cordova-plugin-media/www/Media.js",
        "id": "cordova-plugin-media.Media",
        "clobbers": [
            "window.Media"
        ]
    },
    {
      "file": "plugins/cordova-plugin-media/tizen/Media.js",
      "id": "cordova-plugin-media.tizen.Media",
      "runs": true
    }
];
module.exports.metadata =
// TOP OF METADATA
{
    "cordova-plugin-console": "1.0.1",
    "cordova-plugin-device": "1.0.1",
    "cordova-plugin-device-motion": "1.2.0",
    "cordova-plugin-dialogs": "1.1.1",
    "cordova-plugin-events": "0.0.1",
    "cordova-plugin-file": "3.0.0",
    "cordova-plugin-file-transfer": "1.3.0",
    "cordova-plugin-globalization": "1.0.1",
    "cordova-plugin-media": "1.0.1",
    "cordova-plugin-network-information": "1.0.1",
}
// BOTTOM OF METADATA
});
