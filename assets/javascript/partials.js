// JumpLink object
window.jumplink = window.jumplink || {};
window.jumplink.partials = {};

// debugging https://github.com/visionmedia/debug
window.jumplink.debug = window.jumplink.debug || {};
window.jumplink.debug.partials = debug('theme:partials');

/**
 * Search for partials and init them if init function is defined
 * @see https://help.shopify.com/themes/development/theme-editor/partials
 */
window.jumplink.partials.init = function(dataset, data) {
  window.jumplink.debug.partials('init');
  var $partials = $('.jumplink-partial');
  $partials.each(function(index) {
    var $partial = $(this);
    window.jumplink.debug.partials('$partial', $partial);
    var partialID = $partial.data('partialName'); // allways the second class is the partial name
    
    if(window.jumplink.utilities.isFunction(window.jumplink.partials[partialID])) {
        if(!$partial.hasClass('partial-initialized')) {
            window.jumplink.debug.partials('init '+partialID);
            window.jumplink.partials[partialID]($partials, $partial, dataset, data);
            $partial.addClass('partial-initialized');
        } else {
            window.jumplink.debug.partials('partial '+partialID+' allready initialized');
        }

      
    } else {
      window.jumplink.debug.partials('no javascript for partial:', partialID);
    }
  });
};

window.jumplink.partials['jumplink-iconset'] = function($partials, $partial, dataset, data) {
    var partialData = $partial.data();
    window.jumplink.debug.partials('jumplink-iconset', partialData);
};

window.jumplink.partials['jumplink-snippet-images-row'] = function($partials, $partial, dataset, data) {
    var partialData = $partial.data();
    window.jumplink.debug.partials('jumplink-snippet-images-row', partialData);
};

window.jumplink.partials['jumplink-snippet-event-list'] = function($partials, $partial, dataset, data) {
    var partialData = $partial.data();
    window.jumplink.debug.partials('jumplink-snippet-event-list', partialData);
};

window.jumplink.partials['jumplink-footer'] = function($partials, $partial, dataset, data) {
    var partialData = $partial.data();
    window.jumplink.debug.partials('jumplink-footer', partialData);
};

/**
 * init sections/jumplink-pages.liquid
 * * show fixed logo as svg on page
 * * hide element by scroll down of svg
 */
window.jumplink.partials['jumplink-fixed-logo'] = function($partials, $partial, dataset, data) {
    var partialData = $partial.data();
    var $hideShowElement = $(partialData.hideSelectorOnScroll);
    window.jumplink.debug.partials('init jumplink-fixed-logo', partialData);
    $(window).scroll(function() {
        pos = $(this).scrollTop();        
        if(pos > partialData.offsetInPx) {
            $hideShowElement.fadeOut();
        } else {
            $hideShowElement.fadeIn();
        }
    });
};

/**
 * Init the rightsidebar using simpler-sidebar and transformicons
 * @see http://dcdeiv.github.io/simpler-sidebar/
 * @see http://www.transformicons.com/
 * TODO move to partials?
 */
window.jumplink.partials['jumplink-sidebar'] = function($partials, $partial, dataset, data) {
    var partialData = $partial.data();
    window.jumplink.debug.partials('jumplink-sidebar', partialData);
    
    // init tree before sidebar to cache tree events in sidebar to close the sidebar
    var closingLinks = '.close-sidebar';
    var align = 'right';
    var trigger = '[data-toggle="sidebar"][data-target="#right-sidebar"]';
    var mask = partialData.mask;
    var $rightSidebar = $('#right-sidebar');
    var $leftSidebar = $('#left-sidebar');
    var $Sidebars = $('#right-sidebar, #left-sidebar');
    var $tcon = $('.sidebar-toggler.tcon');
    var defaultPaddingTop = 0;
    var $listItemsCarousel = window.jumplink.cache.$listItemsCarousel;
    var $window = $(window);
    
    var close = function () {
        $(closingLinks).trigger('click');
    }
    
    $rightSidebar.simplerSidebar({
        attr: "simplersidebar",
        init: "closed",
        top: 0,
        align: align, // sidebar.align
        gap: 0, // sidebar.gap
        animation: {
          duration: 500,
          easing: "swing"
        },
        selectors: {
          trigger: trigger, // opener
          quitter: closingLinks // sidebar.closingLinks
        },
        sidebar: {
          width: $(window).width() > 768 ? 500 : '40vw',
        },
        mask: {
          display: mask,
          css: {
            backgroundColor: "black",
            opacity: 0.5,
            filter: "Alpha(opacity=50)",
            'z-index': 1000,
          }
        },
        events: {
          on: {
            animation: {
              open: function() {
                window.jumplink.debug.partials('open');
                // icon animation for open
                if($tcon.length) {
                    transformicons.transform($('.sidebar-toggler.tcon')[ 0 ]);
                }
              },
              close: function() {
                window.jumplink.debug.partials('close');
                // icon animation for close
                if($tcon.length) {
                    transformicons.revert($('.sidebar-toggler.tcon')[ 0 ]);
                }
                
                if($listItemsCarousel) {
                    setTimeout(function(){
                        $listItemsCarousel.gotoSlide(0);
                    }, 200);
                }
              },
              both: function() {
        
              },
            }
          },
          callbacks: {
            animation: {
              open: function() {
        
              },
              close: function() {
        
              },
              both: function() {
                
              },
              freezePage: true,
            }
          }
        }
    });
    
    $rightSidebar.off('swiperight').on('swiperight', function(e) { 
        window.jumplink.debug.partials('swiperight');
        close();
    });
      
    $rightSidebar.show();
    jumplink.utilities.triggerResize();
    
    // if slide navigation is avable
    if($listItemsCarousel) {
    
        if($listItemsCarousel.hasClass('itemsilde-initialized')) {
            // window.jumplink.debug.itemslide('[initProductCarouselWithItemSlide] already created, stop');
            $listItemsCarousel.reload();
            return;
        }
        
        window.jumplink.debug.partials('init $listItemsCarousel', $listItemsCarousel);
        
        var width = $listItemsCarousel.width();
        $listItemsCarousel.parent().css('min-width', width);
        
        $listItemsCarousel.itemslide({
            disable_slide: true,
            disable_autowidth: true,
            // left_sided: true,
            disable_scroll: true,
            one_item: true,
            parent_width: true,
            // duration: 1500
        });
        
        window.jumplink.dataApi.initItemslide('list-items-carousel', $listItemsCarousel);
    }
    
    if($Sidebars) {
        if(partialData.paddingTopByNavbar) {
            $window.resize(function() {
              $Sidebars.css( 'padding-top', jumplink.utilities.getNavHeight() + defaultPaddingTop +'px');
            });
            $Sidebars.css( 'padding-top', jumplink.utilities.getNavHeight() + defaultPaddingTop +'px');
        } else {
            $Sidebars.css( 'padding-top', defaultPaddingTop +'px');
        }
        
        if($listItemsCarousel) {
            var minWidth = $listItemsCarousel.width();
            $listItemsCarousel.parent().css('min-width', minWidth);
            $listItemsCarousel.reload();
        }
    } else {
        console.error(new Error('$Sidebars is undefined'));
    }
};