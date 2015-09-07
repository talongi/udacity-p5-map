function Model() {

	var self = this;

	//Hardcoded list of locations
	self.locations = [
	{
		name: "Earl's Beer + Cheese",
		lat: 40.7873751,
		lng: -73.9516333,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-275-beer.png'
	},{
		name: "Dough Loco",
		lat: 40.787898,
		lng: -73.9540978,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-273-cake.png'
	},{
		name: "Cooper Hewitt Smithsonian Design Museum",
		lat: 40.7843958,
		lng: -73.9578732,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-90-building.png'
	},{
		name: "Conservatory Garden",
		lat: 40.793778,
		lng:  -73.952454,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-311-flower.png'
	},{
		name: "ABV",
		lat: 40.786996,
		lng:  -73.950662,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-277-cutlery.png'
	}
	];

	//Set the home location coordinates to initialize the map here
	self.home = [40.7875090,-73.9529460];

	//Create an empty array to store a list of map markers
	self.markers = [];


}

var MODEL = new Model();

function ViewModel() {

    var self = this;

    //Set variable to track which map marker is currently selected
	var markerBouncing = null;

	//Set variable to track which infowindow is currently open
	var openInfoWindow = null;

    /* Define observables here */

    //Observable for the search term
    self.searchTerm = ko.observable("");

    //Observable to track what location is currently selected in the list view, nothing selected by default
    self.selectedLocations = ko.observableArray();

    //Take in the locations data object, put names into an array, push the names array into an observable array
    self.initResults = function(locations) {
	    self.initResultsList = [];
	    self.searchList = [];
	    for (i = 0; i < locations.length; i++) {
	    	var item = locations[i].name;
	    	self.initResultsList.push(item);
	    	//Create lower case version for case insensitive search
	    	self.searchList.push(item.toLowerCase());
	    };

	    //Create observable array to populate locations list view
	    self.results = ko.observableArray(self.initResultsList.slice(0));
	}

	self.initResults(MODEL.locations);

	self.updateListAndMap = function() {
		if (self.searchList.indexOf(self.searchTerm().toLowerCase()) > -1) {
			self.results.removeAll();
			self.results.push(self.initResultsList[self.searchList.indexOf(self.searchTerm().toLowerCase())]);
			MODEL.markers.forEach(function (item, index, array) {
				if (index != self.searchList.indexOf(self.searchTerm().toLowerCase())) {
					item.setVisible(false);
				};
			});
		} else if (self.searchList.indexOf(self.searchTerm().toLowerCase()) == -1) {
			self.results(self.initResultsList.slice(0));
			MODEL.markers.forEach(function (item, index, array) {
				if (!item.getVisible()) {
					item.setVisible(true);
				};
			});
		};
	}.bind(this);

    /* Define and use Google Map objects here */

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

	//Set the starting coordinates to the home location in the data model
    self.latlng = new google.maps.LatLng(MODEL.home[0],MODEL.home[1]);

	//Intialize the map using the home location Google maps latlan object
	self.map = showMap(self.latlng);

	//This function is used to create new map markers
	function addMarker(map, latlong, title, content, icon) {
	  var markerOptions = {
	    position: latlong,
	    map: map,
	    title: title,
	    animation: google.maps.Animation.DROP,
	    clickable: true,
	    icon: icon
	  };

	  var marker = new google.maps.Marker(markerOptions);
	  marker.addListener('click', toggleBounce);

	  var infoWindowOptions = {
	    content: content,
	    position: latlong
	  };

	  var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

	  google.maps.event.addListener(marker, "click", function() {
	    if (openInfoWindow) openInfoWindow.close();
	    openInfoWindow = infoWindow;
	    infoWindow.open(map, marker);
	  });

		 //Function to toggle the bounce anitmation of marker on click

		function toggleBounce() {
		  if (markerBouncing) {
		    markerBouncing.setAnimation(null);
		  }
		  if (markerBouncing != marker) {
		  	marker.setAnimation(google.maps.Animation.BOUNCE);
		  	markerBouncing = marker;
		  } else {
		    markerBouncing = null;
		  }
		};

	  return marker;
	}

	//Find the marker that is currently selected in the model list of markers and toggles the infowindow
	self.selectMarkerFromList = function() {
		var currentlySelected = self.selectedLocations()[0];
		for (var i = 0; i < MODEL.markers.length; i++) {
			if (currentlySelected == MODEL.markers[i].title) {
				toggleInfoWindow(i);
			};
		};
	}

	//Function to the toggle the infowindow of a specific marker
	function toggleInfoWindow(id) {
		google.maps.event.trigger(MODEL.markers[id], 'click');
	}

    /* Create other functions to communicate with Model, Observables, and APIs */


	self.initMap = function(data) {
	  for (var i = 0; i < data.length; i++) {
	    var location = data[i];
	    var googleLatAndLong = new google.maps.LatLng(location.lat,location.lng);
	    var windowContent = location.name;
	    //Create and add markers to map
	    var marker = addMarker(self.map, googleLatAndLong, location.name, windowContent, location.icon);
	    //Add marker to data model
	    MODEL.markers.push(marker);
	  }
	}

	//Initialize the map with a list of locations hardcoded in data model
	self.initMap(MODEL.locations);

	//Function to clear the search filter input box
	self.clearSearch = function() {
		self.searchTerm('');
		if (openInfoWindow) openInfoWindow.close();
		if (markerBouncing) markerBouncing.setAnimation(null);
		self.updateListAndMap();
	}

}

var ViewModel = new ViewModel();



ko.applyBindings(ViewModel);