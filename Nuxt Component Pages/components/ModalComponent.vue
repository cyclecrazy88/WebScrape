<template>
	<div class="modalSection">
		<div class="modalBackground" 
				v-on:click="closeModal"></div>
		<div class="modalContent">
			<div class="closeButton" 
				v-on:click="closeModal">
				<div>Close</div>
			</div>
		</div>
		<div class="showChartContent"></div>
	</div>
</template>
<script>
export default{
	props:["destination","searchColumn"],
	data(){
		return {
			detailData:null,
		}
	},
	methods:{
		requestContent:async function(targetLocation){
			var searchParms = new URLSearchParams(
			{index:this.searchColumn,
				subQuery:targetLocation})
			
			var itemContentData = 
			await fetch(	
				"http://localhost:3001/getItemContent?"+
								searchParms)
			var detailData = await itemContentData.json()
			this.detailData = detailData
			var thisRef = this
			this.$nextTick(()=>{
				thisRef.showChartContent(detailData)
			})
		},
		
		closeModal:function(){
			console.log("Close Modal")
			this.$emit("closeModal")
		},
		
		showChartContent(inputData){
			
			google.charts.load("current", 
				{packages:['corechart']});
			var thisRef2 = this
			var thisRef = this.$el
			var detailListing = this.detailData
			var rowListing = Array(Array("Key","Count"))
			if (this.detailData instanceof Array){
				for (var detailKey in inputData){
					var detailItem = inputData[detailKey]
					
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
				var data = 
					google.visualization.
						arrayToDataTable(rowListing)
				
				var options = {
					title: "Summary for word count for link ("+
							thisRef2.destination +") at ("+thisRef2.searchColumn+")",
					width: wordSummaryChart.offsetWidth - 10,
					height: wordSummaryChart.offsetHeight -10,
					bar: {groupWidth: "95%"},
					legend: { position: "none" },
					chartArea:{top:50,left:50,bottom:75, right:50}
				};
				var chart = new google.visualization.ColumnChart(wordSummaryChart);
				chart.draw(data, options);
			}
			var wordSummaryChart = this.$el.querySelector(".showChartContent")
			if (rowListing.length > 1 && wordSummaryChart != null){
				google.charts.setOnLoadCallback(displayChartContent);
			}
			
			
		}
	},
	mounted:function(){
		console.log("Load Modal..."+
			this.destination+ " "+
			this.searchColumn);
		
		var thisRef = this
		this.$watch("destination",(to,from)=>{
			console.log("To Value: ",to)
			thisRef.requestContent(to)
		})
	},
	// Run a request to fetch the content from
	//	the destination. (Well the load request).
	fetch:async function(){
		this.requestContent(this.destination)
	}
}
</script>