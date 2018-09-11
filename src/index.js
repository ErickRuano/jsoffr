/**
* Request Module
* @version 1.0.0
* @module Request
*/

/**
 * This is the library main class.
 * @constructor
 * @param {object} httpclient - (optional) A http client such as angular's $http in the form of { get : f(url){ return new Promise() }, post, put, delete : f(url, data){ return new Promise() } }
 */
 function HTTPRequest (httpClient){
	this.httpClient = httpClient || new HTTPClient();
	this.queue = [];
	this.hasInternet = function() {
        if (window.cordova) {
            if (navigator.connection.type == Connection.NONE) {
                return false;
            } else {
                return true;
            }
        } else {
            return navigator.onLine;
        }
    };

    // Instance a new JSDB
    this.db = new JSDB("HTTPRequest");
 }

 // expose to global window object.
 window.HTTPRequest = HTTPRequest;