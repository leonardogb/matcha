module.exports = {
    isValidEmail: ( mail ) => {

        var error = [];
    
        if( mail.length == 0 || mail == "" )
          error.push("Le champ email est obligatoire");
        else { 
          if( !/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(mail) )
            error.push("Format adresse mail incorrect");
        }
        return ( (error.length > 0 ? error : true) );
      },
      isValidUsername: ( username ) => {
        var error = [];

        if( username.length == 0 || username == "" )
          error.push("Error : Username vide");
        else { 
          if( !/^[a-zA-Z0-9]+$/g.test(username) )
            error.push("Votre username peut avoir des chiffres et des lettres");
        }
        return ( (error.length > 0 ? error : true) );
      },
      isValidNom: ( nombre, apellido ) => {
        var error = [];

        if( nombre.length == 0 || nombre == "" || apellido.length == 0 || apellido == "" )
          error.push("Votre prénom et votre nom ne peuvent être vides");
        else { 
          if( !/^[a-zA-Z]+([ -][a-zA-Z]+)?$/g.test(nombre) || !/^[a-zA-Z]+([ -][a-zA-Z]+)?$/g.test(apellido))
            error.push("Votre prénom et nom peuvent avoir des lettres, un espace et un tiret");
        }
        return ( (error.length > 0 ? error : true) );
      },
      isValidPass: ( pass1, pass2 ) => {
        var error = [];

        if( pass1.length == 0 || pass1 == "" || pass2.length == 0 || pass2 == "" )
          error.push("Votre mot de passe ne peut pas être vide");
        else {
            if (pass1 != pass2)
                error.push("Le mot de confirmation n\'est pas valide");
            else
            {
                if( !/^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/g.test(pass1) )
                    error.push("Votre mot de passe doit avoir des chiffres et des lettres et au moins 8 caractères");
            }
          
        }
        return ( (error.length > 0 ? error : true) );
      },
      isValidUpdate: ( tab ) => {
        var error = [];

        if (tab.genre.length == 0 || tab.genre == "" || tab.age.length == 0 || tab.age == "" || tab.orientation.length == 0 || tab.orientation == "" || tab.ville.length == 0 || tab.ville == "" || tab.bio.length == 0 || tab.bio == "")
          error.push("Vous devez remplir tous les champs");
        else
        {
          console.log(tab.genre);
          if (tab.genre != "Masculin" && tab.genre != "Féminin")
            error.push("Le genre peut être Masculin ou Féminin");
          if (!/^([1][8-9]|[2-9][0-9]){1}$/g.test(tab.age))
            error.push("Votre age doit être comprise entre 18 et 99 ans");
          if (tab.orientation != "Bisexuel" && tab.orientation != "Homosexuel" && tab.orientation != "Hétérosexuel")
            error.push("L'orientation sexuelle peut être Bisexuel, Homosexuel ou Hétérosexuel");
          if (!/^[a-zA-Z]+([ -][a-zA-Z]+)*$/g.test(tab.ville))
            error.push("Le format de votre ville n\'est pas valide");
          if (/<(|\/|[^\/>][^>]+|\/[^>][^>]+)>/g.test(tab.bio))
            error.push("Vous ne pouvez pas utiliser des scripts");
          if (tab.bio.length > 200)
            error.push("Vous ne pouvez pas écrire plus de 200 caractères");
        }
        return ( (error.length > 0 ? error : true) );
      },
      isValidTag: (tag) => {
        var error = [];

        if (tag.length == 0 || tag == "")
          error.push("Le tag n\'est peut pas être vide");
        if (!/^[a-zA-Z0-9 ]+$/g.test(tag))
          error.push("Le format du tag n\'est pas valide");
        if (tag.length > 20 || tag.length < 0)
          error.push("Le tag doit avoir moins de 20 caractères");
        return ( (error.length > 0 ? error : true) );
      },
      isValidImg: (path) => {
        if (path.length == 0 || path == "")
          return (false);
        if (!/^\/img\/user\/[a-zA-Z0-9\-\_]+\/[a-zA-Z0-9\-\_]+\..{3}$|\/img\/no-img.png/g.test(path))
          return(false);
        return (true);
      }
}