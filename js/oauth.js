var url = '....'; // début de l'url utilisée pour toutes les requetes ajax
var client_id = '...';
var client_mdp = '...';

/*
  inscription() permet l'inscription d'un nouvel utilisateur dans la base de donnée.
  Sécurité avec oauth2.
*/
// A FAIRE : login lors de l'inscription !!
function inscription() {
    var log = $("#login").val();
    var password1 = $("#password").val();
    var password2 = $("#password-confirm").val();
    var nom = $("#nom").val();
    var prenom = $("#prenom").val();
    var email = $("#email").val();
    $.ajax({
        method: "post",
        url: url + "/inscription.php",
        data: {
            login: log,
            password1: password1,
            password2: password2,
            nom: nom,
            prenom: prenom,
            email: email
        },
        success: function (data) {
            if (data.success) {
                notif("Inscription réussie ! Bienvenue ;)");
                location.href='#';
                return true;
            }else {
              alert(data.error);
              danger(data.error);
            }
        },
        error: function (data) {
            console.log(data.error);
            danger(data.error);
            return false;
        }
    });
};

/*
  login() permet la connexion d'un utilisateur inscrit.
  Séculuté avec oauth2.
*/
function login(){
  var log = $("#login").val();
  var password1 = $("#password").val();
  if(localStorage.getItem("access_token") === null && localStorage.getItem("expires") ===null) {
    $.ajax({
      method: "post",
      url: url + "/token.php",
      xhrFields: {
        withCredentials:true
      },
      beforeSend:function(xhr) {
      // login + mdp pour se connecter à 'API
          xhr.setRequestHeader('Authorization','Basic '+ btoa(client_id +':'+ client_mdp));
      },
      data: {
        grant_type: "password",
        // login + mdp LDAP / ENEX (pas besoin de les stocker)
        username: log,
        password: password1
  },
  success:function(data) {
      notif("Connexion réussie");
      var expires = Math.floor(Date.now() / 1000);
      expires += data.expires_in;
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('expires', expires);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('username', log);
      location.href='#';
  },
  error:function(data) {
    danger(data.error);
  }});
}
}

function refresh_token() {
    var now = Math.floor(Date.now() / 1000);
    var refresh_expires = now + 2419200;
    var expires = localStorage.getItem("expires");
    // si le token a expiré mais pas le refresh_token (valide un mois), on rÃ©cupÃ¨re un token frais et un nouveau refresh_token

    if (now > expires && expires < refresh_expires) {
        $.ajax({
            method: "post",
            url: url + "/token.php",
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
              // login + mdp pour se connecter Ã  l'API
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ':' + client_mdp));
            },
            data: {
                grant_type: "refresh_token",
                refmapresh_token: localStorage.getItem("refresh_token")
            },
            success: function (data) {
                var new_expires = Math.floor(Date.now() / 1000);
                new_expires += data.expires_in;
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('expires', new_expires);
                localStorage.setItem('refresh_token', data.refresh_token);
            },
            error: function (data) {
                console.log(data);
            }
        });
    }
    // si le refresh_token a expirÃ©, on fait le mÃ©nage
    if (expires > refresh_expires) {
        // on supprime les token
        localStorage.removeItem('access_token');
        localStorage.removeItem('expires');
        localStorage.removeItem('refresh_token');
    }
}

/*
  logout() permet la déconexion d'un utilisateur
*/
function logout(){
  localStorage.removeItem('access_token');
  localStorage.removeItem('expires');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  notif("Vous êtes deconnecté");
  location.href='#login';
}

/*
  current_user() permet d'enregistrer sur la machine du client le nom de l'utilisateur connecté.
*/
function current_user(){
  refresh_token();
    $.ajax({
      method: "post",
      url: url + "/resource.php?type=current_user",
      data: {
        access_token: localStorage.getItem("access_token")
  },
  success:function(data) {
    localStorage.setItem('username', data.username);
  },
  error:function(data) {
    console.log(data);
    alert(data.error);
  }});
}

/*
  profil() permet via une requete ajax d'obtenir toute ls informations personelle de l'utilisateur connecté.
*/
function profil(callback){
  $.ajax({
      method: "post",
      url: url + "/resource.php?type=profil",
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
  changerMotDePasse() permet le changement de mot de passe d'un utilisateur.
*/
function changerMotDePasse() {
    var password = $("#password").val();
    var newPassword1 = $("#newPassword1").val();
    var newPassword2 = $("#newPassword2").val();

    $.ajax({
           method: "post",
           url: url + "/resource.php?type=changer_mot_de_passe",
           data: {
             password: password,
             newPassword1: newPassword1,
             newPassword2: newPassword2,
             access_token: localStorage.getItem("access_token")
           },
           success: function (data) {
             console.log(data);
             if (data.success) {
               notif("Modification réussie !");
               location.href='#profil';
               return true;
             }else {
               danger(data.error);
             }
           },
           error: function (data) {
             console.log(data);
             return false;
           }
         });
}

/*
  modifierProfil() permet à l'utilisateur de modifier ces infomations personelles.
*/
function modifierProfil() {
    var password = $("#password").val();
    var nom = $("#nom").val();
    var prenom = $("#prenom").val();
    var email = $("#email").val();
    var borne= $("#borne").val();

    $.ajax({
           method: "post",
           url: url + "/resource.php?type=modifier_profil",
           data: {
             password: password,
             nom: nom,
             prenom: prenom,
             email: email,
             borne: borne,
             access_token: localStorage.getItem("access_token")
           },
           success: function (data) {
             console.log(data);
             if (data.success) {
               notif("Modification réussie !");
               location.href='#profil';
               return true;
             }else {
               danger(data.error);
             }
           },
           error: function (data) {
             console.log(data);
             return false;
            }
         });
}
