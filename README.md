## About Quizzer
Quizzer is a realtime websocket based interactive Game where you can organize quizzes.

Quizzer is written on top of a generic framework which can be extended to work with any discussion. For example:

  * Games where more than one person can connect and play together, for ex: quiz (which is what we have implemented)
  * Driving a discussion through poker cards
  * Quick objective test where multiple persons can participate and evaluate themselves.

In Quizzer,

 * One need not authenticate to use it
 * There are 2 types of users,   
   1st, *Organizer* - who creates a room for quiz where a discussion can take place and he/she uploads items (quiz questions) And    
   2nd, *Participant* - wwho can participate in a quiz ( most of the users belong to this type including organizer.)
 * Once a game is created, organizer will have to explicitly start the game, after all the participants have joined.
 * All the participants can join game at any stage ( when it has / has not been started.) If participants are joining are in middle of running game, scores will still be taken in consideration by referring cumulative data.
 * If you are still reading till here, Happy Quizzing, Quizzers! 


## Demonstration
Visit this <a href="http://topnoders.2013.nodeknockout.com/app">**link**</a>  for live version hosted.
To get a quick feel of the application, 
1. On main page, click on "Join Sample Room" button on top right of rooms page.
2. This will automatically generate a science objective quiz and put the user as creator.
3. Click on START button to start the quiz. Prior to starting the quiz, you may as well share the link with other users so that they can also participate.
4. Vote by selecting appropriate options for each questions.
5. A leader board is displayed on the right indicating scores.

NOTE: If user is using it for the first time, app will prompt for the name to use.

## Getting Started

###Clone repository by executing following
git clone <user>@github.com:nko4/topnoders.git && cd ./topnoders/

### install dev depenedent modules
npm install

(npm install express mongodb async node-uuid socket.io) 

### start locally
npm start

### deploy latest code in remote
ssh deploy@topnoders.2013.nodeknockout.com; cd topnoders;./deploy nko

## Technology/Frameworks Used

* <a href="http://nodejs.org">node.js</a>
* <a href="http://www.mongodb.org/">mongodb</a>
* <a href="http://emberjs.com">ember.js</a> ( client side single page framework )
* node frameworks
  * socket.io
  * express
  * mongodb

## Supported environment

The latest versions of browsers have support for the WebSocket API. Here are common browsers that support it:

* Apple Safari (as of v5.0.1)
* Google Chrome (as of v6)
* Microsoft Internet Explorer (as of v10)
* Mozilla Firefox (as of v6 with "Moz" prefix, as of v11 without prefix)
* Opera (as of v10.70)

## Contributor

  * Ankit
  * Ashu
  * Sivanesh
  * Soman

## License
MIT License

Copyright (c) 2013 Ankit, Ashu, Sivanesh, Soman and topnoders contributors