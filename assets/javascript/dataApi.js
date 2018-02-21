// JumpLink functions
jumplink = window.jumplink || {};
jumplink.dataApi = window.jumplink.dataApi || {};

// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.dataApi = debug('theme:dataApi');

/**
 * Init itemslode methods as data api, you need to give over the target wich is the id without `#` and $element wich is the selected jquery element of the itemslide
 */
window.jumplink.dataApi.initItemslide = function (target, $element) {
  var $itemslideMethod = $('[data-itemslide-method]');

  // click events
  $itemslideMethod.off('click').on('click', function() {
    var $this = $(this);
    var data = $this.data();
    var method = data.itemslideMethod;
    window.jumplink.debug.dataApi('[data-itemslide-method] click', data, target, $element);
    
    // workaround
    if(data.target === target) {
      if($element) {
        window.jumplink.debug.dataApi('[initItemslide] $element', $element);
        switch (method) {
          case 'next':
            $element.next();
            break;
          case 'previous':
            $element.previous();
            break;
          case 'gotoSlide':
            const slide = Number(data.itemslideSlide);
            window.jumplink.debug.dataApi('[itemslide] gotoSlide', slide);
            $element.gotoSlide(slide);
            break;
        }
      }
    }
  });

  // state changes
  $itemslideMethod.each(function(index) {
    var $this = $(this);
    var data = $this.data();
    var method = data.itemslideMethod;
    window.jumplink.debug.dataApi('[init state changes] data', data);
    if(data.target === target) {
      if($element) {
        $element.on('changeActiveIndex', function() {
          var index = $element.getActiveIndex();
          window.jumplink.debug.dataApi('[changeActiveIndex]', 'index', index, 'method', method);
          switch (method) {
            case 'next':
              var count = window.jumplink.getItemslideCount($element);
              if(count - 1 === index) {
                $this.addClass('disabled');
              } else {
                $this.removeClass('disabled');
              }
              window.jumplink.debug.dataApi('[changeActiveIndex] next count', count, 'index', index);
              break;
            case 'previous':
              if(index === 0) {
                $this.addClass('disabled');
              } else {
                $this.removeClass('disabled');
              }
              window.jumplink.debug.dataApi('[changeActiveIndex] previous index', index);
              break;
            case 'gotoSlide':
                const slide = Number(data.itemslideSlide);
                if(slide === index) {
                    $this.addClass('disabled');
                } else {
                    $this.removeClass('disabled');
                }
                break;
          }
        });
      }
    }

  });


};


/**
 * Data bindings to call slick methods with target
 */
jumplink.initSlickMethods = function () {
 
  var $slickMethod = $('[data-slick-method]');
  $slickMethod.unbind( 'click' ).bind( 'click', function() {
    var $this = $(this);
    var data = $this.data();
    var $target = $(data.target);
    var method = data.slickMethod;
    // console.log('initSlickMethods', $target, method);
    $target.slick(method);
  });

  var $slickArea = $('[data-area="slick"]');
  var mousePos = {};
  var offset = $slickArea.offset();
  var width = $slickArea.width();
  // $slickArea.mousemove(function(e){
  //   width = $slickArea.width();
  //   mousePos = {
  //       left: e.pageX - offset.left,
  //       top: e.pageY - offset.top,
  //   };
  //   // TODO custom image https://css-tricks.com/almanac/properties/c/cursor/
  //   console.log('mousePos', mousePos, width);
  // });
};

/**
 * Data bindings for custom modals
 * Use the `data-toggle="modal-no-touch"` attribute if you wish to open a modal online on no touch devices
 */
jumplink.initCustomModals = function () {
  var $modalNoTouch = $('[data-toggle="modal-no-touch"]');

  $modalNoTouch.unbind( 'click' ).bind( 'click', function(event) {

    // do not open modal on touch devices
    if(jumplink.isTouchDevice()) {
      return;
    }

    var $this = $(this);
    var data = $this.data();
    var backdrop = data.backdrop;
    var target = data.target;
    $(target).modal({
      backdrop: backdrop
    });
  });
};

/**
 * Custom version of Bootstraps Collapse Component
 * 
 * @see https://v4-alpha.getbootstrap.com/components/collapse/
 */
jumplink.initCustomCollapses = function () {
  var $dataAttributes = $('[data-toggle="collapse-with-icon"]');

  $dataAttributes.each(function() {
    var $this = $(this);

    // Prevent multiple initializations
    if(!$this.hasClass('collapse-with-icon-initialized')) {
      console.log("jumplink.initCustomCollapses");
      $this.collapse({
        toggle: false,
      });
      $this.addClass('collapse-with-icon-initialized');
    }

  });

  $dataAttributes.click(function(event) {
    var $this = $(this);
    var $dataTarget = $($this.data('target'));
    var $dataIcon = $this.find($this.data('icon'));
    var dataCloseClass= $this.data('iconClassOnHide');
    var dataShowClass= $this.data('iconClassOnShow');
    var currentLocation = jumplink.getCurrentLocation();
    var targetLocation = jumplink.getUrlLocation($this.attr('href'));
   

    // Do not open link if it is the current location
    if(currentLocation.pathname === targetLocation.pathname) {
      event.preventDefault();
    }

    // toggle
    if($dataTarget.hasClass('show')) {
      $dataTarget.collapse('hide');
      $dataIcon.removeClass(dataShowClass).addClass(dataCloseClass);
    } else {
      $dataTarget.collapse('show');
      $dataIcon.removeClass(dataCloseClass).addClass(dataShowClass);
    }
  });
};


jumplink.initDataApi = function () {
  jumplink.initSlickMethods();
  jumplink.initCustomModals();
  jumplink.initCustomCollapses();
  // jumplink.dataApi.initItemslide('list-items-carousel', window.jumplink.cache.$listItemsCarousel);
};
