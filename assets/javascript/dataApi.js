// JumpLink functions
jumplink = window.jumplink || {};
jumplink.dataApi = window.jumplink.dataApi || {};

// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.dataApi = debug('theme:dataApi');


window.jumplink.dataApi.initItemslide = function () {
  var $itemslideMethod = $('[data-itemslide-method]');

  // click events
  $itemslideMethod.off('click').on('click', function() {
    var $this = $(this);
    var data = $this.data();
    var method = data.itemslideMethod;
    window.jumplink.debug.dataApi('[data-itemslide-method] click', data);
    
    // workaround
    if(data.target === 'list-items-carousel') {
      if(window.jumplink.cache.$listItemsCarousel) {
        switch (method) {
          case 'next':
            window.jumplink.cache.$listItemsCarousel.next();
            break;
          case 'previous':
            window.jumplink.cache.$listItemsCarousel.previous();
            break;
          case 'gotoSlide':
            const slide = Number(data.itemslideSlide);
            window.jumplink.debug.dataApi('[itemslide] gotoSlide', slide);
            window.jumplink.cache.$listItemsCarousel.gotoSlide(slide);
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
    if(data.target === 'product-carousel') {
      if(window.jumplink.cache.$productCarousel) {
        window.jumplink.cache.$productCarousel.on('changeActiveIndex', function() {
          var index = window.jumplink.cache.$productCarousel.getActiveIndex();
          switch (method) {
            case 'next':
              var count = window.jumplink.getItemslideCount(window.jumplink.cache.$productCarousel);
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

/**
 * Create Leaflet map with data attributes
 */
jumplink.initLeadlet = function (handle) {
    var $mapElement = $('#map-'+handle);
    var data = $mapElement.data();
    
    data.lat = parseFloat(data.lat);
    data.lon = parseFloat(data.lon);
    data.popupAddLat = parseFloat(data.popupAddLat);
    
    console.log('data', data);
    
    var icon = L.icon({
        iconUrl: data.markerIcon,    
        iconSize:     data.iconSize, // size of the icon
        iconAnchor:   data.iconAnchor, // point of the icon which will correspond to marker's location
    });
    
    var map = L.map('map-'+handle, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
    }
    ).setView([data.lat, data.lon], data.zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    var maker = L.marker([data.lat, data.lon], {icon: icon}).addTo(map);
    
    if(data.popupText) {
        var popup = L.popup()
            // set the popup a bit over the marker
            .setLatLng([data.lat + data.popupAddLat, data.lon])
            .setContent(data.popupText)
            .openOn(map);
    }
    
    map.on('click', function(e) {
        console.log("Lat: " + e.latlng.lat + ", Lon: " + e.latlng.lng);
    });
};


jumplink.initDataApi = function () {
  jumplink.initSlickMethods();
  jumplink.initCustomModals();
  jumplink.initCustomCollapses();
  jumplink.dataApi.initItemslide
};
