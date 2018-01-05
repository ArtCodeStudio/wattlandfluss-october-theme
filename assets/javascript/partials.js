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
    var partialID = $partial.data('partial-name'); // allways the second class is the partial name
    
    if(window.jumplink.isFunction(window.jumplink.partials[partialID])) {
      window.jumplink.debug.partials('init '+partialID);
      window.jumplink.partials[partialID]($partials, $partial, dataset, data);
    } else {
      window.jumplink.debug.partials('no javascript for section id: "'+partialID+'"');
    }
  });
};

/**
 * init sections/jumplink-pages.liquid
 */
window.jumplink.partials['jumplink-fixed-logos'] = function($sections, $section, dataset, data) {
  // $section.each(function(index) {
  //   var $section = $(this);
  // });
  
  window.jumplink.debug.partials('jumplink-fixed-logos');
};


/**
 * Replace platform placeholders in html by `selectionString`
 */
window.jumplink.initBrowserDetectionTemplate = function (selectionString) {
  window.jumplink.debug.browser('initBrowserDetectionTemplate', selectionString);
  var $content = $(selectionString);
  var html = $content.html();

  for (var key in platform){
    if (platform.hasOwnProperty(key)) {
      // window.jumplink.debug.browser('Key is ' + key + ', value is ' + platform[key]);
      var value = platform[key];
      // Transorm boolean to Ja / Nein
      if(typeof(value) === 'boolean') {
        value = value === true ? 'Ja' : 'Nein';
      }
      // remove unsetted values from template
      if(value === null || typeof(value) === 'undefined') {
        value = '';
      }
      html = html.replace(new RegExp('{platform\.'+key+'}', 'g'), value+' ');
    }
  }
  for (var key in platform.os){
    if (platform.os.hasOwnProperty(key) && key !== 'toString') {
      window.jumplink.debug.browser('Key is ' + key + ', value is ' + platform.os[key]);
      var value = platform.os[key];
      // Transorm boolean to Ja / Nein
      if(typeof(value) === 'boolean') {
        value = value === true ? 'Ja' : 'Nein';
      }
      // remove unsetted values from template
      if(value === null || typeof(value) === 'undefined') {
        value = '';
      }
      html = html.replace(new RegExp('{platform\.os\.'+key+'}', 'g'), value+' ');
    }
  }
  $content.html(html);
}