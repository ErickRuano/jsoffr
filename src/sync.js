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
