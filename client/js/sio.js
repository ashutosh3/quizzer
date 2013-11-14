App.Sockets = (function () {
	var socket = io.connect('http://topnoders.2013.nodeknockout.com/');	

    var updateChoiceIndices = function (details) {    	
    	var choices = details.currentItem.choices;
        for (var i = 0; i < choices.length; i++) {
            var choice = choices[i];
            choice.index = i;
        }
    };

    var updateParticipants = function (model, details) {
    	var rac = details.rac;
    	var participants = [];
    	var userToScore = {};
    	var itemHistory = details.itemHistory;
    	for (var i = 0; i < itemHistory.length; i++) {
			var ih = itemHistory[i];
			var itemData = rac[ih.itemId];
			$.each(itemData.responses, function (k, v) {
				if(!userToScore[k]) {
					userToScore[k] = 0;
				}
				if(ih.choices[v.response].correct === true) {
					userToScore[k] = userToScore[k] + ih.score;
				}
			});
    	}

    	for (var i = 0; i < rac.participants.length; i++) {
    		var user = App.User.create(rac.participants[i]);
    		user.set('score', userToScore[user.get('userName')]);
    		participants.push(user);
    	}

    	participants.sort(function(a, b){
    		return b.score - a.score;
    	});
    	model.set('participants', participants);
    }; 
    var updateItemHistory = function (details) {
    	var rac = details.rac;
    	var itemHistory = details.itemHistory;
    	if (itemHistory) {
    		for (var i = 0; i < itemHistory.length; i++) {
    			var ih = itemHistory[i];
    			var itemData = rac[ih.itemId];
    			var currUserResponse = itemData.responses[App.currentUser.get('userName')];
    			if (currUserResponse && (currUserResponse.response != null && currUserResponse != undefined)) {
    				ih.currentUserAnsweredCorrectly = (ih.choices[currUserResponse.response].correct === true);
    			}
    			
    		}
    	}
    };

	var joinedCallback = function (model, data) {

    	if (App.currentUser.get('userName') === data.details.userName) {
			if (!data.details.rac.startTime) {
				App.set('userNotification', App.UserNotification.create({
					type: 'INFO',
					text: 'Waiting for other participants to join and the quiz to start.'
				}));
			}
    	}

        model.set('rac', data.details.rac);                
        model.set('room', data.details.room)
        data.details.currentItem && updateChoiceIndices(data.details);
        model.set('currentItem', data.details.currentItem);
        data.details.itemHistory && updateItemHistory(data.details);
        model.set('itemHistory', data.details.itemHistory);
        updateParticipants(model, data.details);
        App.get('currentUser').set('isOwnerForCurrentRoom', App.currentUser.get('userName') === data.details.room.owner);
    };

	var startedCallback = function (model, data) {
		App.set('userNotification', undefined);
        model.set('rac', data.details.rac);                
        model.set('rac.startTime', data.details.rac.startTime);                
        model.set('currentItem', data.details.currentItem);
        data.details.itemHistory && updateItemHistory(data.details);
        model.set('itemHistory', data.details.itemHistory);
        updateParticipants(model, data.details);
        data.details.currentItem && updateChoiceIndices(data.details);
    };

	var respondedCallback = function (model, data) {
        if (data.status !== 'ERROR') {
        	var itemChanged  = data.details.currentItem && model.get('currentItem').itemId !== data.details.currentItem.itemId;

        	itemChanged && App.set('userNotification', undefined);
			//TODO: re enabe the buttons
        	
            if (data.details.rac.numItemsPending === 0) {//no items pending
        		App.set('userNotification', App.UserNotification.create({
        			'type': 'INFO',
        			'text': 'Your quiz is finished. Check scores in leaderboard on the right!'
        		}));        		

                Ember.run.scheduleOnce('afterRender', this, function () {
	        		App.finishRoom(model);
                });

            }
        	else if (App.currentUser.get('userName') === data.details.userName) {
        		!itemChanged &&  App.set('userNotification', App.UserNotification.create({
					'text': 'Waiting for other participants to vote.',
					'type': 'INFO'
        		}));
        	} 

            model.set('rac', data.details.rac);                
            model.set('rac.startTime', data.details.rac.startTime);                
			data.details.currentItem && updateChoiceIndices(data.details);
            data.details.currentItem && model.set('currentItem', data.details.currentItem);                        
            data.details.itemHistory && updateItemHistory(data.details);
            data.details.itemHistory && model.set('itemHistory', data.details.itemHistory);

            updateParticipants(model, data.details);
            if (data.details.rac.numItemsPending === 0) {
            	model.set('currentItem', undefined);
            }
        } else {
        	var rac = data.details && data.details.rac;
        	if (rac && !rac[model.get('currentItem').itemId].responses[App.currentUser.userName]) {
        		//TODO: reenable
        	}
        	App.set('userNotification', App.UserNotification.create({
        		'type': 'ERROR',
        		'text': data.message || 'An error occurred!'
        	}));
        }
    };

	return {
		socket: socket,
		joinRoom: function (params) {
			var payload = {
	                "roomId": params.model.room.roomId,
	                "userName": App.currentUser.userName      
				};
			socket.emit('join', payload);
			
			App.Sockets.socket.on('joined', function (data) {
				joinedCallback(params.model, data);
			});
			App.Sockets.socket.on('started', function (data) {
				startedCallback(params.model, data);
			});
			App.Sockets.socket.on('responded', function (data) {
				respondedCallback(params.model, data);
			});
		},

		startRoom: function (params) {
			var payload = {
	                "roomId": params.model.room.roomId,
	                "userName": App.currentUser.userName      
				};
			socket.emit('start', payload);			
		}, 

		respond: function (params) {
			//TODO: disable the buttons with the voted button highlighted.
			var payload = {
	                "roomId": params.model.room.roomId,
	                "userName": App.currentUser.userName,
	                "itemId": params.model.currentItem.itemId,
	                "userResponse": params.userResponse
				};
				
			socket.emit('respond', payload);
		}
	};
})();


// App.Sockets.socket.on('connect', function () {
// 	App.setCurrentUser();
// 	App.Sockets.socket.emit('joinChannel', App.currentUser);
// });
