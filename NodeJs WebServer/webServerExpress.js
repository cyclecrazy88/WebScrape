const express = require("express")

const app = express()
const port = 3001

app.use(express.static('./dist'))

const websiteRequest = require("./readWebsiteContent.js")
const loadCacheContent = require("./loadCacheContent.js")
const availableItems = require(
			"./homeComponent/availableItems.js")

// Request the raw content for the site.
app.get('/requestContentForSite', async (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader("Access-Control-Allow-Origin","*");
	if (req instanceof Object &&
		req.query instanceof Object){
		var searchQuery = req.query
		if (typeof searchQuery.host == "string" &&
			typeof searchQuery.url == "string"){
				
			console.log("Request Input - "+
						"Host "+searchQuery.host+" "+
						"Url "+searchQuery.url)
				
			var parseUrl = 
				searchQuery.url.replace("https://","").
					replace("http://","").replace("/","")
				
			var contentRequest = new websiteRequest(parseUrl,searchQuery.host)
			var resultData = await contentRequest.resultData
			res.send(JSON.stringify(resultData))
		}else{
			res.send(JSON.stringify(null))
		}
	}
})

app.get("/getHomeItems",async(req,res)=>{
	var resultData = Object();
	// Find a list of links for the home status page
	var homeItemsList = new availableItems()
	resultData.availableLinks = await homeItemsList.result
	
	var linkOverview = new loadCacheContent.summaryForAllItemsOverview()
	resultData.linkSummary = await linkOverview.linkSummary
	resultData.wordCountAll = await linkOverview.wordCountAll
	res.setHeader('Content-Type', 'application/json');
	res.setHeader("Access-Control-Allow-Origin","*");
	res.send(JSON.stringify(resultData))
})

// Read the information about the site from the cache - links
//	Once a website has been cached and it's been indexed, discover and collect
//	available information about the site.
app.get("/getCacheWebLinks",async(req,res)=>{
	var resultData = null;
	if (req instanceof Object &&
		req.query instanceof Object){
		var searchQuery = req.query
		if (typeof searchQuery.index =="string" &&
			typeof searchQuery.subQuery =="string"){
					
			var cacheContent = new loadCacheContent.requestCachePageList(
				searchQuery.index,searchQuery.subQuery)
			resultData = await cacheContent.result
			
		}
	}
	res.setHeader('Content-Type', 'application/json');
	res.setHeader("Access-Control-Allow-Origin","*");
	res.send(JSON.stringify(resultData))
})

app.get("/getItemContent",async(req,res)=>{
	var resultData = null;
	if (req instanceof Object &&
		req.query instanceof Object){
		var searchQuery = req.query
		if (typeof searchQuery.index =="string" &&
			typeof searchQuery.subQuery =="string"){
					
			var cacheContent = new loadCacheContent.requestContentDetailForItem(
				searchQuery.index,searchQuery.subQuery)
			resultData = await cacheContent.listSummary
		}
	}
	res.setHeader('Content-Type', 'application/json');
	res.setHeader("Access-Control-Allow-Origin","*");
	res.send(JSON.stringify(resultData))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})