/**
 * Component with some utilities fpr a select with generated select options 
 * @html:
 * <select
 *      label="'label'"
 *      description="'description'"
 *      values="values"
 *      on-change="onSelectChanged"
 * >
 * 
 * @parent controller:
 * controller.values = [
 *   {id:1, label: 'Watt', value: 'watt'},
 *   {id:2, label: 'Land', value: 'land'},
 *   {id:3, label: 'Fluss', value: 'fluss'},
 *   {id:4, label: 'Spezial', value: 'spezial'},
 *   {label: 'Grouped Example', grouped: [
 *     {id:5, label: 'A', value: 'a'},
 *     {id:6, label: 'B', value: 'b'},
 *     {id:7, label: 'C', value: 'c'},
 *     {id:8, label: 'D', value: 'd'},
 *   ]}
 * ];
 * 
 * controller.onSelectChanged = function(selectedValue) {
        controller.debug('onSelectChanged', selectedValue);
    };
 */
rivets.components['rv-select'] = {
  template: function() {
    return jumplink.templates['rv-select'];
  },
    initialize: function(el, data) {
        var controller = this;
        controller.debug = window.debug('rivets:rv-select');
        var $el = $(el);
        var $select = $el.find('select');
        controller.debug('initialize', $el, $select, data);
        
        controller.label = data.label;
        controller.description = data.description;
        controller.name = data.name;

        // set id, if not präsent generate the id
        controller.id = data.id ? 'rv-select-'+data.id : Date.now();

        if(data.values) {
            controller.values = data.values;
        }

        // you can also set the select values by a key -> value object
        if(data.keyValueValues) {
            controller.values = [];
            var counter = 0;
            for (var key in data.keyValueValues) {
                if (data.keyValueValues.hasOwnProperty(key)) {
                    var value = data.keyValueValues[key];
                    if(typeof(value) !== 'function') {
                        controller.values.push({
                            value: key,
                            label: value,
                            id: counter,
                        });
                        counter++;
                    }
                }
            }
        }

        /**
         * Get the selected value of a select option DOM element
         */
        controller.get = function() {
            $selected = $select.find('option:selected');
            if($selected.length) {
                $parent = $selected.parent();
                var data;
                var value;
                // is grouped option
                if($parent.is('optgroup')) {
                    var groupData = $parent.data();
                    data = $selected.data();
                    if(groupData.index >= 0 && data.index >= 0) {
                        value = controller.values[groupData.index].grouped[data.index];
                        return value;
                    }
                } else {
                    // is ungrouped option
                    data = $selected.data();
                    if(data.index >= 0 && data.index < controller.values.length) {
                        value = controller.values[data.index];
                        return value;
                    }
                }
            }
            return null;
        };
        
        /**
         * set a value
         */
        controller.set = function(value) {
            if(jumplink.utilities.isObject(value)) {
                if(value.value) {
                    value = value.value;
                }

                if(value.grouped && value.grouped[0].value) {
                    value = value.grouped[0].value;
                }
            }
            $select.val(value).change();
            controller.debug('set', value);
            controller.value = value;
            return controller.get();
        };
        
        var onChange = function(value) {
            $el.trigger('change', value);
            if (jumplink.utilities.isFunction(data.onChange)) {
                data.onChange(value);
            }
        };
        
        /*
         * set the selected value, if not defined as attribute select the first value from the values array
         */
        if(data.value) {
            controller.set(data.value);
        } else {
            controller.set(controller.values[0]);
            onChange(controller.values[0]); // on change is not automatically fired in this case, so fire it manually
        }
        
        /**
         * Append values to select dom element
         */
        controller.values.forEach(function(value, i) {

            var $option;
            
            // grouped option
            if(value.grouped) {
                $option = $('<optgroup>', {
                    'data-index': i,
                    label : value.label,
                });
                value.grouped.forEach(function(value, k) {
                    var $suboption = $('<option>', {
                        'data-index': k,
                        'data-id': value.id,
                        value: value.value,
                        text : value.label,
                    });
                    $option.append($suboption);
                });
            } else {
                // ungrouped option
                $option = $('<option>', {
                    'data-index': i,
                    'data-id': value.id,
                    value: value.value,
                    text : value.label,
                });
            }
            
            // select first element by default
            if(i === 0) {
                $option.attr('selected', true);
            }
            
            $select.append($option);
        });
        
        $select.on('change', function() {
            var $this = $(this);
            var value = controller.get();
            onChange(value);
            controller.debug('[$select.on(change] value', value );
        });
    
        return controller;
    }
};