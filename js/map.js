// La fonction loadMap() est appelée avec le template map.html
function loadMap(){
  $( document ).ready(function() {
    currentLocation(function(loc){

      // On commence par définir la map ainsi que quelques une de ses options
      var mymap = L.map('mapid', {
        attributionControl: true,
        zoomControl: true,
        dragging: true,
        boxZoom: true
      }).setView([loc.lat, loc.long], 13);

      // On y ajoute le layer de mapbox
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=???accesstokenmapbox', {
        attribution: 'Jules&Simon',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: '???accesstokenmapbox'
      }).addTo(mymap);

      /*
        selected represente la derniere borne sur laquelle l'utilisateur a cliqué,
        avoir cette information nous permet de faire apparaitre un pointeur rouge sur cette borne,
        alors que les autres bornes sont vertes.
      */
      var selected;

      // Chacune des bornes récuperées dans la BDD sont marquées sur la map.
      findBornes(function(bornes){
        bornes.forEach(function(borne){
          mark = L.marker([borne.latitude, borne.longitude],{
            title: borne.id,
            icon: greenIcon
          }).on('click', markerOnClick).addTo(mymap); // markerOnClick est définie ci dessous.
          selected = borne;
        });
      });

      /*
        markerOnClick() assure l'interactivité des des markers des bornes,
        d'abord leurs changement de couleur, mais aussi l'apparition
        des infomations sur la borne concernée sur la partie basse de l'écran.
      */
      function markerOnClick(e) {
        findTheBorne(parseInt(this.options.title, 10), function(borne){
          couleur(selected, "green", mymap, markerOnClick); // la fonction couleur est definie plus bas
          selected = borne;
          couleur(selected, "red", mymap, markerOnClick); // idem
          var borne_up = change(borne);
          var element = document.getElementById('borne-map');
          $('#borne-map').html(
            `<div class="card card-body text-white bg-danger">
              <h5 class="card-title">${borne_up.adresse}  <a href="http://maps.google.fr/maps?f=q&hl=fr&q=${borne_up.adresse}" class="btn btn-success btn-sm">GO !</a></h5>
              <div class="list-group">
              <p>Type : ${borne_up.type}<br />
                 Prix : ${borne_up.prix} <i>(en €/kWh)</i><br />
                 ${borne_up.statut}<br />
                 ${borne_up.etat}</p>
            </div>
          </div>`
             );
          element.style.display = 'block';
        });

      }
    });
  });
}

/*
  currentLocation() permet d'obtenir la position de l'utilisateur.
*/
function currentLocation(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((function (position) {
                var loc = {
                  "lat" : position.coords.latitude,
                  "long" : position.coords.longitude
                }
                return callback(loc);
            }));
        } else {
            alert("La géolocalisation n'est pas supportée par ce navigateur.");
        }
}

/*
  Les deux fonctions reverse_geocoding() et geocoding() permettent de faire l'equivalence entre
  les coordonnees (latitude et longitude) et de l'adresse. Elle utilisent pour cela l'API mapquestapi.com.
*/
function reverse_geocoding(loc, callback){
  var lat = loc.lat;
  var long = loc.long;
  $.ajax({
    method: "get",
    url: "http://www.mapquestapi.com/geocoding/v1/reverse?key=???keymapquestAPI&location="+ lat + "," + long + "&includeRoadMetadata=true&includeNearestIntersection=true",
    success:function(data) {
      return callback(data.results[0].locations[0]);
    },
    error:function(data) {
      alert(data.error);
  }});
}

function geocoding(adresse, callback){
  $.ajax({
    method: "get",
    url: "http://www.mapquestapi.com/geocoding/v1/address?key=???keymapquestAPI&location=" + adresse,
    success:function(data) {
      return callback(data.results[0].locations[0].latLng);
    },
    error:function(data) {
      alert(data.error);
  }});
}

/*
  Grâce à geocoding() et currentLocation, proposer_adresse() suggere une addresse à l'utilisateur
  en fonction de sa position losrque celui-ci clique sur le bouton ma position
  dans le formulaire de ajouter_borne.html.
*/
function proposer_adresse(){
  currentLocation(function(loc){
    reverse_geocoding(loc, function(adresse){
      var adresse_a_afficher = adresse.street + ", " + adresse.adminArea5 + ", " + adresse.adminArea3 + ", " + adresse.adminArea1;
      $("#adresse").val(adresse_a_afficher);
    });
  });
}

// couleur() permet le changement de couleur du marker de la borne concerné.
function couleur(borne, couleur, mymap, markerOnClick){
  if(couleur === "red"){
    mark = L.marker([borne.latitude, borne.longitude],{
      title: borne.id,
      icon: redIcon
    }).on('click', markerOnClick).addTo(mymap);
  } else {
    mark = L.marker([borne.latitude, borne.longitude],{
      title: borne.id,
      icon: greenIcon
    }).on('click', markerOnClick).addTo(mymap);
  }
}

// marker vert
var greenIcon = new L.Icon({
	iconUrl: 'img/marker-icon-green.png',
	shadowUrl: 'img/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

// marker rouge
var redIcon = new L.Icon({
	iconUrl: 'img/marker-icon-red.png',
	shadowUrl: 'img/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});
