/**
 * Component to list the events in a table for the backend
 */
rivets.components['firebase-calendars-table'] = {

  template: function() {
    // return $('template#firebase-calendars-table').html();
    return jumplink.templates['firebase-calendars-table'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:firebase-calendars-table');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var db = firebase.firestore();
    var dbCalendars = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('calendars');
    controller.calendars = [];

    var getCalendars = function() {
         dbCalendars.get()
        .then(function (querySnapshot) {
            controller.debug('calendars', controller.calendars, querySnapshot);
            controller.calendars = [];
            querySnapshot.forEach(function(doc) {
                var calendar = doc.data();
                calendar.id = doc.id;
                controller.calendars.push(calendar);
            });
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Kalender konnte nicht geladen werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    };
   
    
    controller.delete = function(event, controller) {
        var $this = $(event.target);
        var id = $this.data('id');
        controller.debug('delete', $this.data());
        
        dbCalendars.doc(id).delete()
        .then(function() {
            var message = 'Kalender erfolgreich gelöscht';
            controller.debug(message);
            getCalendars();
        }).catch(function(error) {
            var message = error.message;
            jumplink.utilities.showGlobalModal({
                title: 'Kalender konnte nicht gelöscht werden',
                body: error.message,
            });
            controller.debug(message, error);
        });
        
    };
    
    controller.edit = function(event, controller) {
        var $this = $(event.target);
        controller.debug('edit', $this.data());
        var id = $this.data('id');
        var href = $this.data('href').replace(':id', id);
        Barba.Pjax.goTo(href);
    };
    
    getCalendars();
    return controller;
  }
};