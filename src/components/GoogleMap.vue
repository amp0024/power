<template>  
   <div>
       <div id="map"></div>
   </div>
</template>
 
<script>  
import Vue from 'vue';
import {Loader, LoaderOptions} from 'google-maps';
 export default {
   props: {
     'latitude': {
       type: Number,
       default() {
         // return EventBus.sanfrancisco[0]
         return 40.07276
       }
     },
     'longitude': {
       type: Number,
       default() {
         // return EventBus.sanfrancisco[1]
         return -105.17287
       }
     },
     'zoom': {
       type: Number,
       default() {
         return 13
       }
     },
     'mobile':{
      type: Boolean,
      default(){
        return true
      }
     },
     map:{
     	type: Array,
     	default(){
     		return [
				]
     	}
     },
      display:{
        type: Object
      },
      size: {
        type: Number
      },
      locationDistance: {
        required: false
      },
      updateBounds: {

      },
      selectedSegment: {

      },
      averageSegmant: {

      }
   },
   mounted() {
    var that = this
    that.$markers = [];
	const loader = new Loader('AIzaSyBtgz114TP3HfAORu23of83ikmDuSEB_kc');
	var mapStyles = [
	    {
	        "featureType": "administrative.locality",
	        "elementType": "all",
	        "stylers": [
	            {
	                "hue": "#2c2e33"
	            },
	            {
	                "saturation": 7
	            },
	            {
	                "lightness": 19
	            },
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape",
	        "elementType": "all",
	        "stylers": [
	            {
	                "hue": "#EFF3F8"
	            },
	            {
	                "saturation": -100
	            },
	            {
	                "lightness": 100
	            },
	            {
	                "visibility": "simplified"
	            }
	        ]
	    },
	    {
	        "featureType": "poi",
	        "elementType": "all",
	        "stylers": [
	            {
	                "hue": "#EFF3F8"
	            },
	            {
	                "saturation": -100
	            },
	            {
	                "lightness": 100
	            },
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "road",
	        "elementType": "geometry",
	        "stylers": [
	            {
	                "hue": "#bbc0c4"
	            },
	            {
	                "saturation": -93
	            },
	            {
	                "lightness": 31
	            },
	            {
	                "visibility": "simplified"
	            }
	        ]
	    },
	    {
	        "featureType": "road",
	        "elementType": "labels",
	        "stylers": [
	            {
	                "hue": "#bbc0c4"
	            },
	            {
	                "saturation": -93
	            },
	            {
	                "lightness": 31
	            },
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "road.arterial",
	        "elementType": "labels",
	        "stylers": [
	            {
	                "hue": "#bbc0c4"
	            },
	            {
	                "saturation": -93
	            },
	            {
	                "lightness": -2
	            },
	            {
	                "visibility": "simplified"
	            }
	        ]
	    },
	    {
	        "featureType": "road.local",
	        "elementType": "geometry",
	        "stylers": [
	            {
	                "hue": "#e9ebed"
	            },
	            {
	                "saturation": -90
	            },
	            {
	                "lightness": -8
	            },
	            {
	                "visibility": "simplified"
	            }
	        ]
	    },
	    {
	        "featureType": "transit",
	        "elementType": "all",
	        "stylers": [
	            {
	                "hue": "#e9ebed"
	            },
	            {
	                "saturation": 10
	            },
	            {
	                "lightness": 69
	            },
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "water",
	        "elementType": "all",
	        "stylers": [
	            {
	                "hue": "#e9ebed"
	            },
	            {
	                "saturation": -78
	            },
	            {
	                "lightness": 67
	            },
	            {
	                "visibility": "simplified"
	            }
	        ]
	    }
	];
	loader.load().then(function (google) {
	    that.$map = new google.maps.Map(document.getElementById('map'), {
	        center: {lat: that.latitude, lng: that.longitude},
	        zoom: that.zoom,
	        maxZoom: 15 ,
	        styles: mapStyles,
	        fullscreenControl: false,
	        mapTypeControl: false,
	         backgroundColor: 'hsla(0, 0%, 0%, 0)',
	    });

	    that.clearMarkers();
  		that.buildMarkers();

	});
     
   },
   data(){
       return {
       	color: '#516DFF',
        locationServiceFilterActive: false,
        activeServiceFilters: [],
        locationTypeFilterActive: false,
        activeTypeFilters: [],
        markerCluster: null,
        distanceFilterActive: false,
        openInfoWindow: {},
        selectedPath: null,
        markers: []
       };
   },
   methods: {
      clearMarkers(){
        for( var i = 0; i < this.$markers.length; i++ ){
          this.$markers[i].setMap( null );
        }
      },
      buildMarkers(){
      	var that = this
      	var bounds = new google.maps.LatLngBounds();
     	var selected;
        var pathCoordinates = []
        for (var i = 0; i < this.map.length; i++) {
        	if (this.map[i].values.positionLat && this.map[i].values.positionLong){
  	          var position = new google.maps.LatLng(this.map[i].values.positionLat,this.map[i].values.positionLong);
            	bounds.extend(position);
        		pathCoordinates.push({
					lat : this.map[i].values.positionLat,
					lng : this.map[i].values.positionLong
				});
        	}
        }
		drawPath();
        function drawPath() {
			new google.maps.Polyline({
				path : pathCoordinates,
				geodesic : true,
				strokeColor : '#9fa5ae',
				strokeOpacity : 1,
				strokeWeight : 5,
				map: that.$map,
			});
		}
		var pathSelectedCoordinates = []
		if (that.selectedSegment.length === 0 && that.selectedPath){
			that.selectedPath.setMap(null)
			that.selectedPath = null
		}
		for (var i = 0; i < that.selectedSegment.length; i++) {
    	
        	if (that.selectedSegment[i].values.positionLat && that.selectedSegment[i].values.positionLong){

		      	pathSelectedCoordinates.push({
					lat : that.selectedSegment[i].values.positionLat,
					lng : that.selectedSegment[i].values.positionLong
				});
		    }
		}
		var selectedPath = null
      	that.selectedPath = new google.maps.Polyline({
			geodesic : true,
			strokeColor : '#516DFF',
			strokeOpacity : 1,
			strokeWeight : 5,
		});
      	that.selectedPath.setMap(that.$map);
		that.selectedPath.setPath(pathSelectedCoordinates);
        this.$map.fitBounds(bounds);
      },


    },
    watch: {
      map(){
        this.clearMarkers();
        this.buildMarkers();
      },
      updateBounds(){
        this.$map.fitBounds(this.bounds);
      },
      selectedSegment(){
      	this.clearMarkers();
      	this.buildMarkers();
      }
    }
 }
</script>  