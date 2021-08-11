var fs = require("fs")

// Load the 
class loadCacheContent{
	constructor(cacheName){
		this.cacheData = this.loadCache(cacheName)
		
	}
	// Load the cache content from the URL
	loadCache(cacheName){
		if (fs.existsSync("./cacheData/"+cacheName+"/data.json")){
			var cacheInputData =
				fs.readFileSync("./cacheData/"+cacheName+"/data.json","utf8")
			var parseInputData = JSON.parse(cacheInputData)
			return parseInputData
		}
		return null
	}
	
}
// Loop around and request a page listing for the cache
//	data items.
class requestCachePageList extends loadCacheContent{
	
	constructor(cacheName){
		super(cacheName)
		this.result = this.getPageList()
		
	}
	// Request a list of index items for the cache data.
	//	Index the corresponding object item for the data request.
	getPageList(){
		var pageList = Array()
		var cacheData = this.cacheData
		var outputPageLinks = Object()
		
		if (cacheData instanceof Object){
			for (var cacheKey in cacheData){
				if (cacheKey.indexOf(".css")==-1)
					pageList.push(cacheKey)
				var pageLinkList = Array()
				var pageLinkListExternal = Array()
				var externalDoneItems = Array()
				
				// Fetch a summary of the data items for the link.
				var linkList = this.linkSummary(cacheKey,cacheData[cacheKey])
				var groupListing = this.linkSummaryUnique(cacheKey,cacheData[cacheKey])
				
				// Okay now determine which links are 'global' and unique to this page.
				for (var linkInternalListKey in linkList.internalLinks){
					var internalLink = linkList.internalLinks[linkInternalListKey]
					
					if (groupListing.outputInternalLinks.indexOf(internalLink) ==-1){
						pageLinkList.push({url:cacheData[cacheKey].url,link:internalLink})
					}
				}
				// Now do the same for the external links - discover items unique to
				// a given page.
				for (var linkExternalListKey in linkList.externalLinks){
					var externalLink = linkList.internalLinks[linkInternalListKey]
					
					// Check to see if this link has already been done - if true
					//	simply skip over this link
					if (externalDoneItems.indexOf(internalLink)==-1){
						externalDoneItems.push(internalLink)
					}else{
						continue;
					}
					
					if (groupListing.outputExternalLinks.indexOf(externalLink) ==-1){
						pageLinkListExternal.push({url:cacheData[cacheKey].url,link:internalLink})
					}
				}
				
				outputPageLinks[cacheKey] = {pageLinkList,pageLinkListExternal,internalLink,linkList}
			}
		}
		return {pageList,outputPageLinks}
	}
	
	// Based on the link data - try to find a summary
	//	(items which are not present in other listings).
	linkSummaryUnique(inputKey,inputPage){
		var cacheData = this.cacheData
		var outputInternalLinks = Array()
		var outputExternalLinks = Array()
		for (var cacheKey in cacheData){
				
			if (cacheKey != inputKey){
				var linkSummaryData = this.linkSummary(cacheKey,cacheData[cacheKey])
				outputInternalLinks = outputInternalLinks.concat(linkSummaryData.internalLinks)
				outputExternalLinks = outputExternalLinks.concat(linkSummaryData.externalLinks)
			}
			
		}
		return {outputInternalLinks,outputExternalLinks}
	}
	
	// Fetch a link summary for the data item.
	linkSummary(inputKey,inputPage){
		var internalLinks = Array();
		var externalLinks = Array();
		for (var inputLink in inputPage.links){
			var linkData = inputPage.links[inputLink]
			if (typeof linkData == "string" &&
				(linkData.indexOf("https://") >= 0 ||
					linkData.indexOf("https://") >= 0)) {
			linkData = linkData.replace("https://","").
						replace("http://","")	
				if (linkData.indexOf(inputPage.url)==0){
					internalLinks.push( linkData.replace(inputPage.url,"") )
				}else{
					externalLinks.push(linkData)
				}
			}else{
				internalLinks.push(linkData)
			}
			
		}
		return {internalLinks,externalLinks}
	}
}

class requestContentDetailForItem extends loadCacheContent{
	
	constructor(cacheName,subDetail){
		super(cacheName)
		this.subDetail = subDetail
		this.listSummary = this.summaryForSubDetail(subDetail)
	}
	
	summaryForSubDetail(subDetail){
		var wordRegex = new RegExp(/^([a-z'_-]{1,})$/i)
		var countObj = Object()
		var subContentDetail = this.cacheData[subDetail]
		if (subContentDetail instanceof Object){
			// Loop around the text items to collect some
			// words.
			if (subContentDetail.text instanceof Array){
				for (var inputKey in subContentDetail.text){
					var textItem = subContentDetail.text[inputKey]
					if (typeof textItem.textItem == "string"){
						var splitItem = textItem.textItem.split(" ")
						
						// Loop around and clear any /n and /t items.
						for (var inputWordKey in splitItem){
							var inputWordItem = splitItem[inputWordKey].trim()
							
							if (inputWordItem.length > 0 &&
								wordRegex.test(inputWordItem)){
								if (countObj[inputWordItem]== undefined){
									countObj[inputWordItem] = 0
								}
								countObj[inputWordItem]++;
							}
						}
					}
				}
				
			}
		}
		
		// Loop around and index the items into an array for 
		//	further sorting.
		var outputList = Array()
		for (var countKey in countObj){
			var countItem = countObj[countKey]
			// Include a label and count for the item.
			outputList.push({key:countKey,count:countItem})
		}
		// Sort the listing by word popularity now.
		outputList = outputList.sort((input1,input2)=>{
			if (input1.count>input2.count){
				return -1
			}else{
				return 1
			}
		})
		
		// Return a summary for the page item.
		return outputList
	}
	
}

// Top level overview stats summary for the data items.
class summaryForAllItemsOverview{
	
	constructor(subPath){
		// -------------------------------------------
		// Check to see if a default directory path is
		//	provided for the request action.
		// -------------------------------------------
		if (typeof this.directoryPath=="string"){
			this.directoryPath = directoryPath
		}else{
			this.directoryPath = "/"
		}
		
		
		this.wordCountAll = Array()
		this.linkSummary = this.listSummaryForAllItems()
		
	}
	async directoryItems(){
		var directoryList = await fs.readdirSync("./cacheData")
		if (directoryList instanceof Array){
			return directoryList
		}
		return null
	}
	// Fetch a vew high level overview for the data items.
	async listSummaryForAllItems(){
		var wordCountAll = Object()
		var summaryObj = Array()
		var dirList = await this.directoryItems()
		for (var dirKey in dirList){
			var summary = new 
				requestContentDetailForItem(dirList[dirKey],this.directoryPath)
			var listing = summary.listSummary
			
			var linkSummary = new 
				requestCachePageList(dirList[dirKey],"/")
			var linkSummary = await linkSummary.result
			
			// Loop around all the listing items for the result data.
			if (listing instanceof Array){
				for (var listKey in listing){
					var listItem = listing[listKey]
				
					if (wordCountAll[listItem.key]==undefined){
						wordCountAll[listItem.key] = 0
					}
					wordCountAll[listItem.key] += listItem.count
				}
			}
			
			
			// Number of words found, page link list length.
			var numberWords = listing.length
			var numberPages = linkSummary.pageList.length
			
			summaryObj.push({
				key:dirList[dirKey],
				numberPages,numberWords, })
		}
		
		var wordList = Array()
		for (var wordKey in wordCountAll){
			wordList.push(Array(wordKey,wordCountAll[wordKey] ))
		}
		wordList = wordList.sort((input1,input2)=>{
			if (input1[1] > input2[1]){
				return -1
			}
			return 1
		})
		this.wordCountAll = wordList
		
		return summaryObj
	}
	
}

module.exports = {
	requestCachePageList,
	requestContentDetailForItem,
	summaryForAllItemsOverview}