// rivets.js formatters

/**
 * Add useful general-purpose formatters for Rivets.js
 * Formatters from cart.js
 * @see https://github.com/discolabs/cartjs/blob/master/src/rivets.coffee#L52
 */


rivets.formatters.eq = function(a, b) {
  return a === b;
};

rivets.formatters.includes = function(a, b) {
  return a.indexOf(b) >= 0;
};

rivets.formatters.match = function(a, regexp, flags) {
  return a.match(new RegExp(regexp, flags));
};

rivets.formatters.lt = function(a, b) {
  return a < b;
};

rivets.formatters.gt = function(a, b) {
  return a > b;
};

rivets.formatters.not = function(a) {
  return !a;
};

rivets.formatters.empty = function(a) {
  return !a.length;
};

rivets.formatters.and = function(a, b) {
  return a && b;
};

rivets.formatters.or = function(a, b) {
  return a || b;
};



/**
 * Adds a number to an output.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/math-filters#plus
 */
rivets.formatters.plus = function(a, b) {
  return parseInt(a) + parseInt(b);
};

/**
 * Subtracts a number from an output.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/math-filters#minus
 */
rivets.formatters.minus = function(a, b) {
  return parseInt(a) - parseInt(b);
};

/**
 * Multiplies an output by a number.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/math-filters#times
 */
rivets.formatters.times = function(a, b) {
  return a * b;
};

/**
 * Divides an output by a number. The output is rounded down to the nearest integer.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/math-filters#divided_by
 */
rivets.formatters.divided_by = function(a, b) {
  return a / b;
};

/**
 * Divides an output by a number and returns the remainder.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/math-filters#modulo
 */
rivets.formatters.modulo = function(a, b) {
  return a % b;
};

/**
 * Prepends characters to a string.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/string-filters#prepend
 */
rivets.formatters.prepend = function(a, b) {
  return b + a;
};

/**
 * Appends characters to a string.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/string-filters#append
 */
rivets.formatters.append = function(a, b) {
  return a + b;
};

/**
 * The `slice` filter returns a substring, starting at the specified index.
 * An optional second parameter can be passed to specify the length of the substring.
 * If no second parameter is given, a substring of one character will be returned.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/string-filters#slice
 */
rivets.formatters.slice = function(value, start, end) {
  return value.slice(start, end);
};

rivets.formatters.pluralize = function(input, singular, plural) {
  if (plural == null) {
    plural = singular + 's';
  }
  if (CartJS.Utils.isArray(input)) {
    input = input.length;
  }
  if (input === 1) {
    return singular;
  } else {
    return plural;
  }
};

rivets.formatters.array_element = function(array, index) {
  return array[index];
};

rivets.formatters.array_first = function(array) {
  return array[0];
};

rivets.formatters.array_last = function(array) {
  return array[array.length - 1];
};

// Add Shopify-specific formatters for Rivets.js.
rivets.formatters.money = function(value, currency) {
  return ProductJS.Utilities.formatMoney(value, ProductJS.settings.moneyFormat, 'money_format', currency);
};

rivets.formatters.money_with_currency = function(value, currency) {
  return ProductJS.Utilities.formatMoney(value, ProductJS.settings.moneyWithCurrencyFormat, 'money_with_currency_format', currency);
};

rivets.formatters.weight = function(grams) {
  switch (CartJS.settings.weightUnit) {
    case 'kg':
      return (grams / 1000).toFixed(CartJS.settings.weightPrecision);
    case 'oz':
      return (grams * 0.035274).toFixed(CartJS.settings.weightPrecision);
    case 'lb':
      return (grams * 0.00220462).toFixed(CartJS.settings.weightPrecision);
    default:
      return grams.toFixed(CartJS.settings.weightPrecision);
  }
};

/**
 * Formats the product variant's weight. The weight unit is set in General Settings.
 * 
 * @see https://help.shopify.com/themes/liquid/filters/additional-filters#weight_with_unit
 */
rivets.formatters.weight_with_unit = function(grams) {
  return rivets.formatters.weight(grams) + CartJS.settings.weightUnit;
};

rivets.formatters.product_image_size = function(src, size) {
  return CartJS.Utils.getSizedImageUrl(src, size);
};

// Add camelCase aliases for underscore formatters.
rivets.formatters.moneyWithCurrency = rivets.formatters.money_with_currency;
rivets.formatters.weightWithUnit = rivets.formatters.weight_with_unit;
rivets.formatters.productImageSize = rivets.formatters.product_image_size;

// Additional formatters for ProductJS

/**
 * Returns the size of a string (the number of characters) or an array (the number of elements).
 * 
 * @see https://help.shopify.com/themes/liquid/filters/array-filters#size
 */
rivets.formatters.size = function(a) {
  return a.length;
};

/**
 * Strips tabs, spaces, and newlines (all whitespace) from the left and right side of a string.
 * @see https://help.shopify.com/themes/liquid/filters/string-filters#strip
 */
rivets.formatters.strip = function (str) {
  return $.trim(str);
}

/**
 * Converts a string into uppercase.
 * @see https://help.shopify.com/themes/liquid/filters/string-filters#upcase
 */
rivets.formatters.upcase = function (str) {
  return str.toUpperCase();
}

/**
 * Converts a string into lowercase.
 * @see https://help.shopify.com/themes/liquid/filters/string-filters#downcase
 */
rivets.formatters.downcase = function (str) {
  return str.toLowerCase();
}

/**
 * Formats a string into a handle.
 * @see https://help.shopify.com/themes/liquid/filters/string-filters#handle-handleize
 */
rivets.formatters.handleize = function (str) {
  str = rivets.formatters.strip(str);
  str = str.replace(/[^\w\s]/gi, '') // http://stackoverflow.com/a/4374890
  str = rivets.formatters.downcase(str);
  return str.replace(/ /g,"-");
}

/**
 * Set default value
 * @see https://gist.github.com/der-On/cdafe908847e2b882691
 */
rivets.formatters.default = function(value, args) {
  return (typeof value !== 'undefined' && value !== null) ? value : args;
};

/**
 * True if array contains property or containts property with value
 * @see https://gist.github.com/der-On/cdafe908847e2b882691
 */
rivets.formatters.contains = function(value, attr, search) {

  // console.log("contains", value, attr, search);

  if(!ProductJS.Utilities.isArray(value)) {
    console.warn("not an array");
    return false;
  }

  if(typeof search === 'undefined') {
    search = attr;
    if (ProductJS.Utilities.isArray(value)) {
      return (value.indexOf(search) !== -1);
    }
  }

  for (var i = 0; i < value.length; i++) {
    if(value[i][attr] === search) {
      return true;
      break;
    }      
  }

  return false;
};

/**
 * Just get the digits of a string, useful to remove px from css value
 * 
 * @see http://stackoverflow.com/a/1100653/1465919
 */
rivets.formatters.justDigits = function (str) {
  if(ProductJS.Utilities.isNumber(str)) {
    return str;
  }
  var num = str.replace(/[^-\d\.]/g, '');
  if(isNaN(num)) {
    return 0;
  } else {
    return Number(num);
  }
}

/**
 * Prüft ob eine Zahl gerade ist oder nicht
 * Check if a number is even or not
 */
rivets.formatters.even = function (num) {
  return (num % 2) === 0;
}

rivets.formatters.uneven = function (num) {
  return (num % 2) !== 0;
}


/**
 * Returns true if value index it the last index of the array. Returns false if it is not the last index.
 * 
 * ```
 *  <div rv-each-image="product.images" rv-hide="product.images | last %image%"></div>
 * ```
 * 
 * @see https://help.shopify.com/themes/liquid/objects/for-loops#forloop-last
 */
rivets.formatters.last = function(array, index) {
  return (array.length === index + 1);
};

/**
 * Get property of object
 * @see https://gist.github.com/der-On/cdafe908847e2b882691
 */
rivets.formatters.get = function(obj, key) {
  if (obj && typeof obj === 'object') {
    return obj[key];
  }
  return null;
};
rivets.formatters['.'] = rivets.formatters.get;

/**
 * Set property of object
 * @see https://gist.github.com/der-On/cdafe908847e2b882691
 */
rivets.formatters.set = function(obj, key, value) {
  if (obj && typeof obj === 'object') {
    obj[key] = value;
  }

  return obj;
};

// Additional formatters for Textilyze

/**
 * greatest common divisor (GCD) useful to calculate the ratio
 * @see https://stackoverflow.com/a/1186465/1465919
 */
rivets.formatters.gcd = function(a, b) {
  return (b == 0) ? a : rivets.formatters.gcd(b, a%b);
};


// Date formatters
// @see https://github.com/matthieuriolo/rivetsjs-stdlib/blob/master/src/rivetsstdlib.js

/* date functions */

rivets.formatters.date = function(target, format) {
    return moment(target).format(format || 'DD.MM.YYYY');
};

rivets.formatters.time = function(target, format) {
    return moment(target).format(format || 'HH:mm');
};

rivets.formatters.datetime = function(target, format) {
    return moment(target).format(format);
};

rivets.formatters.toTimestamp = function(target) {
    return moment(target).format("X");
};

rivets.formatters.toDate = function(target) {
    return moment.unix(target).toDate();
};

rivets.formatters.toMoment = function(target) {
    return moment(target);
};

/**
 * Get the duration between two dates
 * @example  {startAt | duration endAt | asHours }
 */
rivets.formatters.duration = function(start, end) {
    return moment.duration(moment(end).diff(start));
};

rivets.formatters.asHours = function(date) {
    return date.asHours();
};

/**
 * The date formatter returns a formatted date string according to the moment.js
 * formatting syntax.
 *
 * ```html
 * <span rv-value="model:date | date 'dddd, MMMM Do'"></span>
 * ```
 *
 * @see {@link http://momentjs.com/docs/#/displaying} for format options.
 */
rivets.formatters.dateFormat = function(target, val) {
    return moment(target).format(val);
};
