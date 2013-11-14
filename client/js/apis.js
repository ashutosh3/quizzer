var APIs = (function () {

	return {
		getRooms: function (params) {
			$.ajax({
		    	url:"/app/rooms",
				contentType: "application/json"
			}).done(function (data){
		    	params.successCallback && params.successCallback(data, params);
			}).error(function (){
				params.errorCallback && params.errorCallback(data, params);
			});
		},

		getRoom: function (params) {
			$.ajax({
		    	url:"/app/rooms/" + params.roomId,
				contentType: "application/json"
			}).done(function (data){
		    	params.successCallback && params.successCallback(data, params);
			}).error(function (){
				params.errorCallback && params.errorCallback(data, params);
			});
		},

		getItemsForRoom: function (params) {
			$.ajax({
		    	url:"/app/rooms/" + params.roomId + '/items',
				contentType: "application/json"
			}).done(function (data){
		    	params.successCallback && params.successCallback(data, params);
			}).error(function (){
				params.errorCallback && params.errorCallback(data, params);
			});
		},
		
		createSampleRoom: function (params) {
			$.ajax({
		    	url:"/app/create-sample-room",
	    		type: "POST",
		    	data: JSON.stringify({
	                "userName": App.currentUser.userName
				}),
				contentType: "application/json"
			}).done(function (data){
		    	params.successCallback && params.successCallback(data, params);
			}).error(function (){
				params.errorCallback && params.errorCallback(data, params);
			});
		}, 
		createRoom: function (params) {
			$.ajax({
		    	url:"/app/create-room",
	    		type: "POST",
		    	data: JSON.stringify({
	                "roomName": params.roomName,
	                "userName": App.currentUser.userName,
		            "items": params.items,
		            "roomType": params.roomType,
		            "itemTimeout": params.roomTimeOut
				}),
				contentType: "application/json"
			}).done(function (data){
		    	params.successCallback && params.successCallback(data, params);
			}).error(function (){
				params.errorCallback && params.errorCallback(data, params);
			});
		},

		joinRoom: function (params) {
			$.ajax({
		    	url:"/app/join-room",
	    		type: "POST",
		    	data: JSON.stringify({
	                "roomId": params.room.roomId,
	                "userName": App.currentUser      
				}),
				contentType: "application/json"
			}).done(function (data){
		    	params.successCallback && params.successCallback(data, params);
			}).error(function (){
				params.errorCallback && params.errorCallback(data, params);
			});
		},

		startRoom: function (params) {
			$.ajax({
		    	url:"/app/start-room",
	    		type: "POST",
		    	data: JSON.stringify({
	                "roomId": params.room.roomId,
	                "userName": App.currentUser      
				}),
				contentType: "application/json"
			}).done(function (data){
		    	params.successCallback && params.successCallback(data, params);
			}).error(function (){
				params.errorCallback && params.errorCallback(data, params);
			});
		},

		respondToItem: function (params) {
			$.ajax({
		    	url:"/app/respond",
	    		type: "POST",
		    	data: JSON.stringify({
	                "roomId": params.room.roomId,
	                "itemId": params.itemId,
	                "userResponse": params.userResponse,
	                "userName": App.currentUser      
				}),
				contentType: "application/json"
			}).done(function (data){
		    	params.successCallback && params.successCallback(data, params);
			}).error(function (){
				params.errorCallback && params.errorCallback(data, params);
			});
		}
	};
})();


