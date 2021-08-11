<template>
	<div>
		<div class="homeContentSection">
			WebPage - Scrape - Dashboard Overview
		</div>
	
		<div class="addItemSection">
			<div>Add Item URL:</div>
			<div>
				<input type="text" 
					class="addItemInput"
					placeholder="Request URI">
				</div>
			<div>
				<a class="waves-effect waves-light btn"
					v-on:click="addWebsiteAction">Add</a>
			</div>
		</div>
		
		<!-- Available Clickable User Items -->
		<div class="availableItemsSection">
			<div class="itemHeading">
				Available Link Items
			</div>
			<div class="linkItem"
				v-for="linkItem in availableLinks">
					<NuxtLink 
						v-bind:to="linkItem.index">{{linkItem.key}}</NuxtLink>
					
			</div>
		</div>
		
		<!-- Site Summary - Site Contents Etc -->
		<div class="linkSummarySection">
			<div class="itemHeading">
				Summary for the links available - counts of the links for the activity
					based on a given website.
			</div>
			<div class="summaryItemHeading">
				<div>Index Name</div>
				<div>Page Count</div>
				<div>Word Count</div>
			</div>
			
			<div class="summaryItem"
				v-for="summary in linkSummary">
					<div>{{summary.key}}</div>
					<div>{{summary.numberPages}}</div>
					<div>{{summary.numberWords}}</div>
					
			</div>
		</div>
		
		<!-- Word Summary Section -->
		<div class="overallWordSection">
			<div class="itemHeading">
				Top Level Word Summary - Overview Stats for the sampled websites,
				from which the font pages were sampled.
			</div>
			
			<div class="summaryItemHeading">
				<div>Word</div>
				<div>Count</div>
			</div>
			
			<div class="summaryItem"
				v-for="wordItem in wordCountAll">
				<div>{{wordItem[0]}}</div>
				<div>{{wordItem[1]}}</div>
				
			</div>
		</div>
		<div class="chartBottomSection"></div>
		
	</div>
	
	
	
</template>
<script>
export default {
	data(){
		return{
			availableLinks:[],
			linkSummary:[],
			linkExample:"https://example.com/",
			wordCountAll:[],
			
		}
	},
	methods:{
		addWebsiteAction:async function(eventData){
			console.log("Add Website")
			var inputItemText =
				document.querySelector(".addItemInput").value
				
			var itemTextFormat =
				inputItemText.
					replace("https://","").
					replace("http://","").
					replace(".","_").split("/")[0]
					
			var querySelector = {
				host:itemTextFormat,
				url:inputItemText,
			}
			
			var searchParms =
				new URLSearchParams(querySelector).toString()
			if (searchParms.length > 0){
				var webRequest = await fetch(
					"http://localhost:3001/requestContentForSite?"+
					searchParms)
					
				var updateResponse = await webRequest.json();
				if (updateResponse instanceof Object){
					// Once this has done - Request a reload of the
					//	main page so any of the corresponding links,
					//	can be updated as required.
					try{
						var homePageData = 
							await fetch(
								"http://localhost:3001/getHomeItems")
						var linkData = await homePageData.json()
						
						var linkListing = Array()
						for (var linkKey in linkData.availableLinks){
							var linkItem = linkData.availableLinks[linkKey]
							if (typeof linkItem == "string"){
								var searchObj = {key:linkItem,
								index:"detail?content="+encodeURI(linkItem)}
								linkListing.push(searchObj)
							}
						}
						
						this.availableLinks = linkListing
						this.linkSummary = linkData.linkSummary
						this.wordCountAll = linkData.wordCountAll
					
						this.$forceUpdate();
					}catch(ex){
						this.$forceUpdate();
					}
					
					
				}
			} 
		},
		// --------------------------------------------------------------
		// Check if the word summary chart is an array. So a chart can be 
		// formatted and displayed for the item.
		// --------------------------------------------------------------
		showSummaryChart(){
			var arrayList = Array(Array("Word","Count"))
			// Loop around the results for the word count, with a view
			//	to displaying a chart with result info
			if (this.wordCountAll instanceof Array){
				var countNumber =0
				for (var countKey in this.wordCountAll){
					var countItem = this.wordCountAll[countKey]
					
					if (countItem[0].length < 6){continue;}
					
					// If the count is greater than 30 stop here.
					if (countNumber > 30){break;}

					arrayList.push(Array(countItem[0],countItem[1]))

					countNumber++
				}
			}
			
			function displayChartContent(){
				var data = google.visualization.arrayToDataTable(arrayList)
				
				var options = {
					title: "Summary for word count data items.",
					width: wordSummaryChart.offsetWidth - 10,
					height: wordSummaryChart.offsetHeight -10,
					bar: {groupWidth: "95%"},
					legend: { position: "none" },
					chartArea:{top:50,left:50,bottom:75, right:50}
				};
				var chart = new google.visualization.ColumnChart(wordSummaryChart);
				chart.draw(data, options);
			}
			var wordSummaryChart = 
					this.$el.querySelector(".chartBottomSection")
			if (arrayList.length > 1 && wordSummaryChart != null){
				google.charts.setOnLoadCallback(displayChartContent);
			}
		}
	},
	
	mounted:function(eventData){
		var elItem = this.$el
		console.log("Render Update...");
	},
	
	async fetch(){
		console.log("Load Home Page")
		google.charts.load("current", {packages:['corechart']});
		
		
		var homePageData = 
			await fetch("http://localhost:3001/getHomeItems")
		var linkData = await homePageData.json()
		
		var linkListing = Array()
		for (var linkKey in linkData.availableLinks){
			var linkItem = linkData.availableLinks[linkKey]
			if (typeof linkItem == "string"){
				var searchObj = {key:linkItem,
					index:"detail?content="+encodeURI(linkItem)}
				linkListing.push(searchObj)
			}
		}
		
		this.availableLinks = linkListing
		this.linkSummary = linkData.linkSummary
		this.wordCountAll = linkData.wordCountAll
		console.log("Home Content: "+JSON.stringify(linkData))
		
		this.showSummaryChart()
	}
	
}
</script>