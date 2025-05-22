/*
Project: ChatRoom Version1
Author: John Lin (jvlcgt)
Date: 3/14/2025
Professor: Michael Jurczyk

Project Description:
Implementation of a simple chat room that includes a client and a server that utilizes
the socket API.

The current scirpt is the main entry point for the server side code utilized in implementing
the simple client
*/

/*
 Note to developers.
 this is not a secure way to define ports, if it weren't for a school asignment with a fixed port number one should be
 using environment variables
*/

// setup of initial IP and port variables
const PORT = 10890;
const HOST = '127.0.0.1';

// importing required APIs
const http = require("http");
const { Server } = require("socket.io");

const { userExists, passwordMatch, addUser } = require("./fileManager.js");

// Active server data
// UUID : UserID pairs
const SESSIONDATA = {}

const httpServer = http.createServer();
const socketServer = new Server(httpServer);

/**
 * Function receives username and password,
 * Then checks for username matches in save file.
 * And adds a new entry in case there are no matching 
 * usernames
 * 
 * @param {string} userId 
 * @param {string} password 
 * @param {socket} socket 
 */
function newUser(userId, password, socket) {
  userExists(userId, (err, exists) => {
    if (err) {
      console.error('Error checking user:', err);
      return;
    }

    if (exists) {
      socket.emit("message", "Denied. User account already exists.");
      return;
    }

    addUser(userId, password, (err) => {
      if (err) {
        console.error('Error adding user:', err);
      }
      else {
        console.log('New user account created');
        socket.emit("message", "New user account created. Please login.");
      }

    });
  });
}

/**
 * 
 * function creates a random session id that persists for
 * the duration the server is running
 * 
 * @returns randomizedSessionId
 */
function generateSessionId() {
  return 'xxxx-4xxx-yxxx'
    .replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      // check for existing session id
      if (SESSIONDATA.hasOwnProperty(v.toString(16))) {
        return v.toString(16);
      }
      return v.toString(16);
    });
}

/**
 * function takes in user ID and password, it searches 
 * through the save file for a pattern match, if found, user 
 * will be logged in
 * 
 * @param {string} userId 
 * @param {string} password 
 * @param {socket} socket 
 */
function userLogin(userId, password, socket) {
  passwordMatch(userId, password, (err, matches) => {
    if (err) {
      console.error('Error checking password', err);
      return;
    }

    if (!matches) {
      // console.log("Error, username or password invalid");
      socket.emit("message", "Error, username or password invalid");
      return;
    }

    const sessionId = generateSessionId();
    SESSIONDATA[sessionId] = userId;

    const confirmationPayload = {
      sessionId: sessionId,
      username: SESSIONDATA[sessionId]
    }

    socket.emit("sessionHandshake", confirmationPayload);
    console.log(`${userId}: login`);
  })

}

/**
 * function takes client sessionId
 * sessionId is used to match message sender,
 * then displays sent message on server side, and emits
 * send message to all connected clients
 * 
 * @param {string} sessionId 
 * @param {string} password 
 * @param {socket} socket 
 */
function newMsg(sessionId, msg, socketServer) {
  const messageString = `${SESSIONDATA[sessionId]}: ${msg}`;
  console.log(messageString);
  socketServer.emit("message", messageString)
}


/**
 * function takes client sessionId
 * sessionId is used to match message sender,
 * then deletes client sessionID on server side, and emits
 * message to confirm logout request
 * 
 * @param {string} sessionId 
 */
function logOut(sessionId) {
  console.log(SESSIONDATA[sessionId] + " logout");
  delete SESSIONDATA[sessionId];
}

httpServer.listen(PORT, HOST, () =>
  console.log(`Socket.IO server is active on host: ${HOST}, port ${PORT}`)
);


socketServer.on("connection", (socket) => {
  console.log("My chat room server. Version One.");

  socket.on("newuser", (data) => {
    const username = data.username;
    const password = data.password;

    newUser(username, password, socket);
  });

  socket.on("login", (data) => {
    const username = data.username;
    const password = data.password;
    userLogin(username, password, socket);
  });

  socket.on("message", (data) => {
    const sessionId = data.sessionId;
    const message = data.message;
    newMsg(sessionId, message, socketServer);
  })

  socket.on("logout", (data) => {
    logOut(data.sessionId);
  });
});



