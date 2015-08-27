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
  addMarker(map, googleLatAndLong, title, content);
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
    infoWindow.open(map);
  });
}

window.onload = showMap(40.7875090,-73.9529460)