var App = Ember.Application.create({
    appName: 'Quizzer', //Initialize application level properties here.
    LOG_TRANSITIONS: true,
    userNotification: undefined,
    debug: true,
    version: '0.1',
    currentUser: undefined,
    ready: function () {
    }
});

App.Router.map(function () {
    this.resource('rooms');
    this.resource('room',{path: 'room/:room_id'}, function () {
        this.route('item',{path: 'item/:item_id'});
    });       
});

App.ApplicationRoute = Ember.Route.extend({
});

App.showUserPanel = function () {
    $.blockUI({ message: 'User:<input type="text" id="user"/> <button id="enterUser">Enter</button>'});
    $('#enterUser').on('click', App.setCurrentUser);
}

App.setCurrentUser = function () {
    var user = document.getElementById('user')
    if (user && user.value.length > 0) {
        var currentUser = {
            userName: user.value
        };
        $.cookie('currentUser', JSON.stringify(currentUser));
        App.set("currentUser", App.User.create(currentUser));
        $.unblockUI();
    } else {
        var error = "No Proper error user provided : " + user;
        console.error(errorMessage);
    }
};

App.clearCurrentUser = function () {
    $.removeCookie('currentUser');
    App.set("currentUser", undefined);
    App.showUserPanel();
};


var loadCurrentUserFromCookie = function () {
    var currentUser = $.cookie('currentUser');
    
    if (!currentUser) {
        if (!App.currentUser || !App.currentUser.userName  || App.currentUser.userName.length == 0) {
            // Load popup to ask user details.
            console.log("User Id not present");
            Ember.run.scheduleOnce('afterRender', this, function () {
                App.showUserPanel();
            });
        }
    } else {
        currentUser = JSON.parse(currentUser);
        App.set("currentUser", App.User.create(currentUser));
    }    
};

App.SetupRoute = Ember.Route.extend({
    beforeModel: function () {
        loadCurrentUserFromCookie();
        if (!App.currentUser || !App.currentUser.userName) {
            this.transitionTo('rooms');            
        }
    }, 
    enter: function() {
        loadCurrentUserFromCookie();
    },

    events: {
        clearUserDetails: function () {
            App.clearCurrentUser();
            this.transitionTo('rooms');
        }
    }
});

App.IndexRoute = App.SetupRoute.extend({
    redirect : function() {
        this.transitionTo('rooms');
    }
});

App.RoomsRoute = App.SetupRoute.extend({
    model: function (param) {
        var model = App.Rooms.create();

        APIs.getRooms({
            successCallback: function (result) {
                if(result && result.length > 0) {
                    for(var i = 0; i < result.length; i++) {
                        var room = App.Room.create({
                            id: result[i].id,
                            room: result[i].room,
                            rac: result[i].rac,
                        });
                        model.get('rooms').pushObject(room);                        
                    }
                }
            },
            failureCallback: function (result) {
                console.error('Failed to fetch rooms data from back end.')
            }
        });
        return model;
    },
    renderTemplate : function() {
        this.render('rooms', {
            outlet: 'root'
        });
    },
    setupController: function (controller, model) {
        this._super(controller, model);
    },

    events:{
        createRoom: function() {
            var itemsForRoomCreation = this.controller.get("itemsForRoomCreation"),
                roomTitle = $("#room-name")[0].value,
                itemTitle = $("#item-title")[0].value,
                that = this;
            if(roomTitle.length != 0) {
                if(itemTitle !== undefined || itemTitle !== null || itemTitle !== "") {
                    this.controller.addItem();
                }
                if(itemsForRoomCreation.length != 0) {
                    APIs.createRoom({
                        roomName: roomTitle,
                        roomType: "QUIZ",
                        userName: App.currentUser,
                        items: itemsForRoomCreation,
                        itemTimeout: 1000000,
                        successCallback: function (result, arguments) {
                            try{
                                if(result && result.roomId) {
                                    that.transitionTo('room', result.roomId);
                                } else {
                                    console.error('Room not added properly.');
                                }
                                
                            } catch(error) {
                                console.error('Failed to transition to room.');
                            }
                            
                        },
                        failure: function (result, arguments) {
                            console.error('Failed to create room.')
                        }
                    });
                } else {
                    console.log("Please enter at least one item to create the room");

                }
            } else {
                console.log("Please enter title to create the room");
            }
        },
        addItemToNewRoom: function() {
            try{
                this.controller.addItem();    
            } catch (error) {
                console.log("Exception in adding the room item");
            }
        },
        createSampleRoom: function () {
            var that = this;
            APIs.createSampleRoom({
                successCallback: function (result, arguments) {
                    try{
                        if(result && result.roomId) {
                            that.transitionTo('room', result.roomId);
                        } else {
                            console.error('Room not added properly.');
                        }
                        
                    } catch(error) {
                        console.error('Failed to transition to room.');
                    }
                    
                },
                failure: function (result, arguments) {
                    console.error('Failed to create room.')
                }
            });            
        } 
    }
});

App.RoomsController = Ember.ObjectController.extend({
    itemsForRoomCreation: [],
    addItem: function() {
        var that  = this;
        var itemTitle = $("#item-title")[0].value,
            itemText = $("#item-desc")[0].value,
            choice1 = $("#item-option1")[0].value,
            choice2 = $("#item-option2")[0].value,
            choice3 = $("#item-option3")[0].value,
            choice4 = $("#item-option4")[0].value,
            items = this.get("itemsForRoomCreation"),
            i;
            

        if(itemTitle === undefined || itemTitle === null || itemTitle === "") {
            console.log("Add the itemTitle to create the item ");
        } else {
            var item = App.Item.create({
                title : itemTitle,
                itemText : itemText,
                choices : [],
                timeout: 100000,
                score: 10
            })
            for(i = 1; i <= 4; i++) {
                choice = $("#item-option" + i)[0].value;
                isCorrect = $("#correctResult" + i).is(':checked');
                if(choice) {
                    item.choices.push({
                        "choiceText" : choice,
                        "sequence": i,
                        "correct": isCorrect
                    });
                }
            }
            items.push(item);
            $('#item').find('input:text').val('');
        }
    }
});

App.RoomRoute = App.SetupRoute.extend({
    model: function (params) {
        var model = App.Room.create();
        var that = this;
        APIs.getRoom({
            roomId: params.room_id,
            successCallback: function (result) {
                model.set('id', result.id);
                model.set('room', result.room);
                model.set('rac', result.rac);
                result.currentItem && model.set('currentItem', result.currentItem);
                that.joinRoom(model);
            },
            failureCallback: function (result) {
                console.error('Failed to fetch room data from back end for room ' + params.room_id + ".");
            }
        });
        return model;
    },

    renderTemplate : function() {
        this.render('room', {
            outlet: 'root'
        });
    },
    
    setupController: function (controller, model) {
        this._super(controller, model);
        if (model.room) {
            this.joinRoom(model);            
        }
    }, 

    joinRoom: function (model) {
        var that = this;
        App.Sockets.joinRoom({
            model: model
        });        
    }, 

    events: {
        startRoom: function (model) {
            var that = this;
            App.Sockets.startRoom({
                model: model
            });        
        }, 

        respond: function (model, choice) {
            $('.item_cards > a').attr('class', 'disabled width80 button');
            App.Sockets.respond({
                model: model,
                userResponse: choice.index
            });                    
        }
    }
});

App.Rooms = Ember.Object.extend({
    rooms: null,
    init: function () {
        this.rooms = [];
    }
});

App.Room = Ember.Object.extend({    
    room: null,
    rac: null,
    id: null,
    participants: null,
    currentItem: null,
    init: function () {
        this.participants = [];
    }, 
    notStarted: function () {
        return !this.get('rac.startTime');
    }.property('rac.startTime'),
    userVoted: function () {
        var rac = this.get('rac');
        var currentItem = this.get('currentItem');
        if (rac && currentItem) {
            var currUserResponse = rac[currentItem.itemId].responses[App.currentUser.userName];
            return !!currUserResponse;
        }
        return false;
    }.property('currentItem'),
    choiceClass: function () {
        return this.get('userVoted') ? 'disabled width80 button' : 'width80 button';
    }.property('currentItem')
});

App.User = Ember.Object.extend({
    userName: null,
    score: null,
    isOwnerForCurrentRoom: false
});

App.UserNotification = Ember.Object.extend({
    type: null,
    text: null,
    isInfo: function() {
        return this.get('type') === 'INFO';
    }.property('type')
});

App.Item = Ember.Object.extend({
    title: undefined,
    itemText: undefined,
    choices: [],
    timeout: 100000,
    score: 10
});

//Ember helpers
Ember.Handlebars.registerBoundHelper('substr', function(input) {
    if (!input) {
        return input;
    }
    var start = arguments[arguments.length - 1].hash.start || 0;
    var end = arguments[arguments.length - 1].hash.end;
    if (end > input.length) {
        return input;
    }
    var out = end ? input.substring(start, end) : input;
    return arguments[arguments.length - 1].hash.suffix ? out
            + arguments[arguments.length - 1].hash.suffix : out;
});


Ember.Handlebars.registerBoundHelper('add', function(input) {
    input = input || 0;
    var toAdd = arguments[arguments.length - 1].hash.toAdd || 1;
    return input + toAdd;
});


App.finishRoom = function (model) {
    var winner = model.get('participants')[0];
    var html = '<span style="font-size: 20px"><strong>Congratulations:</strong>' + winner.get('userName') 
    + ' <br> You have won the quiz with overall score of ' + winner.get('score') + '.</span>';
    var $element = $('.itemdescarea');
    $element.html(html);
    $element.attr('class', $element.attr('class') + ' usermessage');
};

