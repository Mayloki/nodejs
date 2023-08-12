var http = require('http');
var Static = require('node-static');
var WebSocketServer = new require('ws');


var clients = {};
var userNick = {}; // Ники пользователей чата
var serverPort = 8081; // Порт сервера
var matchId = 0;

function usersList()
{  // Отправляем новый список пользователей
	var listUser = "";     
	for(var key in userNick)
	{
		listUser = listUser + "~" + userNick[key];
	};
	for(var key in clients) {clients[key].send("~users" + listUser);};
};


var webSocketServer = new WebSocketServer.Server({port: serverPort});

webSocketServer.on('connection', function(ws)
{
	var id =  matchId = matchId + 1;
	clients[id] = ws;
	console.log("Пользователь с id[" + id + "] присоединился");

	ws.on('message', function(message)
	{
		var  mes = message.split('~'); // Разбиваем присланное сообщение
		if (mes[1] == "nickname")
		{
			userNick[id] = mes[2]; // Добовляем новый ник
			usersList();
			console.log("Пользователь id[" + id + "] установил имя [" + userNick[id] + "]");
		};	
	
		if (mes[1] == "message")
		{
			for(var key in clients) {clients[key].send("~message~" + userNick[id] + ": " + mes[2]);};
			console.log("[" + userNick[id] + "]" + ": '" + mes[2] + "'");
		};	
	});

	ws.on('close', function()
	{
		console.log("Пользователь " + userNick[id] + " id[" + id + "] отключился");
		delete userNick[id];
		delete clients[id];
		usersList();
	});
});


var fileServer = new Static.Server('.');
http.createServer(function (req, res)
{
	fileServer.serve(req, res);
}).listen(serverPort + 1);

console.log("");
console.log("***[СЕРВЕР 'FVR SOCIAL CLUB' ЗАПУЩЕН]***");

