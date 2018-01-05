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

/**
 * Detect the browser, sets platform.supported to true if the browser is supported by themes theme
 * Replace html placeholders from the key's of platfrom
 * @see https://github.com/bestiejs/platform.js
 */
window.jumplink.initBrowserDetection = function () {
  if(typeof(platform) === 'undefined') {
    window.jumplink.debug.warn('You need the platform.js library to detect the browser!');
    return false;
  }

  // is the browser supported by this theme?
  platform.supported = false;
  if(platform.version === null ) {
    platform.version_number = null;
  } else {
    if(platform.version.indexOf('.')) {
      platform.version_number = Number(platform.version.substr(0, platform.version.indexOf('.')));
    } else {
      platform.version_number = Number(platform.version);
    }
  }

  switch (platform.name) {
    case 'Chrome':
      if(platform.version_number >= 60) {
        platform.supported = true;
      }
      break;
    case 'Chrome Mobile':
      if(platform.version_number >= 60) {
        platform.supported = true;
      }
      break;
    case 'Firefox':
      if(platform.version_number >= 57) {
        platform.supported = true;
      }
      break;
      case 'Firefox Mobile':
      if(platform.version_number >= 57) {
        platform.supported = true;
      }
      break;
    case 'Safari':
      if(platform.version_number >= 9) {
        platform.supported = true;
      }
      break;
    case 'IE':
      if(platform.version_number >= 11) {
        platform.supported = true;
      }
      break;
    case 'Microsoft Edge':
      if(platform.version_number >= 17) {
        platform.supported = true;
      }
      break;
      case 'Opera':
      if(platform.version_number >= 49) {
        platform.supported = true;
      }
      break;
    default:
      break;
  }

  switch (platform.os.family) {
    case 'Linux':
    case 'Ubuntu':
    case 'Debian':
    case 'Fedora':
    case 'Red Hat':
    case 'SuSE':
    case 'Gentoo':
    case 'Kubuntu':
    case 'Linux Mint':
    case 'Xubuntu':
    case 'Xubuntu':
      jumplink.cache.$body.addClass('os-family-linux');
      break;
    case 'Windows Server 2003 / XP 64-bit': // BrowserStack Chrome: Windows XP
    case 'Windows Server 2008 R2 / 7':      // BrowserStack Chrome: Windows 7
    case 'Windows':                         // BrowserStack Chrome: Windows 8 und Windows 8.1
    case 'Windows Server 2008 / Vista':
    case 'Windows XP':
      jumplink.cache.$body.addClass('os-family-windows');
      break;
    case 'OS X':
      jumplink.cache.$body.addClass('os-family-osx');
      break;
    case 'Windows Phone':                   // BrowserStack: Windows Phone Lumia 930
      jumplink.cache.$body.addClass('os-family-windows-phone');
      break;
    case 'iOS':
      jumplink.cache.$body.addClass('os-family-ios');
      break;
    case 'Android':
      jumplink.cache.$body.addClass('os-family-android');
      break;
    case 'Chrome OS':
    case 'CrOS':
      jumplink.cache.$body.addClass('os-family-chrome-os');
      break;
    default:
      jumplink.cache.$body.addClass('os-family-other');
      break;
  }

  window.jumplink.debug.browser('platform', platform);

  window.jumplink.initBrowserDetectionTemplate('#jumplink-browser-detection-bar');

  if(platform.supported) {
    jumplink.cache.$body.removeClass('browser-not-supported').addClass('browser-supported');
  } else {
    jumplink.cache.$body.removeClass('browser-supported').addClass('browser-not-supported');
  }

  return platform.supported;
}
