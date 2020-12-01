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
  let zipcodeArr = require("./data.json");
	let queryString = (event['queryStringParameters'] != null)?event['queryStringParameters']:{};
	let resultedData = [];
	let returnedData = {};
	
	
	if(typeof queryString['enteredValue'] != "undefined"){
		switch(queryString['searchType']){
			case 'population':
				resultedData = zipcodeArr.filter(elem => {
					return (elem['estimated_population'] == queryString['enteredValue'])
				});
				returnedData = {'success':true, 'data':resultedData};
				break;
			case 'zip':
				resultedData = zipcodeArr.filter(elem => {
					return (elem['zip'].indexOf(queryString['enteredValue']) != -1)
				});
				returnedData = {'success':true, 'data':resultedData};
				break;
			case 'city':
				resultedData = zipcodeArr.filter(elem => {
					return (elem['primary_city'].indexOf(queryString['enteredValue']) != -1)
				});
				returnedData = {'success':true, 'data':resultedData};
				break;
			case 'distance':
				if(typeof queryString['latitude'] != "undefined" && typeof queryString['longitude'] != "undefined"){
					resultedData = zipcodeArr.filter(elem => {
						let  distance = distanceCalculator(queryString['latitude'], queryString['longitude'], elem['latitude'], elem['longitude'], 'K');
						console.log(distance);
						return distance < parseInt(queryString['enteredValue']);
					});
					returnedData = {'success':true, 'data':resultedData};
				}
				else{
					returnedData = {'success':false, 'error':"latitude and longitude is also required while using distance search type"};
				}
				break;
			
			default:
				returnedData = {'success':false, error:'no valid search type'};
		}
	}
	else{
		returnedData = {'success':false, 'error':'enteredValue is required.'};
	}

	let returnValue = returnValFunc(200 , returnedData);
	callback(null,returnValue);
};
