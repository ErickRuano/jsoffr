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