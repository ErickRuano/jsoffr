/**
 * Executes a [PUT] http request to url with data
 * @method
 * @param {string} url - The url to send the request to.
 * @param {object} data - The data to send along with the request.
 */ 

HTTPRequest.prototype.put = function (url, data, options){
	// For easier references
    var $this = this;

    // Validate url existence or throw error
    if (!url){
        throw new Error("Must provide a url");
    }

    var data = data || {};
    var options = options || {};

    return $this.httpClient.put(url, data, options);

};