console.log("Server JS");

// use express
var express = require("express");

// create instance of express
var app = express();

//create headers
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
})

//use http with instance of express
var http = require("http").createServer(app);

// create socket instance with http instance
var io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// user mysql
var mysql = require("mysql");

// create connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    database: "web_chat",
    user: "root",
    password: ""
});

connection.connect(function (error){
    // show error message, if any
    console.log("Connected!");

})

// add listener for new connection
io.on("connection", function(socket){
    //this is socket for each other
    console.log("User connected " + socket.id);

    socket.on("delete_message", function(messageId){
        connection.query("DELETE FROM pesan WHERE id = '" + messageId + "'", function(error, result){
            // send event to all users
            io.emit("delete_message", messageId);
        })
    });

    //server listen on from each client via socket
    socket.on("new_message", function(data){
        console.log("Client says ", data);

        // server will send message to client
        // send same message back to client
        io.emit("new message", data);

        // save message in database
        connection.query("INSERT INTO pesan(message) VALUES ('" + data + "')", function(error, result){
            // return new message insert id
            // send same message back to client
            io.emit("new_message", {
                id: result.insertId,
                message: data
            });

        });
    })

    
})

//create API for get_message
app.get("/get_messages", function(req, res){
    connection.query("SELECT * FROM pesan", function(error, messages){
        res.end(JSON.stringify(messages));
    })
});

app.get("/", function(req, res){
    res.send("Hello, world!");
})

//start server
var port = 3000;
http.listen(port, function() {
    console.log("Server running on port " + port);
})