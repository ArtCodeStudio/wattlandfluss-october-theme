/**
 * rv-img
 */
rivets.components['rv-img'] = {
  template: function() {
    // return $('template#rv-img').html();
    return jumplink.templates['rv-img'];
  },
  initialize: function(el, data) {
    var controller = this;
    controller.debug = debug('rivets:rv-img');
    var $el = $(el);
    var observer;
    controller.src = data.src;
    controller.alt = data.alt;
    controller.style = '';
    controller.loaded = false;
    
    if(data.ratio) {
        controller.ratio = data.ratio.split(':');
        controller.ratio[0] = Number(controller.ratio[0]);
        controller.ratio[1] = Number(controller.ratio[1]);
        controller.heightInPercent = (controller.ratio[1] / controller.ratio[0] * 100);
        controller.style = 'padding-top: ' + controller.heightInPercent + '%;';
    }
    
    if(data.width && data.height) {
        controller.ratio = [];
        controller.ratio[0] = Number(data.width);
        controller.ratio[1] = Number(data.height);
        controller.heightInPercent = (controller.ratio[1] / controller.ratio[0] * 100);
        controller.style = 'padding-top: ' + controller.heightInPercent + '%;';
    }
    
    var options = {
        scrollDirection: data.scrollDirection || 'vertical',
        effect: data.effect || "fadeIn",
        effectTime: Number(data.effectTime || 600),
        threshold: Number(data.threshold || 0),
        visibleOnly: data.visibleOnly === true || data.visibleOnly === 'true',
        bind: 'event',
        delay: Number(data.delay || -1),
        /**  called before an elements gets handled */
        beforeLoad: function(element) {
            controller.loaded = false;
            $el.off('DOMSubtreeModified');
            controller.debug('[beforeLoad]', element, controller);
            if (jumplink.utilities.isFunction(data.beforeLoad)) {
                data.beforeLoad($el, controller);
            }
        },
        
        /**  called after an element was successfully handled */
        afterLoad: function(element) {
            controller.loaded = true;
            $el.find('spinner').remove();
            controller.debug('[afterLoad]', element, controller);
            // controller.style = 'padding-top: ' + controller.heightInPercent + '%;';
            if (jumplink.utilities.isFunction(data.afterLoad)) {
                data.afterLoad($el, controller);
            }
        },
        
        /** called whenever an element could not be handled */
        onError: function(element) {
            controller.debug('[onError] image "' + controller.src + '" could not be loaded');
            if (jumplink.utilities.isFunction(data.onError)) {
                data.onError($el, controller);
            }
        },
        
        /**  called once all elements was handled */
        onFinishedAll: function() {
            controller.loaded = true;
            controller.debug('[onFinishedAll]', controller);
            if (jumplink.utilities.isFunction(data.onFinishedAll)) {
                data.onFinishedAll($el, controller);
            }
        },
    };
    
    controller.debug('initialize', el, data, controller);
        
    /**
     * For lazy loading options see https://github.com/eisbehr-/jquery.lazy#configuration-parameters
     */
    var ready = function(mutationsList) {
        controller.debug('ready mutationsList', mutationsList);
        var $img = $el.find('.lazy');  
        if($img.length) {
            $img.Lazy(options);
            controller.debug('init Lazy', options, $img, $img.data());
        }
    }
        
    $el.on('DOMSubtreeModified', ready); // this event is unbind on beforeLoad callback
            
    return controller;
  }
};