var map;

function showMap(lat,lng) {
  var googleLatAndLong = new google.maps.LatLng(lat,lng);
  var mapOptions = {
    zoom: 15,
    center: googleLatAndLong,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true
  };
  var mapDiv = document.getElementById("mapDiv");
  map = new google.maps.Map(mapDiv, mapOptions);
  var title = "Your Location";
  var content = "You are here!";
  getZipCode(googleLatAndLong);
}

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
}

//Get zip code from lat and long position. Displays best guess location on map.
function getZipCode(coords) {
    var infowindow = new google.maps.InfoWindow();
    var geocoder = new google.maps.Geocoder();
    var div = document.getElementById("location");

    //Ping Google geocode API with lat and long for reverse lookup
    geocoder.geocode({'latLng': coords}, function(results, status){
      if (status == google.maps.GeocoderStatus.OK){
        if (results[0]) {
          map.setZoom(15);
          //addMarker(map, coords, "home", results[0].formatted_address);

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
  var url = "http://opentable.herokuapp.com/api/restaurants?zip="+zipcode+"&callback=updateRestaurantList";
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

function updateRestaurantList(restaurants) {
  var restaurantDiv = document.getElementById("resultsList");
  if (restaurants.restaurants.length < 1) {
    return restaurantDiv.innerHTML = "<p>Sorry, no restaurants are using Open Table in your area. :(</p>"
  }
  for (var i = 0; i < restaurants.restaurants.length; i++) {
    var restaurant = restaurants.restaurants[i];
    //Add locations to list
    var li = document.createElement("li");
    li.setAttribute("class","restaurantItem");
    li.innerHTML = restaurant.name;
    restaurantDiv.appendChild(li);
    //Add locations to map
    var googleLatAndLong = new google.maps.LatLng(restaurant.lat,restaurant.lng);
    addMarker(map, googleLatAndLong, restaurant.name, restaurant.name);
  }
}

window.onload = showMap(40.7875090,-73.9529460)