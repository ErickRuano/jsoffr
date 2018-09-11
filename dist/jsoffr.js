;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jsldb'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jsldb'));
  } else {
    root.Jsoffr = factory(root.Jsldb);
  }
}(this, function(jsldb) {
var HTTPClient = function(){
    this.middlewares = [];
};

HTTPClient.prototype.get = function(url, options){
    return this.request('GET', url, options || {});
};

HTTPClient.prototype.post = function(url, data, options){
    return this.request('POST', url, data, options || {});
};

HTTPClient.prototype.put = function(url, data, options){
    return this.request('PUT', url, data, options || {});
};

HTTPClient.prototype.delete = function(url, data, options){
    return this.request('DELETE', url, data, options || {});
};

HTTPClient.prototype.request = function(method, url, data, options){
        var $this = this;
        if (!url){
            throw new Error("Must provide a url");
        }
        var data = data || {};
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);

            for(middleware = 0; middleware < $this.middlewares.length; middleware++){
                if (!$this.middlewares[middleware].isIn) {
                    $this.middlewares[middleware].middleware(xhr);
                }
            }

            // Parse options
            if(options){
                // Check for headers
                if(options.headers && typeof options.headers == 'object' && options.headers.length){
                    for(var header in options.headers){
                        if(options.headers[header].key && options.headers[header].value){
                            xhr.setRequestHeader(options.headers[header].key, options.headers[header].value);
                        }
                    }
                }
            }

            xhr.onreadystatechange = function() {
                for(middleware = 0; middleware < $this.middlewares.length; middleware++){
                    if ($this.middlewares[middleware].isIn) {
                        $this.middlewares[middleware].middleware(xhr);
                    }
                }
            };

            xhr.onload = function () {
              if (this.status >= 200 && this.status < 300) {
                var res = xhr.responseText;
                resolve(res);
              } else {
                reject({
                  status: this.status,
                  statusText: xhr.statusText
                });
              }
            };

            xhr.onerror = function () {
              reject({
                status: this.status,
                statusText: xhr.statusText
              });
            };
        // xhr.setRequestHeader("content-type", "application/json");
        xhr.send(JSON.stringify(data));
      });
    };

HTTPClient.prototype.addMiddleware = function(middleware){
    if(typeof middleware.middleware == 'function'){
        this.middlewares.push(middleware);
    }
};
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
/**
 * Executes a [GET] http request to url
 * @method
 * @param {string} url - The url to send the request to.
 */ 

HTTPRequest.prototype.get = function (url, options){
    // For easier references
    var $this = this;

    // Validate url existence or throw error
    if (!url){
        throw new Error("Must provide a url");
    };

    var options = options || {};

    return new Promise(function(resolve, reject){
        if($this.hasInternet()){
            $this.httpClient.get(url, options).then(function(res){
                var toStore, toResolve;

                try{
                    toStore = JSON.parse(res);
                    toResolve = JSON.parse(res);
                }catch(err){
                    toStore = res;
                    toResolve = res;
                };

                try{
                    $this.db.set(url, toStore);                    
                }catch(err){
                    console.log('response too big to store.');
                }

                resolve(toResolve);
            }, function(err){
                if($this.db.get(url)){
                    resolve($this.db.get(url));
                }else{
                    reject(err);
                }
            });
        }else{
            if(!$this.db.get(url)){
                resolve($this.db.get(url));
            }else{
                reject();
            }
        }
    });

};
/**
 * Executes a [POST] http request to url with data
 * @method
 * @param {string} url - The url to send the request to.
 * @param {object} data - The data to send along with the request.
 */ 

HTTPRequest.prototype.post = function (url, data, options){
    // For easier references
    var $this = this;

    // Validate url existence or throw error
    if (!url){
        throw new Error("Must provide a url");
    }

    var data = data || {};
    var options = options || {};

    // Create unique request id
    var id = Math.round(new Date());

    // Create request object
    var obj = { id : id, url : url, data : data };

    // Save to queue
    // First check/create queue
    if(typeof this.db.get('queue') != 'object'){
        var queue = {};
        queue[id] = obj;
        this.db.set('queue', queue);
    }else{
        // If already exists, just add request to queue
        var queue = this.db.get('queue');
        queue[id] = obj;
        this.db.set('queue', queue);
    }

    return new Promise(function(resolve, reject){
        $this.httpClient.post(url, data, options).then(function(res){
            try{
                res = JSON.parse(res);
            }catch(err){
                res = res;
            }

            var q = $this.db.get('queue');
            delete q[id];
            $this.db.set('queue', q);
            resolve(res);
        },
        function(err){
            reject(err);
        });
    });
};
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
/**
 * Attempts to resend every queued request.
 * @method
 */ 

HTTPRequest.prototype.sync = function (){
    var $this = this;
    return new Promise(function(resolve, reject){
        // For easier references

        // Get requests
        var queue = $this.db.get('queue');

        // Requests count
        var count = 0;

        // Resolve if 0
        if(!Object.keys(queue).length){
            resolve(0);
        }

        // Callback for iteration
        var sent = function($this, request){
            $this.httpClient.post(queue[request].url, queue[request].data).then(function(res){
                count++;
                if(count == Object.keys($this.db.get('queue')).length){
                    var quantity = Object.keys($this.db.get('queue')).length;
                    $this.db.remove('queue');
                    resolve(quantity);
                }
            });
        };

        // Iterate over queued requests
        for(var q in queue){
            sent($this, q);
        }
        
    });

};

/**
 * Injects middlewares to http client
 * @method
 */ 

 HTTPRequest.prototype.addMiddleware = function (middleware, isIn){
 	var $this = this;
 	isIn = (isIn == true) ? isIn : false;
 	var tmpMiddleware = { "middleware": middleware, "isIn": isIn };

 	$this.middlewares = $this.middlewares || [];
 	$this.middlewares.push(tmpMiddleware);

 	if(typeof tmpMiddleware.middleware == 'function'){
 		try {
 			$this.httpClient.addMiddleware(tmpMiddleware);
 		} catch(err){
 			console.log(err);
 		}
 	}
 };

return HTTPRequest;
}));
