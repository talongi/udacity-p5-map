function Model() {

	var self = this;
	//Define stuff to hold information

	//Set the home location coordinates to initialize the map here
	self.home = [40.7875090,-73.9529460];

	//Create an empty array to store a list of map markers
	self.markers = [];


}

var MODEL = new Model();

function ViewModel() {

    var self = this;

    /* Define observables here */
    self.searchTerm = ko.observable("Enter places here!");

     self.updateResults = function(){
    	ko.computed(function(){
    		console.log("computed");
    	}, self);
    }

    /* Define and use Google Map objects here */

    self.latlng = new google.maps.LatLng(MODEL.home[0],MODEL.home[1]);

    //This function takes in coordinates, converts coordinates to a google map lat and long object, sets the map options, creates a map object, and displays the map in a div on the page.
	function showMap(latlng) {
	  var googleLatAndLong = latlng;

	  var mapOptions = {
	    zoom: 15,
	    center: googleLatAndLong,
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    disableDefaultUI: true
	  };

	  var mapDiv = document.getElementById("mapDiv");
	  var map = new google.maps.Map(mapDiv, mapOptions);
	  return map;
	}

	self.map = showMap(self.latlng);

	//This function is used to create new map markers
	function addMarker(map, latlong, title, content) {
	  var markerOptions = {
	    position: latlong,
	    map: map,
	    title: title,
	    clickable: true
	  };

	  var marker = new google.maps.Marker(markerOptions);

	  var infoWindowOptions = {
	    content: content,
	    position: latlong
	  };

	  var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

	  google.maps.event.addListener(marker, "click", function() {
	    infoWindow.open(map, marker);
	  });

	  return marker;
	}

    /* Create other functions to communicate with Model, Observables, and APIs */

 	//Function to get zipcode for call to 3rd party OpenTable API
    function getZipCode(coords) {

	    var geocoder = new google.maps.Geocoder();
	    //Ping Google geocode API with lat and long for reverse lookup
	    geocoder.geocode({'latLng': coords}, function(results, status){
	      if (status == google.maps.GeocoderStatus.OK){
	        if (results[0]) {

	          //Look for zip code in results array
	          var zip = '';
	          for (var i=0, len=results[0].address_components.length; i<len; i++) {
	            var ac = results[0].address_components[i];
	            if (ac.types.indexOf('postal_code') >= 0) zip = ac.long_name;
	          }
	          if (zip != '') {
	            getRestaurantsNearby(zip);
	          }
	        }
	      } else {
	        alert("Geocoder failed due to: " + status);
	      	}
	    });
	}


	function getRestaurantsNearby(zipcode) {
	  var url = "http://opentable.herokuapp.com/api/restaurants?zip="+zipcode+"&callback=ViewModel.updateRestaurantList";
	  var newScriptElement = document.createElement("script");
	  newScriptElement.setAttribute("src", url);
	  newScriptElement.setAttribute("id", "jsonp");
	  var oldScriptElement = document.getElementById("jsonp");
	  var head = document.getElementsByTagName("head")[0];
	  if (oldScriptElement == null) {
	    head.appendChild(newScriptElement);
	  } else {
	    head.replaceChild(newScriptElement, oldScriptElement);
	  }

	}

	self.updateRestaurantList = function(restaurants) {
	  if (restaurants.restaurants.length < 1) {
	    return alert("Sorry, no restaurants are using Open Table in your area. :(");
	  }
	  for (var i = 0; i < restaurants.restaurants.length; i++) {
	    var restaurant = restaurants.restaurants[i];
	    var googleLatAndLong = new google.maps.LatLng(restaurant.lat,restaurant.lng);
	    //Add markers to list
	    var marker = addMarker(self.map, googleLatAndLong, restaurant.name, restaurant.name);
	    MODEL.markers.push(marker);
	    console.log(MODEL.markers);
	  }
	}

	getZipCode(self.latlng);

}

var ViewModel = new ViewModel();

ko.applyBindings(ViewModel);