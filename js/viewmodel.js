function Model() {

	var self = this;

	//Hardcoded list of locations
	self.locations = [
	{
		name: "Earl's Beer & Cheese",
		lat: 40.7873751,
		lng: -73.9516333,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-275-beer.png',
		venue_id: '4d1e8f8e5acaa35dfb7eb835'
	},{
		name: "Dough Loco",
		lat: 40.787898,
		lng: -73.9540978,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-273-cake.png',
		venue_id: '522b252c11d2e497993b82c3'
	},{
		name: "Cooper Hewitt Smithsonian Design Museum",
		lat: 40.7843958,
		lng: -73.9578732,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-90-building.png',
		venue_id: '4a2fc4d3f964a520da981fe3'
	},{
		name: "Central Park - Conservatory Garden Center Fountain",
		lat: 40.793778,
		lng:  -73.952454,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-311-flower.png',
		venue_id: '4d2b4592d86aa0907fa322c0'
	},{
		name: "ABV",
		lat: 40.786996,
		lng:  -73.950662,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-277-cutlery.png',
		venue_id: '4f0f2da5e4b01660de447b3b'
	},{
		name: "The Guthrie Inn",
		lat: 40.788202,
		lng: -73.951511,
		icon: 'lib/glyphicons_free/glyphicons/png/glyphicons-1-glass.png',
		venue_id: '4f90a240e4b0a9b8bc756c9d'
	}
	];

	//Set the home location coordinates to initialize the map here
	self.home = [40.7875090,-73.9529460];

	//Create an empty array to store a list of map markers
	self.markers = [];

	self.infoWindows = [];


}

var MODEL = new Model();

function ViewModel() {

    var self = this;

    //Variables to hold Foursquare API tokens
    var CLIENT_ID = "23ZBVKL12XL44XDMPUJZFHNY2ZHSQTNGCMOAFJ0HTHC1EG3S";
    var CLIENT_SECRET = "E3PEPIVQ4TAE00V5CGRGB3PEO2CS5TMH4YM14EKJN4L5BALN";

    //Set variable to track which map marker is currently selected
	var markerBouncing = null;

	//Set variable to track which infowindow is currently open
	var openInfoWindow = null;

	//Declare array for storing map marker content strings from FourSquare data
	var HTMLcontentString = '';
	self.contentStrings = [];

    /* Define observables here */

    //Observable for the search term
    self.searchTerm = ko.observable("");

    //Observable to show an error message if Foursquare resources fail to load
    self.showErrorMessage = ko.observable(false);

    //Take in the locations data object, put names into an array, push the names array into an observable array
    self.initResults = function(locations) {
	    self.initResultsList = [];
	    self.searchList = [];
	    for (i = 0; i < locations.length; i++) {
	    	var item = locations[i].name;
	    	self.initResultsList.push(item);
	    	//Create lower case version for case insensitive search
	    	self.searchList.push(item.toLowerCase());
	    }

	    //Create observable array to populate locations list view
	    self.results = ko.observableArray(self.initResultsList.slice(0));
	};

	//Initialize the list with hard-coded locations
	self.initResults(MODEL.locations);


	//Checks search query against all locations and filters the list and map markers if query is contained in any of the results
	self.updateListAndMap = function() {
		self.searchList.forEach(function (item, index, array) {
			if (item.indexOf(self.searchTerm().toLowerCase()) > -1) {
				//Empties the results and adds the result that matches the query
				self.results.removeAll();
				self.results.push(self.initResultsList[index]);
				//Loop through markers, hides the locations filtered out and sets the matched location marker to visible.
				for (var i = 0; i < MODEL.markers.length; i++) {
					MODEL.markers[i].setVisible(false);
				};
				MODEL.markers[index].setVisible(true);
			}
		})

			//If the filter input is empty, resets all locations to be visible
			if (self.searchTerm() === '') {
				self.results(self.initResultsList.slice(0));
				MODEL.markers.forEach(function (item, index, array) {
					if (!item.getVisible()) {
						item.setVisible(true);
					}
				});
			}

	}.bind(this);

	//Function to reset the search filter input box, list view, and markers
	self.clearSearch = function() {
		self.searchTerm('');
		if (openInfoWindow) openInfoWindow.close();
		if (markerBouncing) markerBouncing.setAnimation(null);
		self.updateListAndMap();
	};

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
	  MODEL.infoWindows.push(infoWindow);

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
		}

	  return marker;
	}

	//Find the marker that is currently selected in the model list of markers and toggles the infowindow
	self.selectMarkerFromList = function(currentlySelected) {
		for (var i = 0; i < MODEL.markers.length; i++) {
			if (currentlySelected == MODEL.markers[i].title) {
				toggleInfoWindow(i);
			}
		}
	}.bind(self);

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
	};

	//Set timer to show error message if FourSquare resources don't load after 8 seconds.
	self.timer = setTimeout(function() {
		self.showErrorMessage(true)
	}, 8000);

	//Make request to FourSquare API using JSONP.
	self.getLocationData = function(locations) {
	  for (var i=0; i<locations.length; i++) {
		  var url = "https://api.foursquare.com/v2/venues/"+locations[i].venue_id+"?client_id="+CLIENT_ID+"&client_secret="+CLIENT_SECRET+"&v=20150909&callback=ViewModel.callback";
		  var newScriptElement = document.createElement("script");
		  newScriptElement.setAttribute("src", url);
		  newScriptElement.setAttribute("id", "jsonp");
		  //Set onload attribute to check if resource loads. If onload fires, clear the timer
		  newScriptElement.setAttribute("onload", "clearTimeout(ViewModel.timer)");
		  var oldScriptElement = document.getElementById("jsonp");
		  var head = document.getElementsByTagName("head")[0];
		  if (oldScriptElement === null) {
		    head.appendChild(newScriptElement);
		  } else {
		    head.replaceChild(newScriptElement, oldScriptElement);
		  }
	  }
	};

	//Takes in the JSON response from the FourSquare API, constructs an HTML string, and sets it to the content of the relevant infoWindow
	self.callback = function(data) {
	  	MODEL.infoWindows.forEach(function (item, index, array) {
	  		if (item.content == data.response.venue.name) {
	  			HTMLcontentString = "<h4>"+data.response.venue.name+
	  								"</h4>"+"<p> FourSquare rating: <strong>"+
	  								data.response.venue.rating+
	  								"</strong><sup> / 10</sup></p><p><em>"+
	  								data.response.venue.categories[0].name+"</em></p>"+
	  								"<p>People checked-in now: <strong>"+data.response.venue.hereNow.count+
	  								"</strong></p>"+
	  								"<img src='"+data.response.venue.photos.groups[0].items[0].prefix+
	  								"150x150"+
	  								data.response.venue.photos.groups[0].items[0].suffix+
	  								"'</img>";
	  			item.setContent(HTMLcontentString);
	  		}
	  	});

	};

	//Make request to get FourSquare data
	self.getLocationData(MODEL.locations);

	//Initialize the map with a list of locations hardcoded in data model and foursquare data for marker window content
	self.initMap(MODEL.locations);


}

var ViewModel = new ViewModel();

ko.applyBindings(ViewModel);