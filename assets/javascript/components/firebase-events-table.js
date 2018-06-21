/**
 * Component to list the events in a table for the backend
 */
rivets.components['firebase-events-table'] = {

  template: function() {
    return jumplink.templates['firebase-events-table'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-event-table');
    controller.debug('initialize', el, data);
    var $el = $(el);
    var db = firebase.firestore();
    var dbEvents = db.collection('customerDomains').doc(jumplink.firebase.config.customerDomain).collection('events');
    
    controller.active = data.active;
    controller.search = '';
    
    controller.events = [];

    var getEvents = function() {
         dbEvents.get()
        .then((querySnapshot) => {
            //ycontroller.events = querySnapshot.data();
            controller.debug('events', controller.events, querySnapshot);
            controller.events = [];
            querySnapshot.forEach((doc) => {
                var event = doc.data();
                event.id = doc.id;
                event = jumplink.events.parse(event);
                controller.events.push(event);
            });
        })
        .then(function(events) {
            search(controller.events, controller.search, 'title');
        })
        .catch(function(error) {  
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht geladen werden',
                body: error.message,
            });
            controller.debug('error', error);
        });
    };
    
    controller.sort = function(event, controller) {
        var $this = $(event.target);
        var data = $this.data();
        // data.sortProperty
        
        if(!data.sortDirection) {
            data.sortDirection = 'asc';
        } else {
            if(data.sortDirection === 'asc') {
                data.sortDirection = 'desc';
            } else {
                data.sortDirection = 'asc';
            }
        }
        $this.data('sortDirection', data.sortDirection);
        
        controller.debug('sort', data);
        
        controller.events.sort(function(a, b) {
            var result = 0;
            switch(data.sortProperty) {
                default:
                    if(a[data.sortProperty] < b[data.sortProperty]) {
                        result = -1;
                    }
                    if(a[data.sortProperty] > b[data.sortProperty]) {
                        result = 1;
                    }
                break;
            }
            if(data.sortDirection === 'desc') {
                result = result * -1;
            }
            return result;
        });
    };
   
    
    controller.delete = function(event, controller) {
        var $this = $(event.target);
        var id = $this.data('id');
        controller.debug('delete', $this.data());
        
        dbEvents.doc(id).delete()
        .then(function() {
            var message = 'Ereignis erfolgreich gelöscht';
            controller.debug(message);
            getEvents();
        }).catch(function(error) {
            var message = error.message;
            jumplink.utilities.showGlobalModal({
                title: 'Ereignis konnte nicht gelöscht werden',
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
    
    var search = function (events, term, propertyKey) {
        if(!propertyKey) {
            propertyKey = 'title';
        }
        events.forEach(function(event) {
            if(term.length) {
                event.searchTermPass = event[propertyKey].indexOf(term) !== -1;
            } else {
                event.searchTermPass = true;
            }
        });
        
        return events;
    };
    
    var ready = function() {
        if(jumplink.utilities.isArray(data.events)) {
            controller.events = data.events;
        } else {
            getEvents();
        }
        
        $el.find('[name="search"]').unbind('keyup change').bind('keyup change', function () {
            controller.debug('search', this.value);
            search(controller.events, this.value, 'title');
        });
        
        search(controller.events, controller.search, 'title');
        
    };
    
    $el.one('DOMSubtreeModified', function() {
        setTimeout(function() {
            ready();
        }, 0);     
    });
    
    return controller;
  }
};