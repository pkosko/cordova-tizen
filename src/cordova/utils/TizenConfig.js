/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

var fs = require('fs');
var et = require('elementtree');
var xml = require('cordova-common').xmlHelpers;

var DEFAULT_ORIENTATION = 'default';

/** Wraps an TizenConfig file */
function TizenConfig (path) {
    this.path = path;
    this.doc = xml.parseElementtreeSync(path);
}

TizenConfig.prototype.getPackageId = function () {
    return this.doc.getroot().attrib['id'];
};

TizenConfig.prototype.setPackageId = function (pkgId) {
    this.doc.getroot().attrib['id'] = pkgId;
    return this;
};

TizenConfig.prototype.getXmlns = function () {
    return this.doc.getroot().attrib['xmlns'];
};

TizenConfig.prototype.getXmlnsTizen = function () {
    return this.doc.getroot().attrib['xmlns:tizen'];
};

TizenConfig.prototype.addXmlnsTizen = function () {
    return this.doc.getroot().attrib['xmlns:tizen'] = "http://tizen.org/ns/widgets";
};

TizenConfig.prototype.getName = function () {
    var name = this.doc.getroot().find('./name').text;
    return name;
};

    // add tizen:application section
    // <tizen:application
    //   id="gM6KuxOYKJ.WebBasicApplicationTizen"
    //   package="gM6KuxOYKJ"
    //   required_version="3.0"/>
TizenConfig.prototype.addTizenApplicationNode = function (packageId, version) {
    tizenApplication = new et.Element('tizen:application');
    tizenApplication.attrib['id'] = packageId + "." + this.getName();
    tizenApplication.attrib['package'] = packageId;
    tizenApplication.attrib['required_version'] = version;
    this.doc.getroot().append(tizenApplication);
};

TizenConfig.prototype.changeContentSrc = function () {
    var contentNode = this.doc.getroot().find('./content');
    // TODO handle other source
    return contentNode.attrib['src'] = "www/index.html";
};

/**
 * Writes manifest to disk syncronously. If filename is specified, then manifest
 *   will be written to that file
 *
 * @param   {String}  [destPath]  File to write manifest to. If omitted,
 *   manifest will be written to file it has been read from.
 */
TizenConfig.prototype.write = function (destPath) {
    fs.writeFileSync(destPath || this.path, this.doc.write({indent: 4}), 'utf-8');
};

module.exports = TizenConfig;