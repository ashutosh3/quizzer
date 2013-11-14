var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
	util = require('util'),
	server = new Server('localhost', 27017),
	db = new Db('nko', server),
	async = require ('async'),
	uuid = require('node-uuid');


// var findRooms = function (input, doneCallback) {
// 	console.log('finding rooms');
// 	db.open(function (err, db) {
// 		db.collection('room', function (err, coll) {
// 		    coll.find(input).toArray(function(err, rooms) {
// 	    		db.close();
// 				doneCallback && doneCallback(err, rooms);
// 		    });
// 		});
// 	});
// };


var findRooms = function (input, doneCallback) {
	db.open(function (err, db) {
		async.parallel({
				'rooms': function (cb) {
					db.collection('room', function (err, coll) {
					    coll.find(input).toArray(function(err, rooms) {
							cb(err, rooms)
					    });
					});
				},
				'racs': function (cb) {
					db.collection('room_activity_record', function (err, coll) {
					    coll.find(input).toArray(function(err, rooms) {
							cb(err, rooms)
					    });
					});
				}
			}, 

			function(err, results){
	    		db.close();
	    		var output = [];
	    		var racById = {};
	    		for (var i = 0; i < results.racs.length; i++) {
	    			racById[results.racs[i].roomId] = results.racs[i];
	    		}
	    		for (var i = 0; i < results.rooms.length; i++) {
	    			var rac = racById[results.rooms[i].roomId];
	    			if (!rac.finishTime) {
		    			output.push({
		    				id: results.rooms[i].roomId,
		    				room: results.rooms[i],
		    				rac: rac
		    			});
	    			}
	    		}
				doneCallback && doneCallback(err, output);
			}
		);

	});
};



var findRoom = function (input, doneCallback) {
	db.open(function (err, db) {

		async.parallel({
				'room': function (cb) {
					db.collection('room', function (err, coll) {
					    coll.findOne(input, function(err, room) {
							cb(err, room)
					    });
					});
				},
				'rac': function (cb) {
					db.collection('room_activity_record', function (err, coll) {
					    coll.findOne(input, function(err, rac) {
							cb(err, rac)
					    });
					});
				}
			}, 

			function(err, results){
	    		db.close();
				doneCallback && doneCallback(err, {
	    				id: results.room ? results.room.roomId: '',
	    				room: results.room,
	    				rac: results.rac
	    			});
			}
		);
	});
};

var findRoomItems = function (input, doneCallback) {
	this.findRoom(input, function(err, room){
		doneCallback(err, room.items);
	});
};


var createSampleRoom = function (input, doneCallback) {
	console.log('input: ' + util.inspect(input));
	var sampleRoomName = "Sample Science Quiz";
	var newRoomDoc = { "roomName" : sampleRoomName, "userName" : input.userName, 
						"roomType" : "QUIZ", "itemTimeout" : null, 
						"items" : [ { "title" : "aqueous solution", "itemText" : "An aqueous solution in which the concentration of OH – ions is greater than that of H + ions is:", "choices" : [ { "choiceText" : "basic", "sequence" : 1, "correct" : true }, { "choiceText" : "acidic", "sequence" : 2, "correct" : false }, { "choiceText" : "neutral", "sequence" : 3, "correct" : false }, { "choiceText" : "in equilibrium", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "521b6df3-6925-4a51-829f-d1d7eda4e5ac", "sequence" : 1 }, { "title" : "The overall charge at the top and bottom, respectively, of a towering cumulonimbus cloud during a thunderstorm is", "itemText" : "The overall charge at the top and bottom, respectively, of a towering cumulonimbus cloud during a thunderstorm is", "choices" : [ { "choiceText" : "positive, positive", "sequence" : 1, "correct" : false }, { "choiceText" : "positive, negative", "sequence" : 2, "correct" : true }, { "choiceText" : "negative, positive", "sequence" : 3, "correct" : false }, { "choiceText" : "negative, negative", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "dca67c63-566f-411f-90c3-89a348d3d151", "sequence" : 2 }, { "title" : "A lightning bolt is seen and its accompanying thunder is heard 15 seconds later. This means the storm is most likely how many miles away", "itemText" : "A lightning bolt is seen and its accompanying thunder is heard 15 seconds later. This means the storm is most likely how many miles away", "choices" : [ { "choiceText" : "3", "sequence" : 1, "correct" : true }, { "choiceText" : "6", "sequence" : 2, "correct" : false }, { "choiceText" : "9", "sequence" : 3, "correct" : false }, { "choiceText" : "15", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "f78979df-2362-4d3e-ad25-8c28ea93cb33", "sequence" : 3 }, { "title" : "Human epidermis is mostly composed of which of the following basic animal tissues types", "itemText" : "Human epidermis is mostly composed of which of the following basic animal tissues types", "choices" : [ { "choiceText" : "epithelial", "sequence" : 1, "correct" : true }, { "choiceText" : "connective", "sequence" : 2, "correct" : false }, { "choiceText" : "nervous", "sequence" : 3, "correct" : false }, { "choiceText" : "muscle", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "5a33fc1a-9162-446b-8c25-8595e70e9181", "sequence" : 4 }, { "title" : "A constant force acting on a body experiencing no change in its environment will g ive the body: ", "itemText" : "A constant force acting on a body experiencing no change in its environment will g ive the body: ", "choices" : [ { "choiceText" : "constant speed", "sequence" : 1, "correct" : false }, { "choiceText" : "constant acceleration", "sequence" : 2, "correct" : true }, { "choiceText" : "constant velocity", "sequence" : 3, "correct" : false }, { "choiceText" : "zero acceleration", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "5b76800a-30ea-4ff7-8ae3-841ed770fe28", "sequence" : 5 }, { "title" : "Which of the following is a sedimentary rock", "itemText" : "Which of the following is a sedimentary rock", "choices" : [ { "choiceText" : "slate", "sequence" : 1, "correct" : false }, { "choiceText" : "marble", "sequence" : 2, "correct" : false }, { "choiceText" : "basalt", "sequence" : 3, "correct" : false }, { "choiceText" : "sandstone", "sequence" : 4, "correct" : true } ], "timeout" : 100000, "score" : 10, "itemId" : "bf804548-03a1-42a9-80f8-503c3ac85da3", "sequence" : 6 }, { "title" : "Which of the following is LEAST accurate about minerals", "itemText" : "Which of the following is LEAST accurate about minerals", "choices" : [ { "choiceText" : "calcite has a hardness of 3 on most of its surfaces but a hardness of 4 along the crystal face perpendicular to its long axis", "sequence" : 1, "correct" : false }, { "choiceText" : "the Moh’s scale measures the absolute hardness of minerals", "sequence" : 2, "correct" : false }, { "choiceText" : "a mineral’s chemical composition largely determines its crystal shape and cleavage pattern", "sequence" : 3, "correct" : false }, { "choiceText" : " a mineral’s color is the same as its streak", "sequence" : 4, "correct" : true } ], "timeout" : 100000, "score" : 10, "itemId" : "2295b334-9632-4891-b071-571035332e70", "sequence" : 7 }, { "title" : "Which of the following has a melting point of 185ºC and readily dissolves in water at room temperature, but is NOT an electrolyte", "itemText" : "Which of the following has a melting point of 185ºC and readily dissolves in water at room temperature, but is NOT an electrolyte", "choices" : [ { "choiceText" : "NaCl", "sequence" : 1, "correct" : false }, { "choiceText" : "decane", "sequence" : 2, "correct" : false }, { "choiceText" : "sucrose", "sequence" : 3, "correct" : true }, { "choiceText" : "methane", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "7a8ecc3f-8a2c-4024-81ad-63bdb6978a4c", "sequence" : 8 }, { "title" : "Which of the following BEST describes the Balmer series", "itemText" : "Which of the following BEST describes the Balmer series", "choices" : [ { "choiceText" : "a series of quantum numbers indicating certain energy level s", "sequence" : 1, "correct" : false }, { "choiceText" : "hydrogen atom spectral line emission", "sequence" : 2, "correct" : true }, { "choiceText" : "a sequence of elements that are prod uced chronologically in supernovae", "sequence" : 3, "correct" : false }, { "choiceText" : "the energy spectrum of the early universe", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "348352c1-40c9-4bcd-9bd6-04e6d537f12d", "sequence" : 9 }, { "title" : "Which of the following is the single most important factor that generally sets a northern limit to tree growth, such as in the areas of transition between taiga and tundra in Alaska", "itemText" : "Which of the following is the single most important factor that generally sets a northern limit to tree growth, such as in the areas of transition between taiga and tundra in Alaska", "choices" : [ { "choiceText" : " high - winter winds", "sequence" : 1, "correct" : false }, { "choiceText" : "lack of summer warmth", "sequence" : 2, "correct" : true }, { "choiceText" : "lack of spring moisture", "sequence" : 3, "correct" : false }, { "choiceText" : "lack of soil nutrients", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "85ae06fe-c747-41ee-bb32-4291a06b8f9f", "sequence" : 10 }, { "title" : "The BEST explanation of why population I (read as: one) stars have a higher proportion of elements heavier than helium than population II ( read as: two) stars , is because Population I stars are", "itemText" : "The BEST explanation of why population I (read as: one) stars have a higher proportion of elements heavier than helium than population II ( read as: two) stars , is because Population I stars are", "choices" : [ { "choiceText" : "younger than population II star", "sequence" : 1, "correct" : true }, { "choiceText" : "older than population II stars", "sequence" : 2, "correct" : false }, { "choiceText" : " usually closer to planetary nebula than population II stars", "sequence" : 3, "correct" : false }, { "choiceText" : "often found near H - I (read as: H, one) regions", "sequence" : 4, "correct" : false } ], "timeout" : 100000, "score" : 10, "itemId" : "4a430474-bf1c-44ea-bb41-46f501502e89", "sequence" : 11 } ]};
	// findRoom({"roomName": sampleRoomName, owner: input.userName}, function (err, result){

	// });
	createRoom(newRoomDoc, doneCallback);
};

/* 
	input: {
		roomName: 'room1',
		userName: 'u1'		
	}
*/
var createRoom = function (input, doneCallback) {
	var newRoomDoc = {
		'roomId': uuid.v4(),
		'roomName': input.roomName,
		'owner': input.userName,
		"roomType": input.roomType,
        "itemTimeout": input.itemTimeout,
        "items": input.items,
        "createdTime": new Date()
	};

	for (var i = 0; i < newRoomDoc.items.length; i++) {
		newRoomDoc.items[i].itemId = uuid.v4();
		newRoomDoc.items[i].sequence = (i + 1);
	}
	var newRoomActivityRecord = {
		'roomId': newRoomDoc.roomId,
		'participants': []
	};

	db.open(function (err, db) {
		async.parallel({
				'createRoom': function (cb) {
					db.collection('room', function (err, coll) {
				    	coll.insert(newRoomDoc, function (err, result) {
				    		cb(err, result);
				    	});
					});
				},
				'createRoomActivityRecord': function (cb) {
					db.collection('room_activity_record', function (err, coll) {
					    coll.insert(newRoomActivityRecord, function (err, result) {
				    		cb(err, result);					    	
					    });
					});
				}
			}, 

			function(err, results){
	    		db.close();
	    		newRoomDoc.participants = newRoomActivityRecord.participants;
				doneCallback && doneCallback(err, newRoomDoc);
			}
		);
	});
};

/* 
	input: {
		roomId: 'rid1',
		userName: 'u1'		
	}
*/
var joinRoom = function(input, doneCallback) {
	//add this participant into room_activity_record.participants array.
	//also check that the same name is not used for more than 1 participants.
	//pull details of the room and respond with that.
	db.open(function (err, db) {
		//TODO: below code might have thread safety issues  (checkParticipantExistsForRoom)
		//review later. For now skipping.
		db.collection('room_activity_record', function (err, coll) {			
		    coll.findOne({'roomId': input.roomId}, function (err, rac) {
				db.collection('room', function (err, roomColl) {
				    roomColl.findOne({'roomId': input.roomId}, function(err, room) {
				    	if (err) {

				    	} else {
							if (!checkParticipantExistsForRoom(input, rac)) {
								var newParticipantDoc = { 
											"id":"participant" + (rac.participants.length + 1), 
											"userName":input.userName, 
											"joinTime": new Date()
										};

								var updateDoc = {
									"$push":{
										"participants": newParticipantDoc
									}
								};

								coll.update(
									{"roomId": input.roomId}, 
									updateDoc,
									function (e,recs){
										rac.participants.push(newParticipantDoc);
										db.close();
										doneCallback && doneCallback(e, {
											'status': 'SUCCESS',
											'details': processResponse({ rac: rac, 
												room: room,
												currentItem: room.items[room.items.length - rac.numItemsPending],
												userName: input.userName
											})
										});
									});
							} else {
								db.close();
								var err = {
									'status': 'ERROR',
									'statusMessage': input.userName + ' is already a participant in this room',
									'details': processResponse({ rac: rac, 
												room: room,
												currentItem: room.items[room.items.length - rac.numItemsPending],
												userName: input.userName
											})
								};
								doneCallback && doneCallback(err, err);
							}
				    	}
				    });
				});

		    });
		});
	});	
};

var checkParticipantExistsForRoom = function(input, rac) {
	var participants = rac.participants;
	for (var i = 0; i < rac.participants.length; i++) {
		if (rac.participants[i].userName === input.userName) {
			return true;
		}
	}
	return false;
}

/*

input: {
	roomId: 'rid',
	userName: 'username'
}

*/
var startRoom = function (input, doneCallback) {
	//verify the room owner
	db.open(function (err, db) {
		async.waterfall([
				function (cb) {
					db.collection('room', function (err, coll) {
				    	coll.findOne({roomId: input.roomId}, function (err, room) {
							if (room.owner !== input.userName) {
								cb({
									'status': 'ERROR',
									'message': 'non owner tried to start the room'
								}, room);
							} else {
				    			cb(null, room);
							}
				    	});
					});
				},

				function (room, cb) {
					db.collection('room_activity_record', function (err, coll) {
						var updateDoc = {
							"$set":{
								"startTime": new Date(),
								"numItemsPending": room.items.length
							}
						};

						for (var i = 0; i < room.items.length; i++) {
							if (i == 0) {
								updateDoc["$set"][room.items[i].itemId] = {
									"startCause": "room_start",
									"responses": {},
									"startedAt": new Date()
								};							
							} else {
								updateDoc["$set"][room.items[i].itemId] = {
										"responses": {},
									};							
							}
						}

						coll.update(
							{"roomId": input.roomId}, 
							updateDoc,
							function (e,recs){
								if (e) {
					    			cb(err, room);									
								} else {
									coll.findOne({roomId: input.roomId}, function (err, rac) {
				    					cb(err, room, rac);									
									});								
								}
							});
					});
				}
			], 

			function(err, room, rac){
				console.log('rac: ' + util.inspect(rac));
	    		db.close();
	    		if (room.items.length === 0) {
	    			doneCallback && doneCallback({
	    				'status':'ERROR',
	    				'message': 'Tried to start a room with no items.'
	    			});
	    		}
	    		else if (err) {
	    			doneCallback && doneCallback(err, err);
	    		} else {	    		
	    			var details = {
							'currentItem': room.items[0],
							'room': room, 
							'rac': rac
						};
					processResponse(details);
					doneCallback && doneCallback(err, {
						'status':'SUCCESS',
						'details': details
					});
	    		}
			}
		);
	});	
};

var processResponse = function (details) {
	if (details.currentItem) {
		for (var choice in details.currentItem.choices) {
			delete details.currentItem.choices[choice].correct;	
		}			
	}
	if (details.rac) {
		var itemHistory = [];
		for (var i = 0; i < details.room.items.length - details.rac.numItemsPending; i++) {
			itemHistory.push(details.room.items[i]);
		}
		details.itemHistory = itemHistory;
	}
	details.room && delete details.room.items;

	return details;
}

/**
input: {
    'roomId': req.body.room_id,
    'itemId': req.body.item_id,
    'userName': req.body.userName,
    'userResponse': req.body.userResponse
}
 if all users responded, 
 		if not the last quesiton
			return result for everyone as well as next question.
		else 
			return result and finish

   else 
   		respond a status   	
*/
var respondToItem = function (input, doneCallback) {
	this.findRoom({'roomId': input.roomId}, function (err, roomHolder) {
		var room = roomHolder.room;
		var rac = roomHolder.rac;

		if (rac.finishTime) {
			var error = {'status': "ERROR", 'message': 'room ' + room.roomName + ' has already finished.'};
			doneCallback && doneCallback(error, error);										
			db.close();
			return;						
		}
		if (rac.numItemsPending > 0) {
			var currentItemId = room.items[room.items.length - rac.numItemsPending].itemId;
			if (input.itemId !== currentItemId) {
				var error = {'status': "ERROR", 'message': 'user ' + input.userName + ' tried to answer an invalid item.'};
				doneCallback && doneCallback(error, error);										
				db.close();
				return;
			}						
		}

		var numParticipants = rac.participants.length;
		var responses = rac[input.itemId].responses;
		if (!checkParticipantExistsForRoom(input, rac)) {
			var error = {'status': "ERROR", 'message': 'user ' + input.userName + ' is not a valid participant for this room.'};
			doneCallback && doneCallback(error, error);										
			db.close();					
			return;	
		} 

		if (responses[input.userName]) {
			var error = {'status': "ERROR", 'message': 'user ' + input.userName + ' has already responded.'};
			doneCallback && doneCallback(error, error);										
			db.close();
			return;
		} 		

		var userResponse = {
			"response": input.userResponse,
			"respondedAt": new Date()
		};

		responses[input.userName] = userResponse;
		var updateDoc = {
				'$set': {
				}
			};
		var numAnswers = Object.keys(responses).length;
		if(numAnswers === numParticipants) {
			updateDoc['$inc'] = {"numItemsPending": -1};
			rac.numItemsPending = rac.numItemsPending - 1;
		}
		if (rac.numItemsPending === 0) {
			updateDoc['$set']['finishTime'] = new Date();
		}
		updateDoc['$set'][input.itemId] = rac[input.itemId];
		updateDoc['$set'][input.itemId].responses[input.userName] = userResponse;

		db.open(function (err, db) {
			db.collection('room_activity_record', function (err, coll) {
				coll.update(
					{"roomId": input.roomId},  updateDoc, function (e, recs) {
						updateRACCallback (e, recs, doneCallback, {
							rac: rac,
							room: room,
							input: input,
							numAnswers: numAnswers,
							numParticipants: numParticipants
						})
					});
			});
		});

	});
};

var updateRACCallback = function (e, recs, doneCallback, params){
	db.close();
	if (e) {
		doneCallback && doneCallback(null, {'status': "SUCCESS", 'message': 'Error while updating rac' });								
		return;
	}
	var room = params.room, rac = params.rac, input = params.input;
	var details = {'room': room, 'rac': rac, 'userName': input.userName };

	if(params.numAnswers === params.numParticipants) {
		if(rac.numItemsPending === 0) {
			processResponse(details);
			doneCallback && doneCallback(null, {
				'status': "SUCCESS",
				'message': 'user ' + input.userName + '\'s response recorded successfully.',
				'details': details
			});
		} else {
			var nextItem = room.items[room.items.length - rac.numItemsPending];
			details.currentItem = nextItem;

			processResponse(details);
			doneCallback && doneCallback(null, {
				'status': "SUCCESS",
				'message': 'user ' + input.userName + '\'s response recorded successfully.',
				'details': details
			});
		}
	} else {			
		processResponse(details);
		doneCallback && doneCallback(null, {
			'status': "SUCCESS",
			'message': 'user ' + input.userName + '\'s response recorded successfully.',
			'details': details
		});
	}
};

exports.findRooms = findRooms;
exports.findRoom = findRoom;
exports.findRoomItems = findRoomItems;
exports.createRoom = createRoom;
exports.joinRoom = joinRoom;
exports.startRoom = startRoom;
exports.respondToItem = respondToItem;
exports.createSampleRoom = createSampleRoom;
/*
	TODOs
socketio
Item Timeout and force to move to next item.
Clear item timeout when moving to next item.
Summary/stats
Add items to a room
finishRoom : add finishedAt in rac
Add checks in various APIs to not allow any actiity once room is finished.
*/
