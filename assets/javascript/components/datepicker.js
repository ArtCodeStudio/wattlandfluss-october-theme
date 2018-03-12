/**
 * datepicker
 * TODO use rivets.binders['pignose-calendar'] in this compoment
 */
rivets.components.datepicker = {

  template: function() {
    return jumplink.templates.datepicker;
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:datepicker');
    var $el = $(el);
    controller.debug('initialize', $el, data);
    var $input;
    controller.id;
    controller.placeholder;
    controller.label ;
            
    var onChange = function (dates) {
        controller.debug('onChange dates', dates);
        controller.dates = dates;
        if (jumplink.utilities.isFunction(data.onChange)) {
            data.onChange(dates);
        }
    };
    
    var set = function (dates) {
        controller.dates = dates; // start date is today
        $input.val(controller.dates[0].format(data.format));
    };
    
    controller.setStart = function (date) {
        controller.debug('setStart', date);
        set([date]);
    };
    
    var ready = function () {
        
        data.format = data.format || 'YYYY-MM-DD';
        data.lang = data.lang || 'en';
        
        controller.id = data.id ? 'datepicker-'+data.id : Date.now();
        controller.placeholder = data.placeholder || '';
        controller.description = data.description;
        controller.label = data.label;
        
        $input = $el.find('input');
    
        if(data.startValue) {
            set([moment(data.startValue)]);
        } else {
            set([moment()]);
        }
    
        /**
         * init date picker
         * @see https://www.pigno.se/barn/PIGNOSE-Calendar/
         */
        $input.pignoseCalendar({
            lang: data.lang,
            minDate: moment().subtract(1, 'days'), // min day is today
            buttons: true,
            date: controller.dates[0], 
            format: data.format,
            apply: onChange,
        });
    
    };
    

    $el.one('DOMSubtreeModified', function() {
        setTimeout(function() {
            ready();
        }, 0);     
    });
    
    return controller;
  }
};