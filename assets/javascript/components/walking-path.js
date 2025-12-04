/**
 * walking-path
 */
rivets.components['walking-path'] = {

  template: function() {
    // return $('template#walking-path').html();
    return jumplink.templates['walking-path'];
  },

  initialize: function(el, data) {
    var controller = this;
    controller.debug = window.debug('rivets:walking-path');
    controller.debug('initialize', el, data);
    var $el = $(el);
    
    controller.svg = '';
    controller.path = data.path;
    controller.color = data.color;
    controller.filename = data.filename;
    controller.class = controller.filename + ' walking-path-wrapper';
    controller.containerClass = data.containerClass || 'container';
    
    // randomly flip the svg horizontal
    if(jumplink.utilities.rand(0, 1) === 1) {
        controller.class = controller.class + ' flip-h';
    }
    
    var loadSvg = function() {
        $.get(data.path + '/' + data.filename, function(data) {
          var svg = new XMLSerializer().serializeToString(data.documentElement);
          controller.svg = svg.replace('bg-color', 'fill-' + controller.color);
        });
    };
    
    loadSvg();
    return controller;
  }
};