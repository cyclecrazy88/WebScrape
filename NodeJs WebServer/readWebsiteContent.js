
var webRequestHandler = require("./webRequest.js")
var fs = require("fs")

// Process - extract the available information from a website, 
//	build and construct a structure/data/information about the site.
//	which can be cached for future lookups
class processWebsiteContent{
	
	constructor(websiteUrl,cacheName){
		this.pageCache = Array()
		this.cacheData = Object()
		this.cacheName = cacheName
		this.resultData = this.parseWebsite(websiteUrl)
	}
	
	async parseWebsite(websiteUrl){
		var pageSearch = new webRequestHandler(websiteUrl,"/")
		var result = await pageSearch.result
		if (result){
			var textData = pageSearch.rawTextList
			var linkData = pageSearch.locationList
			
			var linkObj = {
				links:linkData,
				text:textData,
				path:"/",
				url:websiteUrl
			}
			
			this.cacheData["/"] = linkObj
		}
		
		// Now look through and try to read some Location
		// information.
		for (var pageKey in pageSearch.locationList){
			var pageItem = pageSearch.locationList[pageKey]
			if (pageItem.toLowerCase().indexOf(websiteUrl.toLowerCase())>-1 ){
				var localUrl = pageItem.replace("https://","").replace("http://","")
				// Okay now strip out the http prefix, and remove the hostname to reveal the
				//	path.
				var requestPath = localUrl.toLowerCase().replace(websiteUrl.toLowerCase(),"")
				
				if (requestPath.indexOf("/") == 0){
					var pageLookup = new webRequestHandler(websiteUrl,requestPath)
				
					if (await pageLookup.result){
						var textData = pageLookup.rawTextList
						var linkData = pageLookup.locationList
					}
				
					var linkObj = {
						links:linkData,
						text:textData,
						path:pageItem,
						url:websiteUrl
					}
					this.cacheData[pageItem] = linkObj
				}
				
				
			}
			else if (pageItem.indexOf("/")==0){
				var pageLookup = new webRequestHandler(websiteUrl,pageItem)
				
				//break
				
				if (await pageLookup.result){
					var textData = pageLookup.rawTextList
					var linkData = pageLookup.locationList
				}
				
				var linkObj = {
					links:linkData,
					text:textData,
					path:pageItem,
					url:websiteUrl
				}
				this.cacheData[pageItem] = linkObj
				
				//break;
			}
		}
		
		
		
		this.cacheItem(this.cacheData)
		return this.cacheData
	}
	// Save the item to cache for the site request.
	async cacheItem(cacheData){
		if (!fs.existsSync("./cacheData")){
			fs.mkdirSync("./cacheData")
		}
		if (cacheData instanceof Object){
			if (!fs.existsSync("./cacheData/"+this.cacheName)){
				fs.mkdirSync("./cacheData/"+this.cacheName)
			}
			
			fs.writeFileSync(
				"./cacheData/"+this.cacheName+"/data.json",
				JSON.stringify(cacheData))
			var updateTime = new Date()
			fs.writeFileSync(
				"./cacheData/"+this.cacheName+"/updateEpoc.txt",
				updateTime.getTime()+"")
		}
		
	}
	
	
}



module.exports = processWebsiteContent