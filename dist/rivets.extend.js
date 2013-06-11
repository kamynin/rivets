(function() {

    //// core

//    console.log('bind reinit');
    rivets.bind = function (el, models, options) {
        var view;

        if (models == null) {
            models = {};
        }
        if (options == null) {
            options = {};
        }
        view = new rivets.Rivets.View(el, models, options);
        view.config.adapter.models = models;
        view.config.adapter.view = view;
        view.bind();
        return view;
    };
    var
        __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        __slice = [].slice,
        __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    var BindingPrototype = rivets.Rivets.Binding.prototype;
    rivets.Rivets.Binding = function Binding(view, el, type, key, keypath, options) {
        var identifier, regexp, value, _ref;

        this.view = view;
        this.el = el;
        this.type = type;
        this.key = key;
        this.keypath = keypath;
        this.options = options != null ? options : {};
        this.update = __bind(this.update, this);
        this.unbind = __bind(this.unbind, this);
        this.bind = __bind(this.bind, this);
        this.publish = __bind(this.publish, this);
        this.sync = __bind(this.sync, this);
        this.set = __bind(this.set, this);
        this.eventHandler = __bind(this.eventHandler, this);
        this.formattedValue = __bind(this.formattedValue, this);
        if (!(this.binder = this.view.binders[type])) {
            _ref = this.view.binders;
            for (identifier in _ref) {
                value = _ref[identifier];
                if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                    regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
                    if (regexp.test(type)) {
                        this.binder = value;
                        this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(type);
                        this.args.shift();
                    }
                }
            }
        }
        this.binder || (this.binder = this.view.binders['*']);
        if (this.binder instanceof Function) {
            this.binder = {
                routine: this.binder
            };
        }
        this.formatters = this.options.formatters || [];
//        var key = this.key; var t;
//        if (t = key.match(/^[\$\w]+[$\w\d+]*?/)) {
//            key = t[0];
//        }
//        console.log(this.key, key);
//        this.model = this.key ? this.view.models[key] : this.view.models;
//        debugger;
//        this.model = typeof this.view.models[key] != 'undefined' ? this.view.models[key] : this.view.models;
        this.model = this.view.models;
//        this.parts = [this.key];
//        if (keypath) this.parts.push(keypath);
//        this.keypath = this.parts.join(".");
    };
    rivets.Rivets.Binding.prototype = BindingPrototype;


    rivets.Rivets.View.prototype.build = function() {
        var bindingRegExp, el, node, parse, skipNodes, _i, _j, _len, _len1, _ref, _ref1,
            _this = this;

        this.bindings = [];
        skipNodes = [];
        bindingRegExp = this.bindingRegExp();
        parse = function(node) {
            var attribute, attributes, binder, context, ctx, dependencies, identifier, key, keypath, n, options, path, pipe, pipes, regexp, splitPath, type, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;

            if (__indexOf.call(skipNodes, node) < 0) {
                _ref = node.attributes;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    attribute = _ref[_i];
                    if (bindingRegExp.test(attribute.name)) {
                        type = attribute.name.replace(bindingRegExp, '');
                        if (!(binder = _this.binders[type])) {
                            _ref1 = _this.binders;
                            for (identifier in _ref1) {
                                value = _ref1[identifier];
                                if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                                    regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
                                    if (regexp.test(type)) {
                                        binder = value;
                                    }
                                }
                            }
                        }
                        binder || (binder = _this.binders['*']);
                        if (binder.block) {
                            _ref2 = node.getElementsByTagName('*');
                            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                                n = _ref2[_j];
                                skipNodes.push(n);
                            }
                            attributes = [attribute];
                        }
                    }
                }
                _ref3 = attributes || node.attributes;
                for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
                    attribute = _ref3[_k];
                    if (bindingRegExp.test(attribute.name)) {
                        options = {};
                        type = attribute.name.replace(bindingRegExp, '');
                        pipes = (function() {
                            var _l, _len3, _ref4, _results;

                            _ref4 = attribute.value.split('|');
                            _results = [];
                            for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                                pipe = _ref4[_l];
                                _results.push(pipe.trim());
                            }
                            return _results;
                        })();
                        context = (function() {
                            var _l, _len3, _ref4, _results;

                            _ref4 = pipes.shift().split('<');
                            _results = [];
                            for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                                ctx = _ref4[_l];
                                _results.push(ctx.trim());
                            }
                            return _results;
                        })();
                        path = context.shift();
//                        splitPath = path.split(/\.|:/);
                        options.formatters = pipes;
                        options.bypass = path.indexOf(':') !== -1;
//                        console.log(path);
//                        if (splitPath[0]) {
//                            key = splitPath.shift();
//                        } else {
//                            key = null;
//                            splitPath.shift();
//                        }
//                        keypath = splitPath.join('.');
                        keypath = path
//                        console.log(path);
//                        if (!key || (_this.models[key] != null)) {
//                            if (dependencies = context.shift()) {
//                                options.dependencies = dependencies.split(/\s+/);
//                            }
                            _this.bindings.push(new rivets.Rivets.Binding(_this, node, type, key, keypath, options));
//                        }
                    }
                }
                if (attributes) {
                    attributes = null;
                }
            }
        };
        _ref = this.els;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            parse(el);
            _ref1 = el.getElementsByTagName('*');
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                node = _ref1[_j];
                if (node.attributes != null) {
                    parse(node);
                }
            }
        }
    };

    rivets.Rivets.Binding.prototype.bind = function() {
        var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;

        if ((_ref = this.binder.bind) != null) {
            _ref.call(this, this.el);
        }
        if (this.options.bypass) {
            this.sync();
        } else {
            if (!this.binder.function) {
                this.view.config.adapter.subscribe(this.model, this.keypath, this.sync);
                if (this.view.config.preloadData) {
                    this.sync();
                }
            } else {
                this.binder.routine.call(this, this.el, this.keypath);
            }
        }
        if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
            _ref2 = this.options.dependencies;
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                dependency = _ref2[_i];
                if (/^\./.test(dependency)) {
                    model = this.model;
                    keypath = dependency.substr(1);
                } else {
                    dependency = dependency.split('.');
                    model = this.view.models[dependency.shift()];
                    keypath = dependency.join('.');
                }
                _results.push(this.view.config.adapter.subscribe(model, keypath, this.sync));
            }
            return _results;
        }
    };

//// binders

    var applyVars = function(string, model) {
        var m, v, r;
        while (m = string.match(/{{(.+?)}}/)) {
            v = m[1];
            with (model) {
                r = eval(v);
            }
            string = string.replace("{{"+v+"}}", r);
        }
        return string;
    };

    var getRawValue = function(el, type, view) {
        var key = "data-";
        if (view.config.prefix) {
            key +=view.config.prefix + "-";
        }
        key += type;
        return el.getAttribute(key);
    };

    rivets.binders.src = function(el, value) {
//        debugger;
        value = getRawValue(el, this.type, this.view);
        if (value) {
            value = applyVars(value, this.view.models);
            return el.setAttribute(this.type, value);
        } else {
            return el.removeAttribute(this.type);
        }
    };

    rivets.binders["*"] = function(el, value) {
        value = getRawValue(el, this.type, this.view);
        if (value) {
            value = applyVars(value, this.view.models);
            return el.setAttribute(this.type, value);
        } else {
            return el.removeAttribute(this.type);
        }
    };

    rivets.binders["on-*"] = {
        "function": true,
            unbind: function(el) {
            if (this.handler) {
                return rivets.Rivets.Util.unbindEvent(el, this.args[0], this.handler);
            }
        },
        routine: function(el, value) {
            if (this.handler) {
                rivets.Rivets.Util.unbindEvent(el, this.args[0], this.handler);
            }
            var model = this.model;
            return rivets.Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(function() {
                with (model) {
                    eval(value);
                }
            }));
        }
    },

    rivets.binders["each-*"] = {
        block: true,
        bind: function(el) {
            var attr;

            if (this.marker == null) {
                attr = ['data', this.view.config.prefix, this.type].join('-').replace('--', '-');
                this.marker = document.createComment(" rivets: " + this.type + " ");
                this.iterated = [];
                el.removeAttribute(attr);
                el.parentNode.insertBefore(this.marker, el);
                return el.parentNode.removeChild(el);
            }
        },
        unbind: function(el) {
            var view, _i, _len, _ref, _results;

            if (this.iterated != null) {
                _ref = this.iterated;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    view = _ref[_i];
                    _results.push(view.unbind());
                }
                return _results;
            }
        },
        routine: function(el, collection) {
            var data, i, index, k, key, model, modelName, options, previous, template, v, view, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;

            modelName = this.args[0];
            collection = collection || [];
            if (this.iterated.length > collection.length) {
                _ref = Array(this.iterated.length - collection.length);
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    i = _ref[_i];
                    view = this.iterated.pop();
                    view.unbind();
                    this.marker.parentNode.removeChild(view.els[0]);
                }
            }
            _results = [];
            for (index = _j = 0, _len1 = collection.length; _j < _len1; index = ++_j) {
                model = collection[index];
//                debugger;
                data = {};
                data['$index'] = index;
                data['$odd'] = index % 2 == 1;
                data['$even'] = !data['$odd'];
                data[modelName] = model;
                if (this.iterated[index] == null) {
                    _ref1 = this.view.models;
                    for (key in _ref1) {
                        model = _ref1[key];
                        if ((_ref2 = data[key]) == null) {
                            data[key] = model;
                        }
                    }
                    previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
                    options = {
                        binders: this.view.options.binders,
                        formatters: this.view.options.formatters,
                        config: {}
                    };
                    _ref3 = this.view.options.config;
                    for (k in _ref3) {
                        v = _ref3[k];
                        options.config[k] = v;
                    }
                    options.config.preloadData = true;
                    template = el.cloneNode(true);
                    view = new rivets.Rivets.View(template, data, options);
                    view.bind();
                    this.iterated.push(view);
                    _results.push(this.marker.parentNode.insertBefore(template, previous.nextSibling));
                } else if (this.iterated[index].models[modelName] !== model) {
                    _results.push(this.iterated[index].update(data));
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        }
    };

    /// formatters

    rivets.formatters.smartdate = function (date) {
        return App.formatDate(date);
    };

    rivets.formatters.eval = function() {
        console.log(arguments);
    };
})();


