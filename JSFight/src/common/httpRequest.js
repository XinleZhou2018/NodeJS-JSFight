const request = require('request');
const queryString = require("querystring");


function httpRequest(method, url, params){
    if (method === 'GET'){
        return new Promise((resolve, reject) =>{
            let full_url = url;
            if (params && Object.keys(params).length > 0){
                full_url += ( '?' + queryString.stringify(params));
            }
            request(full_url, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                  //Success
                  console.log(body);
                  console.log(response);
                  resolve(body);
                }else{
                    reject(error);
                }
              });
        });
    }else if (method === 'POST'){
        return new Promise((resolve, reject) =>{
            request({
                url: url,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(params)
            }, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log(body);
                    console.log(response);
                    resolve(response);
                }else{
                    reject(error);
                }
            }); 
        });
    }
}

module.exports = httpRequest;
