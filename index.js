/*
@~~~~@~~~~@~~~~@~~~~@~~~~@~~~~@
Jose D. Alas Valle,            \/
                               /\
@~~~~@~~~~@~~~~@~~~~@~~~~@~~~~@
                               \/
Final Project - CS355          /\
@~~~~@~~~~@~~~~@~~~~@~~~~@~~~~@~~~~@~~~~@
YE - "What did Kanye mean?"              \/
Implementing: Kanye.rest & serpstack     /\
@~~~~@~~~~@~~~~@~~~~@~~~~@~~~~@~~~~@~~~~@
*/

const fs = require('fs');
const http = require('http');
const https = require('https');
const port = 3000;
const server = http.createServer();


server.on("request", connection_handler);
server.on("listening", listening_handler);

server.listen(port);

function connection_handler(req, res){
   
    console.log(`New Request for ${req.url} from ${req.socket.remoteAddress}`);
    
    if(req.url === "/"){
	const form = fs.createReadStream("html/index.html");
	res.writeHead(200, {"Content-Type": "text/html"})
	form.pipe(res);
    }
    else if(req.url === "/kanye.JPG"){
	res.writeHead(200, {"Content-Type": "image/jpg"});
	const image_stream = fs.createReadStream("./image/kanye.JPG");
	image_stream.pipe(res);
    }
    else if(req.url.startsWith("/Quote")){
	const kanye_api = https.request(`https://api.kanye.rest/`);
	kanye_api.on("response", kanye_res => process_stream(kanye_res, parse_quote,res));
	
	//	setTimeout( () => kanye_api.end() , 100);   ######Testing

	kanye_api.end()

    }
 
}

function process_stream(stream, callback, ...args){
    let body = "";
    stream.on("data", chunk => body += chunk);
    stream.on("end", () => callback(body, ...args));
}


function listening_handler(){
    console.log(`Now Listening on Port ${port}`);
}

function parse_quote(quote_data, res){
    const lookup = JSON.parse(quote_data);
    var qoute;
    if (lookup == null) console.log("Null");
    else{
	let quoteR = Object.values(lookup);
	quote = quoteR[0];
	res.write(`<h1>${quote}</h1><br>`)
    }
    send_result(quote, res);
}

function send_result(quote, res){
    const access_key = ''; // <-----API key GOES HERE.....
    //console.log(quote);   ############ Testing purposes
    const serp_api = http.request(`http://api.serpstack.com/search?access_key=${access_key}&query=${quote}`);
    
    serp_api.on("response", (serp_res) => process_stream(serp_res, parse_results, res));
    
    serp_api.end();
    
    
}

function parse_results(data, res){
    const result = JSON.parse(data);
    let organic = result.organic_results;
    res.write(`<h2>Google Search results:</h2>`);
    for(var i = 0; i <= organic.length; i++){
	res.write(`<h3>${organic[i]?.title}<h3><a href="${organic[i]?.url}">${organic[i]?.url}</a><br><p>_____________________________________________</p>`);
    }
    res.end();
}
