<template>
	<div client-only>
	
		<div class="showDetailSummary">Show Detail For The Website: {{detailDesc}}</div>
	
		<div class="wordSummaryChart">
		
		</div>
	
		<div class="detailPageSummary">
			<div class="summaryWord summaryHeading">
				<div>Word</div>
				<div>Count</div>
			</div>
		
			<div class="summaryWord" 
				v-for="summaryItem in detailData"
				v-if="summaryItem.count > countMin">
				<div>{{summaryItem.key}}</div>
				<div>{{summaryItem.count}}</div>
			</div>
		</div>
		
		<div class="linkPageSummary">
			<div class="linkWord summaryHeading">
				<div>Link</div>
			</div>
			<div class="linkItem" 
				v-on:click="selectItemLink"
				v-bind:linkPage="linkPage"
				v-for="linkPage in linkPages">
				{{linkPage}}
			</div>
		</div>
		
		<client-only>
			<ModalComponent 
				v-if="showModal"
				v-on:closeModal="closeModal"
				v-bind:searchColumn="searchColumn"
				v-bind:destination="modalLink"/>
		</client-only>
		
	</div>
	
</template>
<script>
export default{
	data() {
		return {
			detailData: [],
			linkSummary:[],
			linkPages:[],
			outputPageLinks:[],
			countMin:3,
			detailDesc:"",
			modalLink:null,
			searchColumn:null,
			showModal:false,
		}	
	},
	methods:{
		selectItemLink(eventData){
			// Update the link item, with the destination value,
			//	for the linkPage item.
			if (eventData instanceof Object &&
				eventData.currentTarget instanceof Object){
				this.modalLink = 
					eventData.currentTarget.getAttribute("linkPage")
				this.showModal = true;
			}
		},
		
		closeModal:function(){
			this.showModal = false;
		},
		
		
		
		displayContentCharts:async function(inputData){
			google.charts.load("current", {packages:['corechart']});
			
			await this.$nextTick();
			var thisRef = this.$el
			var detailListing = this.detailData
			var rowListing = Array(Array("Key","Count"))
			if (this.detailData instanceof Array){
				for (var detailKey in this.detailData){
					var detailItem = this.detailData[detailKey]
					
					if (detailItem.key.length < 5){
						continue;
					}
					
					var countItem = Array(detailItem.key,detailItem.count)
					rowListing.push(countItem)
					// Just display the top 20 items.
					if (rowListing.length > 50){
						break;
					}
				}
			}
			
			function displayChartContent(){
				var data = google.visualization.arrayToDataTable(rowListing)
				
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
			
			var wordSummaryChart = this.$el.querySelector(".wordSummaryChart")
			if (rowListing.length > 1 && wordSummaryChart != null){
				google.charts.setOnLoadCallback(displayChartContent);
			}
		}
		
	},
	// On initial load boot up the component.
	mounted:function(){
		var searchParms = new URLSearchParams(
			window.location.search.split("?")[1])
			// Fetch the requested content - requested as part of the page initialization.
		var searchColumn = searchParms.get("content")
		
		this.searchColumn = searchColumn
		this.$forceUpdate();
	},
	
	fetch:async function(){
		console.log("Load Window")
		console.log(window)
		// -----------------------------------------------------
		// Initialize and load the detail for the search parms -
		//	details about the keywords, then after this run a 
		//	search for the link information.
		// -----------------------------------------------------
		var searchParms = new URLSearchParams(
			window.location.search.split("?")[1])
			// Fetch the requested content - requested as part of the page initialization.
		var searchColumn = searchParms.get("content")
		this.detailDesc = searchColumn
		
		var searchParms = new URLSearchParams(
			{index:searchColumn,subQuery:"/"})
		
		var itemContentData = 
			await fetch("http://localhost:3001/getItemContent?"+
							searchParms)
		var detailData = await itemContentData.json()
		this.detailData = detailData
		
		
		// Now request the link information for the request data,
		//	run a summary for the link items.
		var itemContentData = 
			await fetch("http://localhost:3001/getCacheWebLinks?"+
							searchParms)
		var linkSummary = await itemContentData.json()
		
		// Store the link information.
		this.linkSummary = linkSummary
		// Link list for the available page links.
		this.linkPages = linkSummary.pageList
		// 	Detail summary item for each set of links.
		this.outputPageLinks = linkSummary.outputPageLinks
		
		var displayElement = this.$el
		if (displayElement instanceof Object){
			this.displayContentCharts(detailData)
		}
		
		return detailData
	},
	
	
}
</script>