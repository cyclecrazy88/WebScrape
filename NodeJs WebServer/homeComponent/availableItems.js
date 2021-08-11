const fs = require("fs")

class AvailableItems{
	
	constructor(){
		this.result = this.directoryItems()
		
	}
	
	async directoryItems(){
		var directoryList = await fs.readdirSync("./cacheData")
		if (directoryList instanceof Array){
			return directoryList
		}
		return null
	}
}
module.exports = AvailableItems
//new AvailableItems();

