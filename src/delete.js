/**
 * Executes a [PUT] http request to url with data
 * @method
 * @param {string} url - The url to send the request to.
 */ 

HTTPRequest.prototype.delete = function (url, options){
	// For easier references
    var $this = this;

    // Validate url existence or throw error
    if (!url){
        throw new Error("Must provide a url");
    }

    var options = options || {};

    return $this.httpClient.delete(url, options);

};