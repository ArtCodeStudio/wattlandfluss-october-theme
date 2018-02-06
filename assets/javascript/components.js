// rivets.js components
// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.components = debug('theme:components');

/**
 * 
 */
rivets.components['firebase-user'] = {

  template: function() {
    return $('#firebase-user').html();
  },

  initialize: function(el, data) {
    window.jumplink.debug.components('[firebase-user] initialize', el, data);
    var controller = this;
    
    controller.user = null;
  
    
    firebase.auth().onAuthStateChanged(function(user) {
        controller.signinErrorMessage = null;
        if (user) {
            // User is signed in.
            window.jumplink.debug.components('[firebase-user] onAuthStateChanged signed in', user);
            controller.user = user;
            
        } else {
            // User is signed out.
            window.jumplink.debug.components('[firebase-user] onAuthStateChanged signed out');
            controller.user = null;
        }
    });
    

    return controller;
  }
}

/**
 * 
 */
rivets.components['firebase-signin-form'] = {

  template: function() {
    return $('#firebase-signin-form').html();
  },

  initialize: function(el, data) {
    window.jumplink.debug.components('[firebase-signin] initialize', el, data);
    var controller = this;

    controller.signinForm = {
        login: '',
        password: '',
    };
    
    controller.signinErrorMessage = null;
    
  
    controller.signin = function(event, controller) {
        //  var $element = $(event.target);
        window.jumplink.debug.components('[firebase-signin] signin', controller.signinForm);
        
        firebase.auth().signInWithEmailAndPassword(controller.signinForm.login, controller.signinForm.password)
        .then(function() {
             controller.signinErrorMessage = null;
        })
        .catch(function(error) {
          // Handle Errors here.
          window.jumplink.debug.components('[firebase-user] signin error', error);
          controller.signinErrorMessage = error.message;
        });
    };

    return controller;
  }
}

/**
 * 
 */
rivets.components['firebase-signout-form'] = {

  template: function() {
    return $('#firebase-signout-form').html();
  },

  initialize: function(el, data) {
    window.jumplink.debug.components('[firebase-signin] initialize', el, data);
    var controller = this;

    controller.user = data.user;
    
    controller.signinErrorMessage = null;
    
  
    controller.signout = function(event, controller) {
        //  var $element = $(event.target);
        window.jumplink.debug.components('[firebase-signout-form] signout', controller.user);
        
        firebase.auth().signOut().then(function() {
          controller.user = null;
          controller.signinErrorMessage = null;
        }).catch(function(error) {
          // An error happened.
          controller.signinErrorMessage = error.message;
        });

    };

    return controller;
  }
}