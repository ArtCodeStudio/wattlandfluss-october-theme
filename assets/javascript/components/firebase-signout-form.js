/**
 * firebase-signout-form
 */
rivets.components['firebase-signout-form'] = {

  template: function() {
    // return $('template#firebase-signout-form').html();
    return jumplink.templates['firebase-signout-form'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:firebase-signout-form');
    controller.debug('initialize', el, data);

    controller.user = data.user;
    
    controller.signinErrorMessage = null;
    
  
    controller.signOut = function(event, controller) {
        //  var $element = $(event.target);
        controller.debug('signOut', controller.user, data);
        
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
};
