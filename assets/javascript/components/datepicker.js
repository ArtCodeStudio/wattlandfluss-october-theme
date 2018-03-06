/**
 * datepicker
 */
rivets.components['datepicker'] = {

  template: function() {
    return jumplink.templates['datepicker'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:datepicker');
    var $el = $(el);
    controller.debug('initialize', $el, data);
    
    data.format = data.format || 'YYYY-MM-DD';
    data.lang = data.lang || 'en';
    
    controller.id = data.id ? 'datepicker-'+data.id : Date.now();
    controller.placeholder = data.placeholder || '';
        
    var onChange = function (dates) {
        controller.debug('onChange dates', dates);
        controller.dates = dates;
        if (jumplink.utilities.isFunction(data.onChange)) {
            data.onChange(dates);
        }
    }
    
    var $input = $el.find('input');
    controller.dates = [moment()]; // start date is today
    $input.val(controller.dates[0].format(data.format));
    
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
    
    return controller;
  }
};