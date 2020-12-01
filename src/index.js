// lambda-like handler function

returnValFunc = function(statusCode, body, token=null){
	let customHeader = {
	  'Access-Control-Allow-Origin': '*',
	  'Access-Control-Allow-Credentials': true,
	  'Access-Control-Expose-Headers':'access-token'
	};
	
	if(token != null){
		customHeader['access-token'] = token;
	}
	
	let data = {
		statusCode: statusCode,
		body:JSON.stringify(body),
		headers: customHeader,
	}
	return data;
	
}

function distanceCalculator(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}


module.exports.handler = async (event, context, callback) => {
	let zipcodeArr = require("./../data.json");
	// If method is post then bodyobject will be initialize with body. if it is get method then it will use query string.
	let bodyObj = (event['body'] != null)?event['body']:(event['queryStringParameters'] != null)?event['queryStringParameters']:{};
	let returnedData = {};
	
	let resultedData = zipcodeArr.filter(elem => {
		let included = true;
		if(typeof bodyObj['population'] != "undefined" && bodyObj['population'] != "" && !isNaN(bodyObj['population'])){
			included = (parseInt(elem['estimated_population']) < parseInt(bodyObj['population']));
		}
		if(typeof bodyObj['zip'] != "undefined" && bodyObj['zip'] != ""){
			included = (elem['zip'].indexOf(bodyObj['zip']) != -1);
		}
		if(typeof bodyObj['city'] != "unddefined" && bodyObj['city'] != ""){
			included = (elem['primary_city'].indexOf(bodyObj['city']) != -1)
		}
		if(typeof bodyObj['distance'] != "undefined" && typeof bodyObj['latitude'] != "undefined" && typeof bodyObj['longitude'] != "undefined"){
			let  distance = distanceCalculator(bodyObj['latitude'], bodyObj['longitude'], elem['latitude'], elem['longitude'], 'K');
			included = distance < parseInt(bodyObj['distance']);
			
		}
		return included;
	});
	returnedData = {'success':true, 'data':resultedData};
	let returnValue = returnValFunc(200 , returnedData);
	callback(null,returnValue);	
};
