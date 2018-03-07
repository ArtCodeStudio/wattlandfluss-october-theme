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
    
    controller.onSelectEventChanged = function(selectedEvent) {
        controller.debug('onSelectEventChanged', selectedEvent);
        controller.event = controller.events[selectedEvent.index];
    };
    
    controller.onSelectMemberChanged = function(member) {
        controller.debug('onSelectMemberChanged', member);
        controller.member = member;
    };
    
    controller.onDateChanged = function(dates) {
        controller.debug('onDateChanged', dates);
        controller.date = dates[0];
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
    
    controller.members = [
        {index: 0, label: '10 Teilnehmer', value: 10},
        {index: 1, label: '20 Teilnehmer', value: 20},
        {index: 2, label: '30 Teilnehmer', value: 30},
    ];
    
    controller.member = controller.members[0];
        
    return controller;
  }
};
