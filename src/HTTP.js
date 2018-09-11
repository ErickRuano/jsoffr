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