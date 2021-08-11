var htmlParse = require( 'node-html-parser');

var https  = require("https")
var fs = require("fs")
//https://zoom.us/
class RequestContentData{
	
	constructor(requestUrl, path){
		console.log("Request Data For: "+requestUrl + " - "+path)
		this.hostName = requestUrl
		this.path = path
		this.rawTextList = Array()
		this.locationList = Array()
		this.result = this.processData(requestUrl,path)
		
	}
	
	async processData(requestUrl,path){
		try{
			var inputData = await this.getData(requestUrl,path)
		}catch(ex){
			console.log(ex.toString())
			return false
		}
		
		
		const parseData = htmlParse.parse(inputData)
		this.readChildNotes(parseData.childNodes,"")
		// Return true/false depending on whether we have
		// some useful/intesting location information.
		if (this.locationList.length > 0){
			return true;
		}
		return false
	}
	
	async readChildNotes(inputNodes,parentTag){
		
		for (var nodeKey in inputNodes){
			var nodeItem = inputNodes[nodeKey]
			
			if (nodeItem.nodeType == 1){
				var tagName = nodeItem.rawTagName
				var tagAttributes = nodeItem.rawAttrs
				
				
				
				if (typeof tagName == "string" &&
					tagName.toUpperCase() == "A"){
					var inputLink = tagName	
						
				}
				
				// Look around the attributes - looking For
				//	URLs, and mail to links here.
				// mailto:someone@example.com
				var attributeList = tagAttributes.split(" ")
				for (var attributeKey in attributeList){
					var attributeItem = attributeList[attributeKey]
					var keyValue = attributeItem.split("=")
					if (typeof keyValue[0] == "string" &&
						typeof keyValue[1] == "string" &&
						keyValue[0].toLowerCase() == "href" &&
						keyValue[1].indexOf(".ico") ==-1){
						var targetURL = 
							keyValue[1].
								replace('"',"").
								replace('"',"").
								replace('\\"',"").
								replace('\\"',"").
								replace('\'',"").
								replace('\'',"")
						if (this.locationList.indexOf(targetURL)==-1){
							this.locationList.push(targetURL)
						}
						
						
					}
				}
			}
			if (nodeItem.nodeType == 3){
				var textItem = nodeItem._rawText
				if (typeof textItem == "string" &&
					textItem.trim().length > 5){
					// Filter out JavaScript functions if present.
					if (textItem.indexOf(");") == -1 &&
						textItem.indexOf("}") == -1){
						this.rawTextList.push({textItem,parentTag})
					}
					
				}
			}
			if (nodeItem.childNodes instanceof Array &&
				nodeItem.childNodes.length > 0){
				this.readChildNotes(nodeItem.childNodes,tagName)
			}
			

		}
		
	}
	
	async getData(requestUrl,path){
		var options = {
			host:requestUrl,
			path:path,
		}
		
		return new Promise((result)=>{
			function makeRequest(response){
				var resultStr = ""
				response.on('data', function (data) {
   					 resultStr += data;
  				});

  				response.on('end', function () {
  					result(resultStr)
  				});
			
			}
		
			https.request(options, makeRequest).end();
		})
		
	}
	
}

module.exports = RequestContentData