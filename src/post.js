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