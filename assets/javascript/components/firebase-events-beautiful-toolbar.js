/**
 * firebase-events-beautiful-toolbar
 */
rivets.components['firebase-events-beautiful-toolbar'] = {
  template: function() {
    return jumplink.templates['firebase-events-beautiful-toolbar'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:firebase-events-beautiful-toolbar');
    controller.debug('initialize', el, data);
    var $el = $(el);
    controller.type = data.type;
    controller.calendar = data.calendar;
    controller.style = data.style;
    controller.events = data.events;
    controller.event = controller.events[0];
    controller.date;
    controller.quantity = 0;
    controller.total = 0;
    

    
    /*
     * Gesamtpreis berechnen
     */
    var calcTotal = function (event, quantity) {
        var priceObj = getScalePriceByQuantity(event, quantity);
        if(priceObj === null) {
            var error = new Error('Kein Staffelpreis gefunden, TODO handle error');
            console.error(error);
            throw error;
        }
        
        var total = priceObj.fixprice + (priceObj.price * quantity);
        return total;
    };
    
    controller.onSelectEventChanged = function(selectedEvent) {
        controller.event = controller.events[selectedEvent.index];
        controller.debug('onSelectEventChanged', controller.event);
        controller.total = jumplink.utilities.calcEventTotal(controller.event, controller.quantity);
    };
        
    controller.onDateChanged = function(dates) {
        controller.debug('onDateChanged', dates);
        controller.date = dates[0];
    };
    
    controller.onQuantityChanged = function(event) {
        controller.debug('onQuantityChanged', controller.quantity);
        controller.total = jumplink.utilities.calcEventTotal(controller.event, controller.quantity);
    };
    
    controller.selectEventValues = [];
    
    controller.events.forEach(function(event, i) {
        controller.selectEventValues.push({
            index: i,
            label: event.title,
            value: event.id,
        });
    });
    
    controller.date;
        
    return controller;
  }
};
