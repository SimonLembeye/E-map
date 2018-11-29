/*
  ajouterBorne permet grace à une requete ajax d'ajouter une borne à notre base
  de donnée à partir des informations saisis par l'utilisateur dans ajouter_borne.js.
*/
function ajouterBorne(){
  // pour formater l'adresse, voir plus bas pour la définition de capitalizedString()
  var adr = capitalizedString($("#adresse").val());
  geocoding(adr, function(loc){
    var lat = loc.lat;
    var long = loc.lng;
    var type = $("#type").val();
    var etat = $("#etat").val();
    var prix = $("#prix").val();
    var statut = $("#statut").val();
    $.ajax({
        method: "post",
        url: url + "/resource.php?type=add_bornes",
        data: {
          latitude : lat,
          longitude : long,
          prix : prix,
          etat: etat,
          type : type,
          statut : statut,
          adresse: adr,
          access_token: localStorage.getItem("access_token")
    },
    success:function(data) {
      notif(data.success); // Message de success
      location.href='#mes_bornes'; // Redirection vers la page des bornes de l'utilisateur
    },
    error:function(data) {
      danger(data.error); // Message d'erreur
    }});
  });
}

/*
  findBornes() récupère l'ensemble des bornes de la BDD pour que celles ci puissent
  apparaitre sur la map, elle est utilisée dans map.js
*/
function findBornes(callback){
  $.ajax({
      method: "post",
      url: url + "/resource.php?type=find_bornes",
      data: {
        access_token: localStorage.getItem("access_token")
  },
  success:function(data) {
    callback(data);
  },
  error:function(data) {
    alert(data.error);
  }});
}

/*
  findTheBorne() permet d'obtenir les informations d'une borne à partir de son id,
  elle est utilisé pour faire apparaitre les infos concernant une borne sur la map,
  mais aussi lorsqu'il faut modifier une borne.
*/
function findTheBorne(id, callback){
  $.ajax({
      method: "post",
      url: url + "/resource.php?type=find_the_borne",
      data: {
        access_token: localStorage.getItem("access_token"),
        id: id
  },
  success:function(data) {
    callback(data[0]);
  },
  error:function(data) {
    alert(data.error);
  }});
}

/*
  mesBornes est similaire à findBornes() mais ne revoit que les bornes de l'utilisateur courant.
*/
function mesBornes(callback){
  $.ajax({
      method: "post",
      url: url + "/resource.php?type=mes_bornes",
      data: {
        access_token: localStorage.getItem("access_token")
  },
  success:function(data) {
    callback(data);
  },
  error:function(data) {
    alert(data.error);
  }});
}

/*
  preremplir_form() permet de remplir le formulaire de modification d'une borne,
  l'utilisateur n'a donc pas besoin de re-remplir toutes les informations.
*/
function preremplir_form(borne){
    $("#m_adresse").val(borne.adresse);
    $("#m_prix").val(borne.prix);
    $("#m_type").val(borne.type);
    $("#m_etat").val(borne.etat);
    $("#m_statut").val(borne.statut);
    $("#m_id").val(borne.id);
    var mes_bornes =  document.getElementById('mes_bornes');
    mes_bornes.style.display = 'none';
    var form_modif = document.getElementById('form_modif');
    form_modif.style.display = 'block';
}

/*
  La page mes_bornes.html contient un formulaire de modification caché en bas de page,
  il faut parfois le masquer, parfois le faire apparaitre,
  faire_apparaitre_mes_bornes() permet en partie ceci.
*/
function faire_apparaitre_mes_bornes(){
  var mes_bornes =  document.getElementById('mes_bornes');
  mes_bornes.style.display = 'block';
  var form_modif = document.getElementById('form_modif');
  form_modif.style.display = 'none';
}


/*
  modifierBorne() permet la modification d'une borne à partir des informations éntrées,
  dans le formulaire de modification.
*/
function modifierBorne(){
  var adr = capitalizedString($("#m_adresse").val());
  geocoding(adr, function(loc){
    var lat = loc.lat;
    var long = loc.lng;
    var id = $("#m_id").val();
    var type = $("#m_type").val();
    var etat = $("#m_etat").val();
    var prix = $("#m_prix").val();
    var statut = $("#m_statut").val();
    $.ajax({
        method: "post",
        url: url + "/resource.php?type=modifier_bornes",
        data: {
          id: id,
          latitude : lat,
          longitude : long,
          prix : prix,
          etat: etat,
          type : type,
          statut : statut,
          adresse: adr,
          access_token: localStorage.getItem("access_token")
    },
    success:function(data) {
      console.log(data);
      notif(data.success);
      location.href='#mes_bornes';
    },
    error:function(data) {
      danger(data.error);
    }});
  });
}

/*
  supprimer() permet la suppression d'une borne.
*/
function supprimer(id){
    alert("Etes vous sûr ?");
    $.ajax({
        method: "post",
        url: url + "/resource.php?type=supprimer_borne",
        data: {
          id: id,
          access_token: localStorage.getItem("access_token")
    },
    success:function(data) {
      console.log(data);
      var msg = data.success;
      location.href='#mes_bornes';
      location.reload();
      notif(msg);
    },
    error:function(data) {
      danger(data.error);
    }});
}


// capitalizedString() permet un formatage de l'adresse un peu plus agréable (premières lettres des mots en majuscule).
function capitalizedString(str){
  return str.split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

// change() modifie un aobjet borne, pour le rentre dijeste pour l'utilisateur.
function change(data){
  if (data.type==1) data.type="WPA";
  else if(data.type==2) data.type="CR45";
  else if(data.type==3) data.type="PlugEasy";
  else data.type="Non renseigné";

  if (data.prix==0) data.prix="Gratuit";
  else if(data.prix===null) data.prix="Non renseigné";

  if (data.statut==1) data.statut="Borne public";
  else if(data.type==2) data.statut="Borne privée";
  else data.statut="Non renseigné";

  if (data.etat==1) data.etat="Borne neuve";
  else if(data.etat==2) data.etat="Borne en très bon état";
  else if(data.etat==3) data.etat="Borne en bon état";
  else if(data.etat==4) data.etat="Borne passable";
  else if(data.etat==5) data.etat="Borne en mauvais état";
  else data.etat="Non renseigné";

  return data;
}
