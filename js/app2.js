document.addEventListener("deviceready", init, false); // à supprimer ??

function init() { // à supprimer ??
    console.log("Device is ready !");
}

/*
  Les fonctions notif et danger permettent de faire appraitre des
  petites bulles de couleur pour informer l'utilisateur (confirmer la connection,
  la création d'une borne ...). Le texte est inseré dans une div(id=notifications)
  présente dans index.html
*/
function notif(str){
  $("#notification").html(`<p class="alert alert-success">${str}</p>`);
  setTimeout(function(){
    $("#notification").html("");
  }, 5000);
}

function danger(str){
  $("#notification").html(`<p class="alert alert-danger">${str}</p>`);
  setTimeout(function(){
    $("#notification").html("");
  }, 5000);
}


// Ces trois lignes permettent de refermer le menu lorsque l'utilisateur clique sur un des liens du menu.
$("#menu a").click(function(){
  $("#check").click();
});


$( document ).ready(function() {
  $(window).on('hashchange', route);
    // Variable
    var username = { // à supprimer ?
      "username": localStorage.getItem("username")
    };

      // La
      function route() {
          var page, hash = window.location.hash;
          switch (hash) {
              case "#login":
                  $.get("template/login.html", function(templates) {
                      var page = $(templates).html();
                      $("#container").html(page);
                  }, "html");
                  break;

              case "#inscription":
                  $.get("template/inscription.html", function(templates) {
                      var page = $(templates).html();
                      $("#container").html(page);
                  }, "html");
                  break;

              case "#ajouterborne":
                  $.get("template/ajouter_borne.html", function(templates) {
                      var page = $(templates).html();
                      $("#container").html(page);
                  }, "html");
                  break;

              case "#modifier_profil":
                  $.get("template/modifier_profil.html", function(templates) {
                      var page = $(templates).html();
                      $("#container").html(page);
                  }, "html");
                  break;

              case "#changer_mot_de_passe":
                  $.get("template/changer_mot_de_passe.html", function(templates) {
                      var page = $(templates).html();
                      $("#container").html(page);
                  }, "html");
                  break;

              case "#apropos":
                  $.get("template/apropos.html", function(templates) {
                      var page = $(templates).html();
                      $("#container").html(page);
                  }, "html");
                  break;


              case "#mes_bornes":
                  mesBornes(function(mesbornes){ // La fonction mesBornes est definie dans borne.js
                    $.get("template/mes_bornes.html", function(templates) {
                      var nombre_de_borne = mesbornes.length;
                      var page = $(templates).html();
                      var privees = mesbornes.filter((borne) => borne);
                      mesbornes.map((borne) => change(borne));
                      page = Mustache.render(page, mesbornes);
                      $("#container").html(page);
                      var mes_bornes = document.getElementById('mes_bornes');
                      mes_bornes ? mes_bornes.style.display = 'block' : null;
                      var form_modif = document.getElementById('form_modif');
                      form_modif ? form_modif.style.display = 'none' : null;
                    }, "html");
                  });
                  break;

              case "#profil": // La fonction profil est définie dans oauth.js
                  profil(function(user){
                    $.get("template/profil.html", function(templates) {
                        var page = $(templates).html();
                        page = Mustache.render(page, user[0]);
                        $("#container").html(page);
                    }, "html");
                  });
                  break;

              default: // Il y a 2 page d'acceuil, home.html si on n'est pas connecté et map.html sinon
                if(localStorage.getItem("username") === null){
                    $.get("template/home.html", function(templates) {
                        var page = $(templates).html();
                        $("#container").html(page);
                    }, "html");
                    break;
                  } else {
                    $.get("template/map.html", function(templates) {
                        var page = $(templates).html();
                        page = Mustache.render(page, username);
                        $("#container").html(page);
                    }, "html");
                    loadMap();
                    break;
                  }
          }
      }

      route();
});
