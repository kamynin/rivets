function Scope(props) {
    var $s = this;

    this.$callbacks = {};
    this.$on = function(name, callback) {
        $s.$callbacks[name] = $s.$callbacks[name] || [];
        $s.$callbacks[name].push(callback);
    };
    this.$off = function(name) {
        delete $s.$callbacks[name];
    };
    this.$refresh = function(prop, newVal, oldVal) {
        if (typeof prop == 'string') {
            $s.$refreshProp(prop, newVal, oldVal);
        } else {
            for (var n in $s.$callbacks) {
                if ($s.$callbacks.hasOwnProperty(n)) {
                    $s.$refreshProp(n, $s[n], $s[n]);
                }
            }
        }
    };
    this.$refreshProp = function(prop, newVal, oldVal) {
        if ($s.$callbacks[prop]) {
            for (var i=0;i<$s.$callbacks[prop].length;i++) {
                $s.$callbacks[prop][i].call(this, newVal, oldVal);
            }
        }
    };

    this.$watch = function(prop, callback) {
        $s.$on(prop, callback);
    };

    this.$set = function(prop, value) {
        if (typeof $s[prop] == 'undefined' || $s[prop] != value) {
            var before = $s[prop];
            try {
                with($s) {
                    eval(prop + "= value");
                }
            } catch(e) {}
            $s.$refreshProp(prop, value, before);
        }
    };

    this.$apply = function(expr) {
        var before = getSnapshot();
        expr.call();

        var keys = Object.keys($s.$callbacks);

        for (var i = 0;i<keys.length;i++) {
            var k = keys[i];
            var oldVal = undefined;
            try {
                with (before) { oldVal = eval(k); }
            } catch (e) {}

            var newVal = undefined;
            try {
                with ($s) { newVal = eval(k); }
            } catch (e) {}

            if (typeof oldVal == 'undefined' || oldVal != newVal) {
                $s.$refreshProp(k, newVal, oldVal);
            }
        }
    };

    function getSnapshot() {
        var snapshot = {};
        for (var n in $s) {
            if (n.charAt(0) != "$" && $s.hasOwnProperty(n)) {
                snapshot[n] = $s[n];
            }
        }
        return JSON.parse(JSON.stringify(snapshot));
    };

    this.$bind = function($container) {
        if (rivets) {
            return rivets.bind($container, $s);
        }
    };

    for (var ind in props) {
        if (props.hasOwnProperty(ind)) {
            $s[ind] = props[ind];
        }
    }
}

(function() {

    if (rivets) {
        rivets.configure({
            adapter: {
                subscribe: function(obj, keypath, callback) {
//                    console.log('subscribe', arguments);
                    if (keypath) {
                        if (typeof obj == 'object' && obj.$on) obj.$on(keypath, callback);
                    }
                },
                unsubscribe: function(obj, keypath, callback) {
                    if (typeof obj == 'object' && obj.$off) obj.$off(keypath, callback);
                },
                read: function(obj, keypath) {
//                    console.log(obj, keypath);
                    var res;
                    with (obj) {
//                        debugger;
                        res = eval(keypath);
                    }
                    return res;
                },
                publish: function(obj, keypath, value) {
                    console.log('publish', arguments)
                    with(obj) {
                        return eval(keypath + " = value");
                    }
                }
            },
            prefix: 'rv'
        });
    }
})();
