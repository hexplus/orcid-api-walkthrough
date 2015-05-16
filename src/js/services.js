wizardNgModule.service('wizardSrvc', ['$rootScope', function($rootScope){

	var srv = {
		current: location.hostname == 'localhost' ? 3 : 0, 
		elements: document.getElementsByClassName("step"),
		back: function(){
			if(srv.current > 0){
				srv.current--;
			}
		},
		next: function(){
			if(srv.current == srv.elements.length -1){
				srv.current = 0;	
			}else{
				srv.current++;
			}
		},
		finish: function(){
			srv.current = 0;
		}
	};

	return srv;
}]);