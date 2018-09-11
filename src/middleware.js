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
