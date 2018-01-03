+function (window, document, undefined) {
    var forEach = Array.prototype.forEach,
    toString = Object.prototype.toString,
    classMatchExp = /^\.[^\.\d][^\.]$/,
    types = {};

    var Util = {
        isPureObject: function (obj) {
            return toString.call(obj).indexOf('Object') > 0;
        },
        isArray: function (arr) {
            return Array.isArray(arr);
        },
        isBoolean: function (b) {
            return toString.call(b).indexOf('Boolean') > 0;
        },
        isString: function (str) {
            return toString.call(str).indexOf('String') > 0;
        },
        isObject: function (obj) {
            return typeof obj == 'object';
        },
        isFunction: function (f) {
            return typeof f == 'function';
        },
        isElement: function (ele) {
            return ele instanceof Element;
        },
        isNumber: function (num) {
            return toString.call(num).indexOf('Number') > 0;
        },
        isQueryObject: function (obj) {
            return obj instanceof $;
        },
        inherit: function (subType, superType) {
            subType.prototype.__proto__ = superType.prototype;
            subType.__proto__ = superType;
        },
        flatArray: function (arr) {
            var reArray = [],
                length = arr.length;
            for (var i = 0, item; i < length; i++) {
                if (this.isArray(item = arr[i])) {
                    reArray.push.apply(reArray, this.flatArray(item));
                } else {
                    reArray.push(item);
                }
            }
            return reArray;
        }
    };

    addTypeBlock('String', {
        vaild: Util.isString,
        error: 'an String'
    });

    addTypeBlock('Boolean', {
        vaild: Util.isBoolean,
        error: 'an boolean'
    });

    addTypeBlock('Array', {
        vaild: Util.isArray,
        error: 'an Array'
    });

    addTypeBlock('Object', {
        vaild: Util.isObject,
        error: 'an object'
    });

    addTypeBlock('Number', {
        vaild: Util.isNumber,
        error: 'an object'
    });

    addTypeBlock('Function', {
        vaild: Util.isFunction,
        error: 'an function'
    });

    addTypeBlock('pureObject', {
        vaild: Util.isQueryObject,
        error: 'pure object'
    });

    function addTypeBlock (name, block) {
        types[name] = block;
        block.isRequire = {
            vaild: isRequireProp,
            error: 'is require',
            types: block,
            require: true
        };
    }

    function isRequireProp (val) {
        return val !== undefined;
    }

    function validateOptions (options, controlClass) {
        var fields = controlClass.optionFields;
        function validate (prop, vaildBlock) {
            var cond,
                val = options[prop];
            function vBlock (block) {
                if (block) {
                    var singelCond = block.vaild(val);
                    cond = cond || singelCond;
                    return singelCond;
                } 
            }
            if (Util.isArray(vaildBlock)) {
                vaildBlock = Util.flatArray(vaildBlock);
                for (var i = 0, sCond; i <= vaildBlock.length; i++) {
                    if (vBlock(vaildBlock[i])) {
                        break;
                    } 
                }
            } else {
                vBlock(vaildBlock);
            }
            if (cond != null) {
                if (cond) {
                    vaildBlock.types && validate(prop, vaildBlock.types);
                } else if (vaildBlock.require || isRequireProp(val)) {
                    throw new TypeError('The configuration ' + 
                        prop + ' of the wrap of the ' + controlClass.name + ' component must be ' 
                    + vaildBlock.error);
                }
            }
        }
        for (var key in fields) {
            validate(key, fields[key]);
        }
    }

    function forEachEl (els, cb) {
        var is$el = Util.isQueryObject(els),
            length = els.length,
            eq = is$el ? function (i) {
                return els.eq(i);
            } : function () {
                return els[i];
            };
        for (var i = 0; i < length; i++) {
            cb.call(els, eq(i), i);
        }
    }

    function mapEl (els, cb) {
        var results = [];
        forEachEl(els, function (el, i) {
            results.push(cb.call(els, el, i));
        });
        return results;
    }

    function insertEl ($parent, els) {
        if ($parent.length) {
            if (!$parent.is(':hidden')) {
                $parent.hide();
                insertEl($parent, els);
                return $parent.show();
            }
            $parent.append(els);
        }
    }

    var FormGroup = function (selector, labelText, labelClass) {
        this._$el = $(selector).addClass('form-group condit-query');
        this._createSub(labelText, labelClass);
    }

    FormGroup.prototype._createSub = function (labelText, labelClass) {
        this._$el.append($('<label></label>').addClass('field-dsp ' + labelClass).text(labelText + ':'));
        return this;
    } 

    FormGroup.prototype.insertControl = function (control) {
        control.setParentGroup(this);
        insertEl(this._$el, control.getEls());
        return this;
    }

    FormGroup.prototype.insert = function (el) {
        if (el instanceof Control) {
            return this.insertControl(el);
        } 
        insertEl(this._$el, el);
        return this;
    }

    var Control = function () {
        this._$el = null;
        this._parentGroup = null;
        this._value = null;
    }

    Control.prototype.getEls = function () {
        return this._$el;
    }
    Control.prototype.setParentGroup = function (formGroup) {
        this._parentGroup = formGroup;
    }
    Control.prototype.parentGroup = function () {
        return this._parentGroup;
    }
    Control.prototype.getCurValue = function () {
        return this._value;
    }


    var Dropdown = function (options) {
        Control.call(this);
        this._options = options;
        this._renderData = [];
        this._initOptions();
        this.selectedIndex = this._options.selectedIndex;
        this._createEls();
        this._addEvents();
    }

    Util.inherit(Dropdown, Control);

    Dropdown.optionFields = {
        wrapClass: types.String,
        // defaultText: types.String.isRequire,
        defaultText: [types.String, types.Number],
        selectedIndex: types.Number,
        downList: types.Array,
        onChange: types.Function,
        sort: types.Function,
        renderItem: types.Function
    };

    Dropdown.prototype._initOptions = function () {
        validateOptions(this._options, Dropdown);
        this._options = Object.create(this._options, {});
        var options = this._options;
        options.downList = options.downList || [];
    }

    Dropdown.prototype._createEls = function () {
        var text,
            options = this._options,
            index = this.selectedIndex,
            wrapClass = options.wrapClass,
            data = options.downList;
        this._renderData = data;
        text = Util.isNumber(index) ? options.renderItem(this._renderData[index]) : options.defaultText;
        this._$el = $('<div></div>').addClass('dropdown drop-box').addClass(wrapClass);
        this._$el.append(
            '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                text +
                '<span class="caret"></span>' +
            '</button>' +
            '<ul class="dropdown-menu" >' +
                '<li ><a class="drop-opt" href="javascript:void(0)">' + options.defaultText + '</a></li>' +
                this._genListStr() +
            '</ul>'
        )
        this.$ul = this._$el.children().eq(1);
        this.$firstOpt = this._$el.children().eq(0);
    }

    Dropdown.prototype._genListStr = function () {
        var options = this._options,
        index = this.selectedIndex - 1,
        downList = this._renderData.slice();
        options.sort && downList.sort(options.sort);
        return downList.map(function (item, i) {
            return  '<li class="' + (i == index ? 'drop-active' : '') + '"><a class="drop-opt" href="javascript:void(0)">' + options.renderItem(item) + '</a></li>';
        }).join('');
    }

    Dropdown.prototype.setRenderData = function (data) {
        this.$firstOpt.nextAll().remove();
        this.$firstOpt.after(this._genListStrByData(data));
    }

    Dropdown.prototype._addEvents = function () {
        var self = this;
        this.$ul.on('click', '.drop-opt', function (e) {
            var val = $(this).html(),
                index = $(this).parent().index();
            self.$ul.children().eq(self.selectedIndex).removeClass('drop-active');
            $(this).parent().addClass('drop-active');
            self.$firstOpt.contents().eq(0).remove();
            self.$firstOpt.prepend(val);
            self.selectedIndex = index;
            self._value = val;
            self._options.onChange.call(self, val, index);
        });
    }

    Dropdown.prototype.getEls = function () {
        return this._$el;
    }

    var SearchBox = function (options) {
        Control.call(this);
        this._options = options;
        this._renderData = [];
        this._parentGroup = null;
        this._initOptions();
        this._createEls();
        this._addEvents();
    }

    Util.inherit(SearchBox, Control);

    SearchBox.optionFields = {
        wrapClass: types.String,
        downList: types.Array,
        placeholder: types.String.isRequire,
        onChange: types.Function,
        sort: types.Function,
        renderItem: types.Function,
        displayMaxinum: types.Number
    };

    SearchBox.prototype._initOptions = function () {
        validateOptions(this._options, SearchBox);
        this._options = Object.create(this._options, {});
        var options = this._options;
        options.downList = options.downList || [];
        options.onKeyUp = options.onKeyUp || function () {};
        options.displayMaxinum = options.displayMaxinum || 10;
    }

    SearchBox.prototype._createEls = function () {
        var options = this._options,
            wrapClass = options.wrapClass,
            data = options.downList;
        this._renderData = data;
        this._$el = $('<div></div>').addClass('search-box').addClass(wrapClass);
        this._$el.append(
            '<input type="text" class="form-control " placeholder="' + options.placeholder + '">' +
            '<ul class="list-group result-lis">' +
                this._genListStr() +
            '</ul>'
        );
        this.$ul = this._$el.children('.result-lis');
        this.$input = this.$ul.prev();
    }

    SearchBox.prototype._genListStr = function () {
        var options = this._options,
        downList = this._renderData.slice();
        options.sort && downList.sort(options.sort);
        return downList.slice(0, options.displayMaxinum).map(function (item) {
            return  '<li class="list-group-item" >' + options.renderItem(item) + '</li>';
        }).join('');
    }

    SearchBox.prototype.setRenderData = function (data) {
        this._renderData = data;
        this.$ul.html(this._genListStr(data));
    }

    SearchBox.prototype.showList = function () {
        this.$ul.show();
    }

    SearchBox.prototype.setValue = function (val) {
        this._value = val;
        this.$input.val(val);
    }

    SearchBox.prototype._addEvents = function () {
        var self = this;
        this.$ul.on('click', '.list-group-item', function (e) {
            var val = $(this).html(),
                index = $(this).index('.list-group-item');
            self.$input.val(val);
            self.$ul.hide();
            self.setRenderData([]);
            self._value = val;
            self._options.onChange.call(self, val, index);
        });

        this.$input.on('keyup', function () {
            self._value = self.$input.val();
            self._options.onKeyUp.call(self, self._value);
        }).on('focus', function () {
            self.showList();
        });

    }

    SearchBox.prototype.getEls = function () {
        return this._$el;
    }

    window.exports = {
        FormGroup: FormGroup,
        SearchBox: SearchBox,
        Dropdown: Dropdown
    };
} (window, document, undefined);