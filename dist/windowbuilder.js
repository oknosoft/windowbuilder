;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Windowbuilder = factory();
  }
}(this, function() {
(function(window, undefined) {
    'use strict';

    if (!window) return; 

    var $ = window.$;
    var _baron = baron; 
    var pos = ['left', 'top', 'right', 'bottom', 'width', 'height'];
    var instances = [];
    var origin = {
        v: { 
            x: 'Y', pos: pos[1], oppos: pos[3], crossPos: pos[0], crossOpPos: pos[2],
            size: pos[5],
            crossSize: pos[4], crossMinSize: 'min-' + pos[4], crossMaxSize: 'max-' + pos[4],
            client: 'clientHeight', crossClient: 'clientWidth',
            scrollEdge: 'scrollLeft',
            offset: 'offsetHeight', crossOffset: 'offsetWidth', offsetPos: 'offsetTop',
            scroll: 'scrollTop', scrollSize: 'scrollHeight'
        },
        h: { 
            x: 'X', pos: pos[0], oppos: pos[2], crossPos: pos[1], crossOpPos: pos[3],
            size: pos[4],
            crossSize: pos[5], crossMinSize: 'min-' + pos[5], crossMaxSize: 'max-' + pos[5],
            client: 'clientWidth', crossClient: 'clientHeight',
            scrollEdge: 'scrollTop',
            offset: 'offsetWidth', crossOffset: 'offsetHeight', offsetPos: 'offsetLeft',
            scroll: 'scrollLeft', scrollSize: 'scrollWidth'
        }
    };

    var opera12maxScrollbarSize = 17;
    var macmsxffScrollbarSize = 15;
    var macosxffRe = /[\s\S]*Macintosh[\s\S]*\) Gecko[\s\S]*/;
    var isMacFF = macosxffRe.test(window.navigator.userAgent);

    var log = function() {
        baron.fn.log.apply(this, arguments);
    };
    var liveBarons = 0;
    var shownErrors = {
        liveTooMany: false,
        allTooMany: false
    };

    function baron(params) {
        var jQueryMode;
        var roots;
        var withParams = !!params;
        var defaultParams = {
            $: window.jQuery,
            direction: 'v',
            barOnCls: '_scrollbar',
            resizeDebounce: 0,
            event: function(elem, event, func, mode) {
                params.$(elem)[mode || 'on'](event, func);
            },
            cssGuru: false,
            impact: 'scroller',
            position: 'static'
        };

        params = params || {};

        for (var key in defaultParams) {
            if (params[key] === undefined) {
                params[key] = defaultParams[key];
            }
        };

        if (!params.$) {
            log('error', [
                'no jQuery nor params.$ detected',
                'https://github.com/Diokuz/baron/blob/master/docs/logs/no-jquery-detected.md'
            ].join(', '), params);
        }
        if (params.position == 'absolute' && params.impact == 'clipper') {
            log('error', [
                'Simultaneous use of `absolute` position and `clipper` impact values detected.',
                'Those values cannot be used together.',
                'See more https://github.com/Diokuz/baron/issues/138'
            ].join(' '), params);
        }

        jQueryMode = params.$ && this instanceof params.$;

        if (params._chain) {
            roots = params.root;
        } else if (jQueryMode) {
            params.root = roots = this;
        } else if (params.$) {
            roots = params.$(params.root || params.scroller);
        } else {
            roots = []; 
        }

        var instance = new baron.fn.constructor(roots, params, withParams);

        if (instance.autoUpdate) {
            instance.autoUpdate();
        }

        return instance;
    }

    function arrayEach(obj, iterator) {
        var i = 0;

        if (obj.length === undefined || obj === window) obj = [obj];

        while (obj[i]) {
            iterator.call(this, obj[i], i);
            i++;
        }
    }

    function getTime() {
        return new Date().getTime();
    }

    baron._instances = instances;

    baron.fn = {
        constructor: function(roots, totalParams, withParams) {
            var params = clone(totalParams);

            params.event = function(elems, e, func, mode) {
                arrayEach(elems, function(elem) {
                    totalParams.event(elem, e, func, mode);
                });
            };

            this.length = 0;

            arrayEach.call(this, roots, function(root, i) {
                var attr = manageAttr(root, params.direction);
                var id = +attr; 

                if (id == id && attr !== null && instances[id]) {
                    if (withParams) {
                        log('error', [
                            'repeated initialization for html-node detected',
                            'https://github.com/Diokuz/baron/blob/master/docs/logs/repeated.md'
                        ].join(', '), totalParams.root);
                    }

                    this[i] = instances[id];
                } else {
                    var perInstanceParams = clone(params);

                    if (params.root && params.scroller) {
                        perInstanceParams.scroller = params.$(params.scroller, root);
                        if (!perInstanceParams.scroller.length) {
                            console.log('Scroller not found!', root, params.scroller);
                            return;
                        }
                    } else {
                        perInstanceParams.scroller = root;
                    }

                    perInstanceParams.root = root;
                    this[i] = init(perInstanceParams);
                }

                this.length = i + 1;
            });

            this.params = params;
        },

        dispose: function() {
            var params = this.params;

            arrayEach(this, function(instance, index) {
                instance.dispose(params);
                instances[index] = null;
            });

            this.params = null;
        },

        update: function() {
            var args = arguments;

            arrayEach(this, function(instance, index) {
                instance.update.apply(instance, args);
            });
        },

        baron: function(params) {
            params.root = [];
            if (this.params.root) {
                params.scroller = this.params.scroller;
            }

            arrayEach.call(this, this, function(elem) {
                params.root.push(elem.root);
            });
            params.direction = (this.params.direction == 'v') ? 'h' : 'v';
            params._chain = true;

            return baron(params);
        }
    };

    function manageEvents(item, eventManager, mode) {
        item._eventHandlers = item._eventHandlers || [
            {
                element: item.scroller,

                handler: function(e) {
                    item.scroll(e);
                },

                type: 'scroll'
            }, {
                element: item.root,

                handler: function() {
                    item.update();
                },

                type: 'transitionend animationend'
            }, {
                element: item.scroller,

                handler: function() {
                    item.update();
                },

                type: 'keyup'
            }, {
                element: item.bar,

                handler: function(e) {
                    e.preventDefault(); 
                    item.selection(); 
                    item.drag.now = 1; 
                    if (item.draggingCls) {
                        $(item.root).addClass(item.draggingCls);
                    }
                },

                type: 'touchstart mousedown'
            }, {
                element: document,

                handler: function() {
                    item.selection(1); 
                    item.drag.now = 0;
                    if (item.draggingCls) {
                        $(item.root).removeClass(item.draggingCls);
                    }
                },

                type: 'mouseup blur touchend'
            }, {
                element: document,

                handler: function(e) {
                    if (e.button != 2) { 
                        item._pos0(e);
                    }
                },

                type: 'touchstart mousedown'
            }, {
                element: document,

                handler: function(e) {
                    if (item.drag.now) {
                        item.drag(e);
                    }
                },

                type: 'mousemove touchmove'
            }, {
                element: window,

                handler: function() {
                    item.update();
                },

                type: 'resize'
            }, {
                element: item.root,

                handler: function() {
                    item.update();
                },

                type: 'sizeChange'
            }, {
                element: item.clipper,

                handler: function() {
                    item.clipperOnScroll();
                },

                type: 'scroll'
            }
        ];

        arrayEach(item._eventHandlers, function(event) {
            if (event.element) {
                eventManager(event.element, event.type, event.handler, mode);
            }
        });

    }

    function manageAttr(node, direction, mode, id) {
        var attrName = 'data-baron-' + direction + '-id';

        if (mode == 'on') {
            node.setAttribute(attrName, id);
        } else if (mode == 'off') {
            node.removeAttribute(attrName);
        } else {
            return node.getAttribute(attrName);
        }
    }

    function init(params) {
        var out = new item.prototype.constructor(params);

        manageEvents(out, params.event, 'on');

        manageAttr(out.root, params.direction, 'on', instances.length);
        instances.push(out);

        liveBarons++;
        if (liveBarons > 100 && !shownErrors.liveTooMany) {
            log('warn', [
                'You have too many live baron instances on page (' + liveBarons + ')!',
                'Are you forget to dispose some of them?',
                'All baron instances can be found in baron._instances:'
            ].join(' '), instances);
            shownErrors.liveTooMany = true;
        }
        if (instances.length > 1000 && !shownErrors.allTooMany) {
            log('warn', [
                'You have too many inited baron instances on page (' + instances.length + ')!',
                'Some of them are disposed, and thats good news.',
                'but baron.init was call too many times, and thats is bad news.',
                'All baron instances can be found in baron._instances:'
            ].join(' '), instances);
            shownErrors.allTooMany = true;
        }

        out.update();

        return out;
    }

    function clone(input) {
        var output = {};

        input = input || {};

        for (var key in input) {
            if (input.hasOwnProperty(key)) {
                output[key] = input[key];
            }
        }

        return output;
    }

    function validate(input) {
        var output = clone(input);

        output.event = function(elems, e, func, mode) {
            arrayEach(elems, function(elem) {
                input.event(elem, e, func, mode);
            });
        };

        return output;
    }

    function fire(eventName) {
        if (this.events && this.events[eventName]) {
            for (var i = 0 ; i < this.events[eventName].length ; i++) {
                var args = Array.prototype.slice.call( arguments, 1 );

                this.events[eventName][i].apply(this, args);
            }
        }
    }

    var item = {};

    item.prototype = {
        _debounce: function(func, wait) {
            var self = this,
                timeout,
                timestamp;

            var later = function() {
                if (self._disposed) {
                    clearTimeout(timeout);
                    timeout = self = null;
                    return;
                }

                var last = getTime() - timestamp;

                if (last < wait && last >= 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    func();
                }
            };

            return function() {
                timestamp = getTime();

                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }

            };
        },

        constructor: function(params) {
            var $,
                barPos,
                scrollerPos0,
                track,
                resizePauseTimer,
                scrollingTimer,
                scrollLastFire,
                resizeLastFire,
                oldBarSize;

            resizeLastFire = scrollLastFire = getTime();

            $ = this.$ = params.$;
            this.event = params.event;
            this.events = {};

            function getNode(sel, context) {
                return $(sel, context)[0]; 
            }

            this.root = params.root; 
            this.scroller = getNode(params.scroller);
            this.bar = getNode(params.bar, this.root);
            track = this.track = getNode(params.track, this.root);
            if (!this.track && this.bar) {
                track = this.bar.parentNode;
            }
            this.clipper = this.scroller.parentNode;

            this.direction = params.direction;
            this.rtl = params.rtl;
            this.origin = origin[this.direction];
            this.barOnCls = params.barOnCls;
            this.scrollingCls = params.scrollingCls;
            this.draggingCls = params.draggingCls;
            this.impact = params.impact;
            this.position = params.position;
            this.rtl = params.rtl;
            this.barTopLimit = 0;
            this.resizeDebounce = params.resizeDebounce;

            function setBarSize(size) {
                var barMinSize = this.barMinSize || 20;

                if (size > 0 && size < barMinSize) {
                    size = barMinSize;
                }

                if (this.bar) {
                    $(this.bar).css(this.origin.size, parseInt(size, 10) + 'px');
                }
            }

            function posBar(pos) {
                if (this.bar) {
                    var was = $(this.bar).css(this.origin.pos),
                        will = +pos + 'px';

                    if (will && will != was) {
                        $(this.bar).css(this.origin.pos, will);
                    }
                }
            }

            function k() {
                return track[this.origin.client] - this.barTopLimit - this.bar[this.origin.offset];
            }

            function relToPos(r) {
                return r * k.call(this) + this.barTopLimit;
            }

            function posToRel(t) {
                return (t - this.barTopLimit) / k.call(this);
            }

            this.cursor = function(e) {
                return e['client' + this.origin.x] ||
                    (((e.originalEvent || e).touches || {})[0] || {})['page' + this.origin.x];
            };

            function dontPosSelect() {
                return false;
            }

            this.pos = function(x) { 
                var ie = 'page' + this.origin.x + 'Offset',
                    key = (this.scroller[ie]) ? ie : this.origin.scroll;

                if (x !== undefined) this.scroller[key] = x;

                return this.scroller[key];
            };

            this.rpos = function(r) { 
                var free = this.scroller[this.origin.scrollSize] - this.scroller[this.origin.client],
                    x;

                if (r) {
                    x = this.pos(r * free);
                } else {
                    x = this.pos();
                }

                return x / (free || 1);
            };

            this.barOn = function(dispose) {
                if (this.barOnCls) {
                    if (dispose ||
                        this.scroller[this.origin.client] >= this.scroller[this.origin.scrollSize])
                    {
                        if ($(this.root).hasClass(this.barOnCls)) {
                            $(this.root).removeClass(this.barOnCls);
                        }
                    } else {
                        if (!$(this.root).hasClass(this.barOnCls)) {
                            $(this.root).addClass(this.barOnCls);
                        }
                    }
                }
            };

            this._pos0 = function(e) {
                scrollerPos0 = this.cursor(e) - barPos;
            };

            this.drag = function(e) {
                var rel = posToRel.call(this, this.cursor(e) - scrollerPos0);
                var k = (this.scroller[this.origin.scrollSize] - this.scroller[this.origin.client]);
                this.scroller[this.origin.scroll] = rel * k;
            };

            this.selection = function(enable) {
                this.event(document, 'selectpos selectstart', dontPosSelect, enable ? 'off' : 'on');
            };

            this.resize = function() {
                var self = this;
                var minPeriod = (self.resizeDebounce === undefined) ? 300 : self.resizeDebounce;
                var delay = 0;

                if (getTime() - resizeLastFire < minPeriod) {
                    clearTimeout(resizePauseTimer);
                    delay = minPeriod;
                }

                function upd() {
                    var offset = self.scroller[self.origin.crossOffset];
                    var client = self.scroller[self.origin.crossClient];
                    var padding = 0;

                    if (isMacFF) {
                        padding = macmsxffScrollbarSize;

                    } else if (client > 0 && offset === 0) {
                        offset = client + opera12maxScrollbarSize;
                    }

                    if (offset) { 
                        self.barOn();

                        if (self.impact == 'scroller') { 
                            var delta = offset - client + padding;

                            if (self.position == 'static') { 
                                var was = self.$(self.scroller).css(self.origin.crossSize);
                                var will = self.clipper[self.origin.crossClient] + delta + 'px';

                                if (was != will) {
                                    self._setCrossSizes(self.scroller, will);
                                }
                            } else { 
                                var css = {};
                                var key = self.rtl ? 'Left' : 'Right';

                                if (self.direction == 'h') {
                                    key = 'Bottom';
                                }

                                css['padding' + key] = delta + 'px';
                                self.$(self.scroller).css(css);
                            }
                        } else { 
                            var was = $(self.clipper).css(self.origin.crossSize);
                            var will = client + 'px';

                            if (was != will) {
                                self._setCrossSizes(self.clipper, will);
                            }
                        }
                    } else {
                    }

                    Array.prototype.unshift.call(arguments, 'resize');
                    fire.apply(self, arguments);

                    resizeLastFire = getTime();
                }

                if (delay) {
                    resizePauseTimer = setTimeout(upd, delay);
                } else {
                    upd();
                }
            };

            this.updatePositions = function() {
                var newBarSize,
                    self = this;

                if (self.bar) {
                    newBarSize = (track[self.origin.client] - self.barTopLimit) *
                        self.scroller[self.origin.client] / self.scroller[self.origin.scrollSize];

                    if (parseInt(oldBarSize, 10) != parseInt(newBarSize, 10)) {
                        setBarSize.call(self, newBarSize);
                        oldBarSize = newBarSize;
                    }

                    barPos = relToPos.call(self, self.rpos());

                    posBar.call(self, barPos);
                }

                Array.prototype.unshift.call( arguments, 'scroll' );
                fire.apply(self, arguments);

                scrollLastFire = getTime();
            };

            this.scroll = function() {
                var self = this;

                self.updatePositions();

                if (self.scrollingCls) {
                    if (!scrollingTimer) {
                        self.$(self.root).addClass(self.scrollingCls);
                    }
                    clearTimeout(scrollingTimer);
                    scrollingTimer = setTimeout(function() {
                        self.$(self.root).removeClass(self.scrollingCls);
                        scrollingTimer = undefined;
                    }, 300);
                }
            };

            this.clipperOnScroll = function() {

                if (!this.rtl) {
                    this.clipper[this.origin.scrollEdge] = 0;
                } else {
                    this.clipper[this.origin.scrollEdge] = this.clipper[this.origin.scrollSize];
                }
            };

            this._setCrossSizes = function(node, size) {
                var css = {};

                css[this.origin.crossSize] = size;
                css[this.origin.crossMinSize] = size;
                css[this.origin.crossMaxSize] = size;

                this.$(node).css(css);
            };

            this._dumbCss = function(on) {
                if (params.cssGuru) return;

                var overflow = on ? 'hidden' : null;
                var msOverflowStyle = on ? 'none' : null;

                this.$(this.clipper).css({
                    overflow: overflow,
                    msOverflowStyle: msOverflowStyle,
                    position: this.position == 'static' ? '' : 'relative'
                });

                var scroll = on ? 'scroll' : null;
                var axis = this.direction == 'v' ? 'y' : 'x';
                var scrollerCss = {};

                scrollerCss['overflow-' + axis] = scroll;
                scrollerCss['box-sizing'] = 'border-box';
                scrollerCss.margin = '0';
                scrollerCss.border = '0';

                if (this.position == 'absolute') {
                    scrollerCss.position = 'absolute';
                    scrollerCss.top = '0';

                    if (this.direction == 'h') {
                        scrollerCss.left = scrollerCss.right = '0';
                    } else {
                        scrollerCss.bottom = '0';
                        scrollerCss.right = this.rtl ? '0' : '';
                        scrollerCss.left = this.rtl ? '' : '0';
                    }
                }

                this.$(this.scroller).css(scrollerCss);
            };

            this._dumbCss(true);

            if (isMacFF) {
                var padding = 'paddingRight';
                var css = {};
                var paddingWas = window.getComputedStyle(this.scroller)[[padding]];
                var delta = this.scroller[this.origin.crossOffset] -
                            this.scroller[this.origin.crossClient];

                if (params.direction == 'h') {
                    padding = 'paddingBottom';
                } else if (params.rtl) {
                    padding = 'paddingLeft';
                }

                var numWas = parseInt(paddingWas, 10);
                if (numWas != numWas) numWas = 0;
                css[padding] = (macmsxffScrollbarSize + numWas) + 'px';
                $(this.scroller).css(css);
            }

            return this;
        },

        update: function(params) {
            if (this._disposed) {
                log('error', [
                    'Update on disposed baron instance detected.',
                    'You should clear your stored baron value for this instance:',
                    this
                ].join(' '), params);
            }
            fire.call(this, 'upd', params); 

            this.resize(1);
            this.updatePositions();

            return this;
        },

        dispose: function(params) {
            if (this._disposed) {
                log('error', [
                    'Already disposed:',
                    this
                ].join(' '), params);
            }

            manageEvents(this, this.event, 'off');
            manageAttr(this.root, params.direction, 'off');
            if (params.direction == 'v') {
                this._setCrossSizes(this.scroller, '');
            } else {
                this._setCrossSizes(this.clipper, '');
            }
            this._dumbCss(false);
            this.barOn(true);
            fire.call(this, 'dispose');
            this._disposed = true;
        },

        on: function(eventName, func, arg) {
            var names = eventName.split(' ');

            for (var i = 0 ; i < names.length ; i++) {
                if (names[i] == 'init') {
                    func.call(this, arg);
                } else {
                    this.events[names[i]] = this.events[names[i]] || [];

                    this.events[names[i]].push(function(userArg) {
                        func.call(this, userArg || arg);
                    });
                }
            }
        }
    };

    baron.fn.constructor.prototype = baron.fn;
    item.prototype.constructor.prototype = item.prototype;

    baron.noConflict = function() {
        window.baron = _baron; 

        return baron;
    };

    baron.version = '2.2.2';

    if ($ && $.fn) { 
        $.fn.baron = baron;
    }

    window.baron = baron; 
    if (typeof module != 'undefined') {
        module.exports = baron.noConflict();
    }
})(window);

(function(window, undefined) {
    var scopedBaron = window.baron;
    var log = function() {
        scopedBaron.fn.log.apply(this, arguments);
    };

    var fix = function(userParams) {
        var elements, viewPortSize,
            params = { 
                outside: '',
                inside: '',
                before: '',
                after: '',
                past: '',
                future: '',
                radius: 0,
                minView: 0
            },
            topFixHeights = [], 
            topRealHeights = [], 
            headerTops = [], 
            scroller = this.scroller,
            eventManager = this.event,
            $ = this.$,
            self = this;

        if (this.position != 'static') {
            log('error', [
                'Fix plugin cannot work properly in non-static baron position.',
                'See more https://github.com/Diokuz/baron/issues/135'
            ].join(' '), this.params);
        }

        function fixElement(i, pos, flag) {
            var ori = flag == 1 ? 'pos' : 'oppos';

            if (viewPortSize < (params.minView || 0)) { 
                pos = undefined;
            }

            this.$(elements[i]).css(this.origin.pos, '').css(this.origin.oppos, '').removeClass(params.outside);

            if (pos !== undefined) {
                pos += 'px';
                this.$(elements[i]).css(this.origin[ori], pos).addClass(params.outside);
            }
        }

        function bubbleWheel(e) {
            try {
                i = document.createEvent('WheelEvent'); 
                i.initWebKitWheelEvent(e.originalEvent.wheelDeltaX, e.originalEvent.wheelDeltaY);
                scroller.dispatchEvent(i);
                e.preventDefault();
            } catch (e) {}
        }

        function init(_params) {
            var pos;

            for (var key in _params) {
                params[key] = _params[key];
            }

            elements = this.$(params.elements, this.scroller);

            if (elements) {
                viewPortSize = this.scroller[this.origin.client];
                for (var i = 0 ; i < elements.length ; i++) {
                    pos = {};
                    pos[this.origin.size] = elements[i][this.origin.offset];
                    if (elements[i].parentNode !== this.scroller) {
                        this.$(elements[i].parentNode).css(pos);
                    }
                    pos = {};
                    pos[this.origin.crossSize] = elements[i].parentNode[this.origin.crossClient];
                    this.$(elements[i]).css(pos);

                    viewPortSize -= elements[i][this.origin.offset];

                    headerTops[i] = elements[i].parentNode[this.origin.offsetPos]; 

                    topFixHeights[i] = (topFixHeights[i - 1] || 0); 
                    topRealHeights[i] = (topRealHeights[i - 1] || Math.min(headerTops[i], 0));

                    if (elements[i - 1]) {
                        topFixHeights[i] += elements[i - 1][this.origin.offset];
                        topRealHeights[i] += elements[i - 1][this.origin.offset];
                    }

                    if ( !(i == 0 && headerTops[i] == 0)) {
                        this.event(elements[i], 'mousewheel', bubbleWheel, 'off');
                        this.event(elements[i], 'mousewheel', bubbleWheel);
                    }
                }

                if (params.limiter && elements[0]) { 
                    if (this.track && this.track != this.scroller) {
                        pos = {};
                        pos[this.origin.pos] = elements[0].parentNode[this.origin.offset];
                        this.$(this.track).css(pos);
                    } else {
                        this.barTopLimit = elements[0].parentNode[this.origin.offset];
                    }
                    this.scroll();
                }

                if (params.limiter === false) { 
                    this.barTopLimit = 0;
                }
            }

            var event = {
                element: elements,

                handler: function() {
                    var parent = $(this)[0].parentNode,
                        top = parent.offsetTop,
                        num;

                    for (var i = 0 ; i < elements.length ; i++ ) {
                        if (elements[i] === this) num = i;
                    }

                    var pos = top - topFixHeights[num];

                    if (params.scroll) { 
                        params.scroll({
                            x1: self.scroller.scrollTop,
                            x2: pos
                        });
                    } else {
                        self.scroller.scrollTop = pos;
                    }
                },

                type: 'click'
            };

            if (params.clickable) {
                this._eventHandlers.push(event); 
                eventManager(event.element, event.type, event.handler, 'on');
            }
        }

        this.on('init', init, userParams);

        var fixFlag = [], 
            gradFlag = [];
        this.on('init scroll', function() {
            var fixState, hTop, gradState;

            if (elements) {
                var change;

                for (var i = 0 ; i < elements.length ; i++) {
                    fixState = 0;
                    if (headerTops[i] - this.pos() < topRealHeights[i] + params.radius) {
                        fixState = 1;
                        hTop = topFixHeights[i];
                    } else if (headerTops[i] - this.pos() > topRealHeights[i] + viewPortSize - params.radius) {
                        fixState = 2;
                        hTop = this.scroller[this.origin.client] - elements[i][this.origin.offset] - topFixHeights[i] - viewPortSize;
                    } else {
                        fixState = 3;
                        hTop = undefined;
                    }

                    gradState = false;
                    if (headerTops[i] - this.pos() < topRealHeights[i] || headerTops[i] - this.pos() > topRealHeights[i] + viewPortSize) {
                        gradState = true;
                    }

                    if (fixState != fixFlag[i] || gradState != gradFlag[i]) {
                        fixElement.call(this, i, hTop, fixState);
                        fixFlag[i] = fixState;
                        gradFlag[i] = gradState;
                        change = true;
                    }
                }

                if (change) { 
                    for (i = 0 ; i < elements.length ; i++) {
                        if (fixFlag[i] == 1 && params.past) {
                            this.$(elements[i]).addClass(params.past).removeClass(params.future);
                        }

                        if (fixFlag[i] == 2 && params.future) {
                            this.$(elements[i]).addClass(params.future).removeClass(params.past);
                        }

                        if (fixFlag[i] == 3) {
                            if (params.future || params.past) this.$(elements[i]).removeClass(params.past).removeClass(params.future);
                            if (params.inside) this.$(elements[i]).addClass(params.inside);
                        } else if (params.inside) {
                            this.$(elements[i]).removeClass(params.inside);
                        }

                        if (fixFlag[i] != fixFlag[i + 1] && fixFlag[i] == 1 && params.before) {
                            this.$(elements[i]).addClass(params.before).removeClass(params.after); 
                        } else if (fixFlag[i] != fixFlag[i - 1] && fixFlag[i] == 2 && params.after) {
                            this.$(elements[i]).addClass(params.after).removeClass(params.before); 
                        } else {
                            this.$(elements[i]).removeClass(params.before).removeClass(params.after);
                        }

                        if (params.grad) {
                            if (gradFlag[i]) {
                                this.$(elements[i]).addClass(params.grad);
                            } else {
                                this.$(elements[i]).removeClass(params.grad);
                            }
                        }
                    }
                }
            }
        });

        this.on('resize upd', function(updParams) {
            init.call(this, updParams && updParams.fix);
        });
    };

    scopedBaron.fn.fix = function(params) {
        var i = 0;

        while (this[i]) {
            fix.call(this[i], params);
            i++;
        }

        return this;
    };
})(window);
(function(window) {
    var scopedBaron = window.baron;
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

    var autoUpdate = function() {
        var self = this;
        var watcher;

        if (this._au) {
            return;
        }

        function actualizeWatcher() {
            if (!self.root[self.origin.offset]) {
                startWatch();
            } else {
                stopWatch();
            }
        }

        function startWatch() {
            if (watcher) return;

            watcher = setInterval(function() {
                if (self.root[self.origin.offset]) {
                    stopWatch();
                    self.update();
                }
            }, 300); 
        }

        function stopWatch() {
            clearInterval(watcher);
            watcher = null;
        }

        var debouncedUpdater = self._debounce(function() {
            self.update();
        }, 300);

        this._observer = new MutationObserver(function() {
            actualizeWatcher();
            self.update();
            debouncedUpdater();
        });

        this.on('init', function() {
            self._observer.observe(self.root, {
                childList: true,
                subtree: true,
                characterData: true
            });

            actualizeWatcher();
        });

        this.on('dispose', function() {
            self._observer.disconnect();
            stopWatch();
            delete self._observer;
        });

        this._au = true;
    };

    scopedBaron.fn.autoUpdate = function(params) {
        if (!MutationObserver) return this;

        var i = 0;

        while (this[i]) {
            autoUpdate.call(this[i], params);
            i++;
        }

        return this;
    };
})(window);

(function(window, undefined) {
    var scopedBaron = window.baron;

    var controls = function(params) {
        var forward, backward, track, screen,
            self = this, 
            event;

        screen = params.screen || 0.9;

        if (params.forward) {
            forward = this.$(params.forward, this.clipper);

            event = {
                element: forward,

                handler: function() {
                    var y = self.pos() + (params.delta || 30);

                    self.pos(y);
                },

                type: 'click'
            };

            this._eventHandlers.push(event); 
            this.event(event.element, event.type, event.handler, 'on');
        }

        if (params.backward) {
            backward = this.$(params.backward, this.clipper);

            event = {
                element: backward,

                handler: function() {
                    var y = self.pos() - (params.delta || 30);

                    self.pos(y);
                },

                type: 'click'
            };

            this._eventHandlers.push(event); 
            this.event(event.element, event.type, event.handler, 'on');
        }

        if (params.track) {
            if (params.track === true) {
                track = this.track;
            } else {
                track = this.$(params.track, this.clipper)[0];
            }

            if (track) {
                event = {
                    element: track,

                    handler: function(e) {
                        if (e.target != track) return;

                        var x = e['offset' + self.origin.x],
                            xBar = self.bar[self.origin.offsetPos],
                            sign = 0;

                        if (x < xBar) {
                            sign = -1;
                        } else if (x > xBar + self.bar[self.origin.offset]) {
                            sign = 1;
                        }

                        var y = self.pos() + sign * screen * self.scroller[self.origin.client];
                        self.pos(y);
                    },

                    type: 'mousedown'
                };

                this._eventHandlers.push(event); 
                this.event(event.element, event.type, event.handler, 'on');
            }
        }
    };

    scopedBaron.fn.controls = function(params) {
        var i = 0;

        while (this[i]) {
            controls.call(this[i], params);
            i++;
        }

        return this;
    };
})(window);
baron.fn.log = function(level, msg, nodes) {
    var time = new Date().toString();
    var func = console[level] || console.log;
    var args = [
        'Baron [ ' + time.substr(16, 8) + ' ]: ' + msg,
        nodes
    ];

    Function.prototype.apply.call(func, console, args);
};


"use strict";


function EditorAccordion(_editor, cell_acc) {

	cell_acc.attachHTMLString($p.injected_data['tip_editor_right.html']);

	const cont = cell_acc.cell.querySelector(".editor_accordion"),

		tb_elm = new $p.iface.OTooolBar({
			wrapper: cont.querySelector("[name=header_elm]"),
			width: '100%',
			height: '28px',
			bottom: '2px',
			left: '4px',
			class_name: "",
			name: 'aling_bottom',
			buttons: [
				{name: 'left', css: 'tb_align_left', tooltip: $p.msg.align_node_left, float: 'left'},
				{name: 'bottom', css: 'tb_align_bottom', tooltip: $p.msg.align_node_bottom, float: 'left'},
				{name: 'top', css: 'tb_align_top', tooltip: $p.msg.align_node_top, float: 'left'},
				{name: 'right', css: 'tb_align_right', tooltip: $p.msg.align_node_right, float: 'left'},
				{name: 'all', text: '<i class="fa fa-arrows-alt fa-fw"></i>', tooltip: $p.msg.align_all, float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'additional_inserts', text: '<i class="fa fa-tag fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_elm, float: 'left'},
        {name: 'arc', css: 'tb_cursor-arc-r', tooltip: $p.msg.bld_arc, float: 'left'},
				{name: 'delete', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: $p.msg.del_elm, float: 'right', paddingRight: '20px'}
			],
			image_path: "dist/imgs/",
			onclick: function (name) {
        switch (name) {
          case 'arc':
            _editor.profile_radius()
            break;

          case 'additional_inserts':
            _editor.additional_inserts('elm')
            break;

          default:
            _editor.profile_align(name)
        }
			}
		}),

		tb_right = new $p.iface.OTooolBar({
			wrapper: cont.querySelector("[name=header_layers]"),
			width: '100%',
			height: '28px',
			bottom: '2px',
			left: '4px',
			class_name: "",
			name: 'right',
			image_path: 'dist/imgs/',
			buttons: [
				{name: 'new_layer', text: '<i class="fa fa-file-o fa-fw"></i>', tooltip: 'Добавить рамный контур', float: 'left'
				},
				{name: 'new_stv', text: '<i class="fa fa-file-code-o fa-fw"></i>', tooltip: $p.msg.bld_new_stv, float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'inserts_to_product', text: '<i class="fa fa-tags fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_product, float: 'left'},
        {name: 'inserts_to_contour', text: '<i class="fa fa-tag fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_contour, float: 'left'},
				{name: 'drop_layer', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить слой', float: 'right', paddingRight: '20px'}

			], onclick: function (name) {

				switch(name) {

					case 'new_stv':
						var fillings = _editor.project.getItems({class: Filling, selected: true});
						if(fillings.length)
							fillings[0].create_leaf();
						else
							$p.msg.show_msg({
								type: "alert-warning",
								text: $p.msg.bld_new_stv_no_filling,
								title: $p.msg.bld_new_stv
							});
						break;

					case 'drop_layer':
						tree_layers.drop_layer();
						break;

					case 'new_layer':

						new Contour( {parent: undefined});

						Object.getNotifier(_editor.project._noti).notify({
							type: 'rows',
							tabular: "constructions"
						});
						break;

          case 'inserts_to_product':
            _editor.additional_inserts();
            break;

          case 'inserts_to_contour':
            _editor.additional_inserts('contour');
            break;

					default:
						$p.msg.show_msg(name);
						break;
				}

				return false;
			}
		}),

    tb_bottom = new $p.iface.OTooolBar({
      wrapper: cont.querySelector("[name=header_props]"),
      width: '100%',
      height: '28px',
      bottom: '2px',
      left: '4px',
      class_name: "",
      name: 'bottom',
      image_path: 'dist/imgs/',
      buttons: [
        {name: 'refill', text: '<i class="fa fa-retweet fa-fw"></i>', tooltip: 'Обновить параметры', float: 'right', paddingRight: '20px'}

      ], onclick: function (name) {

        switch(name) {

          case 'refill':
            _editor.project._dp.sys.refill_prm(_editor.project.ox);
            props.reload();
            break;

          default:
            $p.msg.show_msg(name);
            break;
        }

        return false;
      }
    }),

		tree_layers = new function SchemeLayers() {

			var tree = new dhtmlXTreeView({
				parent: cont.querySelector("[name=content_layers]"),
				checkboxes: true,
				multiselect: false
			});

			function layer_text(layer, bounds){
				if(!bounds)
					bounds = layer.bounds;
				return (layer.parent ? "Створка №" : "Рама №") + layer.cnstr +
					(bounds ? " " + bounds.width.toFixed() + "х" + bounds.height.toFixed() : "");
			}

			function load_layer(layer){

				tree.addItem(
					layer.cnstr,
					layer_text(layer),
					layer.parent ? layer.parent.cnstr : 0);


				layer.children.forEach(function (l) {
					if(l instanceof Contour)
						load_layer(l);

				});

			}

			function observer(changes){

				var synced;

				changes.forEach(function(change){
					if ("constructions" == change.tabular){

						synced = true;

						tree.clearAll();
						_editor.project.contours.forEach(function (l) {
							load_layer(l);
							tree.checkItem(l.cnstr);
							tree.openItem(l.cnstr);

						});

						tree.addItem("sizes", "Размерные линии", 0);

						tree.addItem("visualization", "Визуализация доп. элементов", 0);

						tree.addItem("text", "Комментарии", 0);

					}
				});
			}


			this.drop_layer = function () {
				var cnstr = tree.getSelectedId(), l;
				if(cnstr){
					l = _editor.project.getItem({cnstr: Number(cnstr)});
				}else if(l = _editor.project.activeLayer){
					cnstr = l.cnstr;
				}
				if(cnstr && l){
					tree.deleteItem(cnstr);
					cnstr = l.parent ? l.parent.cnstr : 0;
					l.remove();
					setTimeout(function () {
						_editor.project.zoom_fit();
						if(cnstr)
							tree.selectItem(cnstr);
					}, 100);
				}
			};

			this.attache = function () {
				Object.observe(_editor.project._noti, observer, ["rows"]);
			};

			this.unload = function () {
				Object.unobserve(_editor.project._noti, observer);
			};

			tree.attachEvent("onCheck", function(id, state){
				var l,
					pid = tree.getParentId(id),
					sub = tree.getSubItems(id);

				if(pid && state && !tree.isItemChecked(pid)){
					if(l = _editor.project.getItem({cnstr: Number(pid)}))
						l.visible = true;
					tree.checkItem(pid);
				}

				if(l = _editor.project.getItem({cnstr: Number(id)}))
					l.visible = !!state;

				if(typeof sub == "string")
					sub = sub.split(",");
				sub.forEach(function (id) {
					state ? tree.checkItem(id) : tree.uncheckItem(id);
					if(l = _editor.project.getItem({cnstr: Number(id)}))
						l.visible = !!state;
				});

				if(pid && state && !tree.isItemChecked(pid))
					tree.checkItem(pid);

				_editor.project.register_update();

			});

			tree.attachEvent("onSelect", function(id, mode){
				if(!mode){
          return;
        }
				var contour = _editor.project.getItem({cnstr: Number(id)});
				if(contour){
					if(contour.project.activeLayer != contour){
            contour.activate(true);
          }
					cont.querySelector("[name=header_stv]").innerHTML = layer_text(contour);
				}
			});

			$p.eve.attachEvent("layer_activated", function (contour) {
				if(contour && contour.cnstr && contour.cnstr != tree.getSelectedId()){
				  if(tree.items[contour.cnstr]){
            tree.selectItem(contour.cnstr);
            cont.querySelector("[name=header_stv]").innerHTML = layer_text(contour);
          }
				}
			});

			$p.eve.attachEvent("contour_redrawed", function (contour, bounds) {

				const text = layer_text(contour, bounds);

				tree.setItemText(contour.cnstr, text);

				if(contour.project.activeLayer == contour){
          cont.querySelector("[name=header_stv]").innerHTML = text;
        }

			});

		},

		props = new (function SchemeProps(layout) {

			var _obj,
				_grid,
				_reflect_id;

			function reflect_changes() {
				_obj.len = _editor.project.bounds.width.round(0);
				_obj.height = _editor.project.bounds.height.round(0);
				_obj.s = _editor.project.area;
			}

			this.__define({

				attache: {
					value: function (obj) {

						_obj = obj;
						obj = null;

						$p.cat.clrs.selection_exclude_service($p.dp.buyers_order.metadata("clr"), _obj);

						if(_grid && _grid.destructor)
							_grid.destructor();

						var is_dialer = !$p.current_acl.role_available("СогласованиеРасчетовЗаказов") && !$p.current_acl.role_available("РедактированиеСкидок"),
							oxml = {
								"Свойства": ["sys","clr",
								{id: "len", path: "o.len", synonym: "Ширина, мм", type: "ro"},
								{id: "height", path: "o.height", synonym: "Высота, мм", type: "ro"},
								{id: "s", path: "o.s", synonym: "Площадь, м²", type: "ro"}
							]
							};

						if($p.wsql.get_user_param("hide_price_dealer")){
							oxml["Строка заказа"] = [
								"quantity",
								{id: "price", path: "o.price", synonym: "Цена", type: "ro"},
								{id: "discount_percent", path: "o.discount_percent", synonym: "Скидка %", type: is_dialer ? "ro" : "calck"},
								{id: "amount", path: "o.amount", synonym: "Сумма", type: "ro"},
								"note"
							];
						}else{
							oxml["Строка заказа"] = [
								"quantity",
								{id: "price_internal", path: "o.price_internal", synonym: "Цена дилера", type: "ro"},
								{id: "discount_percent_internal", path: "o.discount_percent_internal", synonym: "Скидка дил %", type: "calck"},
								{id: "amount_internal", path: "o.amount_internal", synonym: "Сумма дилера", type: "ro"},
								{id: "price", path: "o.price", synonym: "Цена пост", type: "ro"},
								{id: "discount_percent", path: "o.discount_percent", synonym: "Скидка пост %", type: is_dialer ? "ro" : "calck"},
								{id: "amount", path: "o.amount", synonym: "Сумма пост", type: "ro"},
								"note"
							];
						}

						_grid = layout.cells("a").attachHeadFields({
							obj: _obj,
							oxml: oxml,
							ts: "extra_fields",
							ts_title: "Свойства",
							selection: {
							  cnstr: 0,
                inset: $p.utils.blank.guid,
                hide: {not: true}
							}
						});

						_on_snapshot = $p.eve.attachEvent("scheme_snapshot", function (scheme, attr) {
							if(scheme == _editor.project && !attr.clipboard){
								["price_internal","amount_internal","price","amount"].forEach(function (fld) {
									_obj[fld] = scheme.data._calc_order_row[fld];
								});
							}
						});
					}
				},

				unload: {
					value: function () {
						layout.unload();
						_obj = null;
					}
				},

				layout: {
					get: function () {
						return layout;
					}
				},

        reload: {
				  value: function () {
            _grid.reload();
          }
        }

			});

			$p.eve.attachEvent("contour_redrawed", function () {
				if(_obj){
					if(_reflect_id)
						clearTimeout(_reflect_id);
					_reflect_id = setTimeout(reflect_changes, 100);
				}
			});


		})(new dhtmlXLayoutObject({
			parent:     cont.querySelector("[name=content_props]"),
			pattern:    "1C",
			offsets: {
				top:    0,
				right:  0,
				bottom: 0,
				left:   0
			},
			cells: [
				{
					id:             "a",
					header:         false,
					height:         330
				}
			]
		})),

		stv = new (function StvProps(layout) {

			var t = this, _grid, _evts = [];

			this.__define({

				attache: {
					value: function (obj) {

						if(!obj || !obj.cnstr || (_grid && _grid._obj === obj))
							return;

						var attr = {
							obj: obj,
							oxml: {
								"Фурнитура": ["furn", "clr_furn", "direction", "h_ruch"],
								"Параметры": []
							},
							ts: "params",
							ts_title: "Параметры",
							selection: {
							  cnstr: obj.cnstr || -9999,
                inset: $p.utils.blank.guid,
                hide: {not: true}
							}
						};

						if(!_grid){
              _grid = layout.cells("a").attachHeadFields(attr);
            }else{
              _grid.attach(attr);
            }

						if(!obj.parent){
							var rids = _grid.getAllRowIds();
							if(rids)
								_grid.closeItem(rids.split(",")[0]);
						}

						setTimeout(t.set_sizes, 200);
					}
				},

				set_sizes: {

					value: function (do_reload) {
						if(do_reload)
							_grid.reload();
						layout.base.style.height = (Math.max(_grid.rowsBuffer.length, 10) + 1) * 22 + "px";
						layout.setSizes();
						_grid.objBox.style.width = "100%";
					}
				},

				unload: {
					value: function () {
						_evts.forEach(function (eid) {
							$p.eve.detachEvent(eid);
						});
						layout.unload();
					}
				},

				layout: {
					get: function () {
						return layout;
					}
				}

			});

			_evts.push($p.eve.attachEvent("layer_activated", this.attache));
			_evts.push($p.eve.attachEvent("furn_changed", this.set_sizes));

		})(
      new dhtmlXLayoutObject({
        parent: cont.querySelector("[name=content_stv]"),
        pattern: "1C",
        offsets: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        cells: [
          {
            id: "a",
            header: false,
            height: 200
          }
        ]
      })

    );


	this.unload = function () {
		tb_elm.unload();
		tb_right.unload();
		tree_layers.unload();
		props.unload();
		stv.unload();
	};

	this.attache = function (obj) {
		tree_layers.attache();
		props.attache(obj);
	};

	this.resize_canvas = function () {
		var scroller = $(cont, '.scroller').baron();
		scroller.update();
		this.elm.setSizes();
		props.layout.setSizes();
		stv.layout.setSizes();
	};

	this.elm = new dhtmlXLayoutObject({
		parent:     cont.querySelector("[name=content_elm]"),
		pattern:    "1C",
		offsets: {
			top:    0,
			right:  0,
			bottom: 0,
			left:   0
		},
		cells: [
			{
				id:             "a",
				header:         false,
				height:         200
			}
		]
	});

	this.header_stv = cont.querySelector("[name=header_stv]");
	this.header_props = cont.querySelector("[name=header_props]");

	baron({
		cssGuru: true,
		root: cont,
		scroller: '.scroller',
		bar: '.scroller__bar',
		barOnCls: 'baron'
	}).fix({
		elements: '.header__title',
		outside: 'header__title_state_fixed',
		before: 'header__title_position_top',
		after: 'header__title_position_bottom',
		clickable: true
	});

}


function Clipbrd(_editor) {

	var fakecb = {
		clipboardData: {
			types: ['text/plain'],
			json: '{a: 0}',
			getData: function () {
				return this.json;
			}
		}
	};

	function onpaste(e) {
		var _scheme = _editor.project;

		if(!e)
			e = fakecb;

		if(!_scheme.ox.empty()){

			if(e.clipboardData.types.indexOf('text/plain') == -1)
				return;

			try{
				var data = JSON.parse(e.clipboardData.getData('text/plain'));
				e.preventDefault();
			}catch(e){
				return;
			}

		}
	}

	function oncopy(e) {

		if(e.target && ["INPUT","TEXTAREA"].indexOf(e.target.tagName) != -1)
			return;

		var _scheme = _editor.project;
		if(!_scheme.ox.empty()){

			var sitems = [];
			_scheme.selectedItems.forEach(function (el) {
				if(el.parent instanceof Profile)
					el = el.parent;
				if(el instanceof BuilderElement && sitems.indexOf(el) == -1)
					sitems.push(el);
			});

			var res = {
				sys: {
					ref: _scheme._dp.sys.ref,
					presentation: _scheme._dp.sys.presentation
				},

				clr: {
					ref: _scheme.clr.ref,
					presentation: _scheme.clr.presentation
				},

				calc_order: {
					ref: _scheme.ox.calc_order.ref,
					presentation: _scheme.ox.calc_order.presentation
				}
			};
			if(sitems.length){
				res.product = {
					ref: _scheme.ox.ref,
					presentation: _scheme.ox.presentation
				};
				res.items = [];
				sitems.forEach(function (el) {
					res.items.push({
						elm: el.elm,
						elm_type: el._row.elm_type.name,
						inset: {
							ref: el.inset.ref,
							presentation: el.inset.presentation
						},
						clr: {
							ref: el.clr.ref,
							presentation: el.clr.presentation
						},
						path_data: el.path.pathData,
						x1: el.x1,
						x2: el.x2,
						y1: el.y1,
						y2: el.y2
					});
				});

			}else{
				_editor.project.save_coordinates({
					snapshot: true,
					clipboard: true,
					callback: function (scheme) {
						res.product = {}._mixin(scheme.ox._obj, [], ["extra_fields","glasses","specification","predefined_name"]);
					}
				});
			}
			fakecb.clipboardData.json = JSON.stringify(res, null, '\t');

			e.clipboardData.setData('text/plain', fakecb.clipboardData.json);
			e.preventDefault();
		}
	}

	this.copy = function () {
		document.execCommand('copy');
	};

	this.paste = function () {
		onpaste();
	};

	$p.eve.attachEvent("scheme_snapshot", function (scheme, attr) {
		if(scheme == _editor.project && attr.clipboard){
			attr.callback(scheme);
		}
	});

	document.addEventListener('copy', oncopy);

	document.addEventListener('paste', onpaste);
}


class Editor extends paper.PaperScope {

  constructor(pwnd, attr){

    super();

    const _editor = this;

    _editor.activate();

    consts.tune_paper(_editor.settings);

    _editor.__define({

      _pwnd: {
        get: function () {
          return pwnd;
        }
      },

      _layout: {
        value: pwnd.attachLayout({
          pattern: "2U",
          cells: [{
            id: "a",
            text: "Изделие",
            header: false
          }, {
            id: "b",
            text: "Инструменты",
            collapsed_text: "Инструменты",
            width: (pwnd.getWidth ? pwnd.getWidth() : pwnd.cell.offsetWidth) > 1200 ? 360 : 240
          }],
          offsets: { top: 28, right: 0, bottom: 0, left: 0}
        })
      },

      _wrapper: {
        value: document.createElement('div')
      },

      _dxw: {
        get: function () {
          return this._layout.dhxWins;
        }
      }

    });

    _editor._layout.cells("a").attachObject(_editor._wrapper);
    _editor._dxw.attachViewportTo(_editor._wrapper);

    _editor._wrapper.oncontextmenu = function (event) {
      event.preventDefault();
      return $p.iface.cancel_bubble(event);
    };


    _editor._drawSelectionBounds = 0;

    _editor._clipbrd = new Clipbrd(this);

    _editor._keybrd = new Keybrd(this);

    _editor._undo = new UndoRedo(this);

    _editor._acc = new EditorAccordion(_editor, _editor._layout.cells("b"));

    _editor.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '16px', left: '3px', name: 'left', height: '300px',
      image_path: 'dist/imgs/',
      buttons: [
        {name: 'select_node', css: 'tb_icon-arrow-white', title: $p.injected_data['tip_select_node.html']},
        {name: 'pan', css: 'tb_icon-hand', tooltip: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
        {name: 'zoom_fit', css: 'tb_cursor-zoom', tooltip: 'Вписать в окно'},
        {name: 'pen', css: 'tb_cursor-pen-freehand', tooltip: 'Добавить профиль'},
        {name: 'lay_impost', css: 'tb_cursor-lay-impost', tooltip: 'Вставить раскладку или импосты'},
        {name: 'arc', css: 'tb_cursor-arc-r', tooltip: 'Арка {Crtl}, {Alt}, {Пробел}'},
        {name: 'ruler', css: 'tb_ruler_ui', tooltip: 'Позиционирование и сдвиг'},
        {name: 'grid', css: 'tb_grid', tooltip: 'Таблица координат'},
        {name: 'line', css: 'tb_line', tooltip: 'Произвольная линия'},
        {name: 'text', css: 'tb_text', tooltip: 'Произвольный текст'}
      ],
      onclick: function (name) {
        return _editor.select_tool(name);
      },
      on_popup: function (popup, bdiv) {
        popup.show(dhx4.absLeft(bdiv), 0, bdiv.offsetWidth, _editor._wrapper.offsetHeight);
        popup.p.style.top = (dhx4.absTop(bdiv) - 20) + "px";
        popup.p.querySelector(".dhx_popup_arrow").style.top = "20px";
      }
    });

    _editor.tb_top = new $p.iface.OTooolBar({wrapper: _editor._layout.base, width: '100%', height: '28px', top: '0px', left: '0px', name: 'top',
      image_path: 'dist/imgs/',
      buttons: [

        {name: 'save_close', text: '&nbsp;<i class="fa fa-floppy-o fa-fw"></i>', tooltip: 'Рассчитать, записать и закрыть', float: 'left', width: '34px'},
        {name: 'calck', text: '<i class="fa fa-calculator fa-fw"></i>&nbsp;', tooltip: 'Рассчитать и записать данные', float: 'left'},

        {name: 'sep_0', text: '', float: 'left'},
        {name: 'stamp', img: 'stamp.png', tooltip: 'Загрузить из типового блока или заказа', float: 'left'},

        {name: 'sep_1', text: '', float: 'left'},
        {name: 'copy', text: '<i class="fa fa-clone fa-fw"></i>', tooltip: 'Скопировать выделенное', float: 'left'},
        {name: 'paste', text: '<i class="fa fa-clipboard fa-fw"></i>', tooltip: 'Вставить', float: 'left'},
        {name: 'paste_prop', text: '<i class="fa fa-paint-brush fa-fw"></i>', tooltip: 'Применить скопированные свойства', float: 'left'},

        {name: 'sep_2', text: '', float: 'left'},
        {name: 'back', text: '<i class="fa fa-undo fa-fw"></i>', tooltip: 'Шаг назад', float: 'left'},
        {name: 'rewind', text: '<i class="fa fa-repeat fa-fw"></i>', tooltip: 'Шаг вперед', float: 'left'},

        {name: 'sep_3', text: '', float: 'left'},
        {name: 'open_spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию изделия', float: 'left'},

        {name: 'close', text: '<i class="fa fa-times fa-fw"></i>', tooltip: 'Закрыть без сохранения', float: 'right'}


      ], onclick: function (name) {
        switch(name) {

          case 'save_close':
            if(_editor.project)
              _editor.project.save_coordinates({save: true, close: true});
            break;

          case 'close':
            if(pwnd._on_close)
              pwnd._on_close();
            _editor.select_tool('select_node');
            break;

          case 'calck':
            if(_editor.project)
              _editor.project.save_coordinates({save: true});
            break;

          case 'stamp':
            _editor.load_stamp();
            break;

          case 'new_stv':
            var fillings = _editor.project.getItems({class: Filling, selected: true});
            if(fillings.length)
              fillings[0].create_leaf();
            break;

          case 'back':
            _editor._undo.back();
            break;

          case 'rewind':
            _editor._undo.rewind();
            break;

          case 'copy':
            _editor._clipbrd.copy();
            break;

          case 'paste':
            _editor._clipbrd.paste();
            break;

          case 'paste_prop':
            $p.msg.show_msg(name);
            break;

          case 'open_spec':
            _editor.project.ox.form_obj()
              .then(function (w) {
                w.wnd.maximize();
              });
            break;

          case 'square':
            $p.msg.show_msg(name);
            break;

          case 'triangle1':
            $p.msg.show_msg(name);
            break;

          case 'triangle3':
            $p.msg.show_msg(name);
            break;

          case 'triangle3':
            $p.msg.show_msg(name);
            break;

          default:
            $p.msg.show_msg(name);
            break;
        }
      }});

    _editor._layout.base.style.backgroundColor = "#f5f5f5";
    _editor.tb_top.cell.style.background = "transparent";
    _editor.tb_top.cell.style.boxShadow = "none";


    $p.eve.attachEvent("characteristic_saved", function (scheme, attr) {
      if(scheme == _editor.project && attr.close && pwnd._on_close)
        setTimeout(pwnd._on_close);
    });

    $p.eve.attachEvent("scheme_changed", function (scheme) {
      if(scheme == _editor.project){
        if(attr.set_text && scheme._calc_order_row)
          attr.set_text(scheme.ox.prod_name(true) + " " + (scheme.ox._modified ? " *" : ""));
      }
    });



    new function ZoomFit() {

      var tool = new paper.Tool();
      tool.options = {name: 'zoom_fit'};
      tool.on({
        activate: function () {
          _editor.project.zoom_fit();

          var previous = _editor.tb_left.get_selected();

          if(previous)
            return _editor.select_tool(previous.replace("left_", ""));
        }
      });

      return tool;
    };

    new ToolSelectNode();

    new ToolPan();

    new ToolArc();

    new ToolPen();

    new ToolLayImpost();

    new ToolText();

    new ToolRuler();

    this.tools[1].activate();


    (function () {

      var _canvas = document.createElement('canvas'); 
      _editor._wrapper.appendChild(_canvas);
      _canvas.style.backgroundColor = "#f9fbfa";

      var _scheme = new Scheme(_canvas),
        pwnd_resize_finish = function(){
          _editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
          _editor._acc.resize_canvas();
        };


      _editor._layout.attachEvent("onResizeFinish", pwnd_resize_finish);
      _editor._layout.attachEvent("onPanelResizeFinish", pwnd_resize_finish);
      _editor._layout.attachEvent("onCollapse", pwnd_resize_finish);
      _editor._layout.attachEvent("onExpand", pwnd_resize_finish);

      if(_editor._pwnd instanceof  dhtmlXWindowsCell)
        _editor._pwnd.attachEvent("onResizeFinish", pwnd_resize_finish);

      pwnd_resize_finish();

      var _mousepos = document.createElement('div');
      _editor._wrapper.appendChild(_mousepos);
      _mousepos.className = "mousepos";
      _scheme.view.on('mousemove', function (event) {
        var bounds = _scheme.bounds;
        if(bounds)
          _mousepos.innerHTML = "x:" + (event.point.x - bounds.x).toFixed(0) +
            " y:" + (bounds.height + bounds.y - event.point.y).toFixed(0);
      });

      var pan_zoom = new function StableZoom(){

        function changeZoom(oldZoom, delta) {
          var factor;
          factor = 1.05;
          if (delta < 0) {
            return oldZoom * factor;
          }
          if (delta > 0) {
            return oldZoom / factor;
          }
          return oldZoom;
        }

        var panAndZoom = this;

        dhtmlxEvent(_canvas, "mousewheel", function(evt) {
          var mousePosition, newZoom, offset, viewPosition, _ref1;
          if (evt.shiftKey || evt.ctrlKey) {
            if(evt.shiftKey && !evt.deltaX){
              _editor.view.center = panAndZoom.changeCenter(_editor.view.center, evt.deltaY, 0, 1);
            }
            else{
              _editor.view.center = panAndZoom.changeCenter(_editor.view.center, evt.deltaX, evt.deltaY, 1);
            }

            return evt.preventDefault();

          }else if (evt.altKey) {
            mousePosition = new paper.Point(evt.offsetX, evt.offsetY);
            viewPosition = _editor.view.viewToProject(mousePosition);
            _ref1 = panAndZoom.changeZoom(_editor.view.zoom, evt.deltaY, _editor.view.center, viewPosition);
            newZoom = _ref1[0];
            offset = _ref1[1];
            _editor.view.zoom = newZoom;
            _editor.view.center = _editor.view.center.add(offset);
            evt.preventDefault();
            return _editor.view.draw();
          }
        });

        this.changeZoom = function(oldZoom, delta, c, p) {
          var a, beta, newZoom, pc;
          newZoom = changeZoom.call(this, oldZoom, delta);
          beta = oldZoom / newZoom;
          pc = p.subtract(c);
          a = p.subtract(pc.multiply(beta)).subtract(c);
          return [newZoom, a];
        };

        this.changeCenter = function(oldCenter, deltaX, deltaY, factor) {
          var offset;
          offset = new paper.Point(deltaX, -deltaY);
          offset = offset.multiply(factor);
          return oldCenter.add(offset);
        };
      };

      _editor._acc.attache(_editor.project._dp);

    })();

  }


  canvas_cursor(name) {
    for(var p in this.projects){
      var _scheme = this.projects[p];
      for(var i=0; i<_scheme.view.element.classList.length; i++){
        var class_name = _scheme.view.element.classList[i];
        if(class_name == name)
          return;
        else if((/\bcursor-\S+/g).test(class_name))
          _scheme.view.element.classList.remove(class_name);
      }
      _scheme.view.element.classList.add(name);
    }
  }

  select_tool(name) {
    for(var t in this.tools){
      if(this.tools[t].options.name == name)
        return this.tools[t].activate();
    }
  }

  open(ox) {
    if(ox)
      this.project.load(ox);
  }

  load_stamp(confirmed){

    if(!confirmed && this.project.ox.coordinates.count()){
      dhtmlx.confirm({
        title: $p.msg.bld_from_blocks_title,
        text: $p.msg.bld_from_blocks,
        cancel: $p.msg.cancel,
        callback: function(btn) {
          if(btn)
            this.load_stamp(true);
        }.bind(this)
      });
      return;
    }

    $p.cat.characteristics.form_selection_block(null, {
      on_select: this.project.load_stamp.bind(this.project)
    });
  }

  segments_in_rect(rect) {
    var segments = [];

    function checkPathItem(item) {
      if (item._locked || !item._visible || item._guide)
        return;
      var children = item.children || [];
      if (!rect.intersects(item.bounds))
        return;
      if (item instanceof paper.Path) {

        if(item.parent instanceof ProfileItem){
          if(item != item.parent.generatrix)
            return;

          for (var i = 0; i < item.segments.length; i++) {
            if (rect.contains(item.segments[i].point))
              segments.push(item.segments[i]);
          }
        }

      } else {
        for (var j = children.length-1; j >= 0; j--)
          checkPathItem(children[j]);
      }
    }

    this.project.getItems({class: Contour}).forEach(checkPathItem);

    return segments;
  }

  purge_selection(){
    const deselect = [];
    let selected = this.project.selectedItems;

    for (var i = 0; i < selected.length; i++) {
      var path = selected[i];
      if(path.parent instanceof ProfileItem && path != path.parent.generatrix)
        deselect.push(path);
    }

    while(selected = deselect.pop()){
      selected.selected = false;
    }
  }

  capture_selection_state() {

    const originalContent = [];

    this.project.selectedItems.forEach((item) => {
      if (item instanceof paper.Path && !item.guide){
        originalContent.push({
          id: item.id,
          json: item.exportJSON({asString: false}),
          selectedSegments: []
        });
      }
    });

    return originalContent;
  }

  restore_selection_state(originalContent) {

    originalContent.forEach((orig) => {
      const item = this.project.getItem({id: orig.id});
      if (item){
        const id = item.id;
        item.importJSON(orig.json);
        item._id = id;
      }
    })
  }

  paths_intersecting_rect(rect) {

    const paths = [];
    const boundingRect = new paper.Path.Rectangle(rect);

    this.project.getItems({class: ProfileItem}).forEach((item) => {
      if (rect.contains(item.generatrix.bounds)) {
        paths.push(item.generatrix);
        return;
      }
    });

    boundingRect.remove();

    return paths;
  }

  drag_rect(p1, p2) {
    const {view} = this;
    const half = new paper.Point(0.5 / view.zoom, 0.5 / view.zoom);
    const start = p1.add(half);
    const end = p2.add(half);
    const rect = new paper.CompoundPath();

    rect.moveTo(start);
    rect.lineTo(new paper.Point(start.x, end.y));
    rect.lineTo(end);
    rect.moveTo(start);
    rect.lineTo(new paper.Point(end.x, start.y));
    rect.lineTo(end);
    rect.strokeColor = 'black';
    rect.strokeWidth = 1.0 / view.zoom;
    rect.dashOffset = 0.5 / view.zoom;
    rect.dashArray = [1.0 / view.zoom, 1.0 / view.zoom];
    rect.removeOn({
      drag: true,
      up: true
    });
    rect.guide = true;
    return rect;
  }


  additional_inserts(cnstr){

    var caption = $p.msg.additional_inserts,
      meta_fields = $p.cat.characteristics.metadata("inserts").fields._clone();

    if(!cnstr){
      cnstr = 0;
      caption+= ' в изделие';
      meta_fields.inset.choice_params[0].path = ["Изделие"];

    }else if(cnstr == 'elm'){
      cnstr = this.project.selected_elm;
      if(cnstr){
        this.project.ox.add_inset_params(cnstr.inset, -cnstr.elm, $p.utils.blank.guid);
        caption+= ' элем. №' + cnstr.elm;
        cnstr = -cnstr.elm;
        meta_fields.inset.choice_params[0].path = ["Элемент"];

      }else{
        return;
      }

    }else if(cnstr == 'contour'){
      cnstr = this.project.activeLayer.cnstr
      caption+= ' в контур №' + cnstr;
      meta_fields.inset.choice_params[0].path = ["МоскитнаяСетка", "Контур"];

    }

    var options = {
      name: 'additional_inserts',
      wnd: {
        caption: caption,
        allow_close: true,
        width: 360,
        height: 420,
        modal: true
      }
    };

    var wnd = $p.iface.dat_blank(null, options.wnd);

    wnd.elmnts.layout = wnd.attachLayout({
      pattern: "2E",
      cells: [{
        id: "a",
        text: "Вставки",
        header: false,
        height: 160
      }, {
        id: "b",
        text: "Параметры",
        header: false
      }],
      offsets: { top: 0, right: 0, bottom: 0, left: 0}
    });

    wnd.elmnts.grids.inserts = wnd.elmnts.layout.cells("a").attachTabular({
      obj: this.project.ox,
      ts: "inserts",
      selection: {cnstr: cnstr},
      metadata: meta_fields,
      ts_captions: {
        fields: ["inset", "clr"],
        headers: "Вставка,Цвет",
        widths: "*,*",
        min_widths: "100,100",
        aligns: "",
        sortings: "na,na",
        types: "ref,ref"
      }
    });

    wnd.elmnts.grids.params = wnd.elmnts.layout.cells("b").attachHeadFields({
      obj: this.project.ox,
      ts: "params",
      selection: {cnstr: cnstr, inset: $p.utils.blank.guid},
      oxml: {
        "Параметры": []
      },
      ts_title: "Параметры"
    });

    function refill_prms(){
      var row = wnd.elmnts.grids.inserts.get_cell_field();
      wnd.elmnts.grids.params.selection = {cnstr: cnstr, inset: row.obj.inset};
    }
    wnd.elmnts.grids.inserts.attachEvent("onRowSelect", refill_prms);
    wnd.elmnts.grids.inserts.attachEvent("onEditCell", function (stage, rId, cInd) {
      if(!cInd){
        setTimeout(refill_prms)
      }
    });
  }

  profile_radius(){

    var elm = this.project.selected_elm;
    if(elm instanceof ProfileItem){

      var options = {
        name: 'profile_radius',
        wnd: {
          caption: $p.msg.bld_arc,
          allow_close: true,
          width: 360,
          height: 180,
          modal: true
        }
      };

      var wnd = $p.iface.dat_blank(null, options.wnd);

      wnd.elmnts.grids.radius = wnd.attachHeadFields({
        obj: elm,
        oxml: {
          " ": ["r", "arc_ccw"]
        }
      });

    }else{
      $p.msg.show_msg({
        type: "alert-info",
        text: $p.msg.arc_invalid_elm,
        title: $p.msg.bld_arc
      });
    }
  }

  profile_align(name){

    if(name == "all"){

      if(this.glass_align()){
        return
      }

      const layer = this.project.rootLayer();

      layer.profiles.forEach(function (profile) {

        if(profile.angle_hor % 90 == 0)
          return;

        var mid;

        if(profile.orientation == $p.enm.orientations.vert){

          mid = profile.b.x + profile.e.x / 2;

          if(mid < layer.bounds.center.x)
            profile.x1 = profile.x2 = Math.min(profile.x1, profile.x2);
          else
            profile.x1 = profile.x2 = Math.max(profile.x1, profile.x2);

        }else if(profile.orientation == $p.enm.orientations.hor){

          mid = profile.b.y + profile.e.y / 2;

          if(mid < layer.bounds.center.y)
            profile.y1 = profile.y2 = Math.max(profile.y1, profile.y2);
          else
            profile.y1 = profile.y2 = Math.min(profile.y1, profile.y2);

        }

      });


    }else{

      var profiles = this.project.selected_profiles(),
        contours = [], changed;

      profiles.forEach(function (profile) {

        if(profile.angle_hor % 90 == 0)
          return;

        changed = true;

        var minmax = {min: {}, max: {}};

        minmax.min.x = Math.min(profile.x1, profile.x2);
        minmax.min.y = Math.min(profile.y1, profile.y2);
        minmax.max.x = Math.max(profile.x1, profile.x2);
        minmax.max.y = Math.max(profile.y1, profile.y2);
        minmax.max.dx = minmax.max.x - minmax.min.x;
        minmax.max.dy = minmax.max.y - minmax.min.y;

        if(name == 'left' && minmax.max.dx < minmax.max.dy){
          if(profile.x1 - minmax.min.x > 0)
            profile.x1 = minmax.min.x;
          if(profile.x2 - minmax.min.x > 0)
            profile.x2 = minmax.min.x;

        }else if(name == 'right' && minmax.max.dx < minmax.max.dy){
          if(profile.x1 - minmax.max.x < 0)
            profile.x1 = minmax.max.x;
          if(profile.x2 - minmax.max.x < 0)
            profile.x2 = minmax.max.x;

        }else if(name == 'top' && minmax.max.dx > minmax.max.dy){
          if(profile.y1 - minmax.max.y < 0)
            profile.y1 = minmax.max.y;
          if(profile.y2 - minmax.max.y < 0)
            profile.y2 = minmax.max.y;

        }else if(name == 'bottom' && minmax.max.dx > minmax.max.dy) {
          if (profile.y1 - minmax.min.y > 0)
            profile.y1 = minmax.min.y;
          if (profile.y2 - minmax.min.y > 0)
            profile.y2 = minmax.min.y;

        }else if(name == 'delete') {
          profile.removeChildren();
          profile.remove();

        }else
          $p.msg.show_msg({type: "info", text: $p.msg.align_invalid_direction});

      });

      if(changed || profiles.length > 1){
        profiles.forEach(function (p) {
          if(contours.indexOf(p.layer) == -1)
            contours.push(p.layer);
        });
        contours.forEach(function (l) {
          l.clear_dimentions();
        });
      }

      if(name != 'delete' && profiles.length > 1){

        if(changed){
          this.project.register_change(true);
          setTimeout(this.profile_group_align.bind(this, name, profiles), 100);

        }else
          this.profile_group_align(name);

      }else if(changed)
        this.project.register_change(true);
    }

  }

  profile_group_align(name, profiles) {

    let	coordin = name == 'left' || name == 'bottom' ? Infinity : 0;

    if(!profiles){
      profiles = this.project.selected_profiles();
    }

    if(!profiles.length){
      return
    }

    profiles.forEach(function (p) {
      switch (name){
        case 'left':
          if(p.x1 < coordin)
            coordin = p.x1;
          if(p.x2 < coordin)
            coordin = p.x2;
          break;
        case 'bottom':
          if(p.y1 < coordin)
            coordin = p.y1;
          if(p.y2 < coordin)
            coordin = p.y2;
          break;
        case 'top':
          if(p.y1 > coordin)
            coordin = p.y1;
          if(p.y2 > coordin)
            coordin = p.y2;
          break;
        case 'right':
          if(p.x1 > coordin)
            coordin = p.x1;
          if(p.x2 > coordin)
            coordin = p.x2;
          break;
      }
    });

    profiles.forEach(function (p) {
      switch (name){
        case 'left':
        case 'right':
          p.x1 = p.x2 = coordin;
          break;
        case 'bottom':
        case 'top':
          p.y1 = p.y2 = coordin;
          break;
      }
    });

  }

  do_glass_align(name = 'auto', glasses) {

    const shift = [];

    if(!glasses){
      glasses = this.project.selected_glasses();
    }

    if(glasses.length < 2){
      return
    }

    let layer;

    if(glasses.some((glass) => {
        const gl = this.project.rootLayer(glass.layer);
        if(!layer){
          layer = gl;
        }
        else if(layer != gl){
          $p.msg.show_msg({
            type: "alert-info",
            text: "Заполнения принадлежат разным рамным контурам",
            title: "Выравнивание"
          });
          return true
        }
      })){
      return
    }

    if(name == 'auto'){
      name = 'width'
    }

    const orientation = name == 'width' ? $p.enm.orientations.vert : $p.enm.orientations.hor;
    layer.imposts.forEach((impost) => {
      if(impost.orientation == orientation){
        shift.push(impost)
      }
    })

    glasses = glasses.map((glass) => {
      const {bounds, profiles} = glass;
      const res = {
        glass,
        width: bounds.width,
        height: bounds.height,
      }
      profiles.forEach((curr) => {
        const profile = curr.profile.nearest() || curr.profile;
        if(shift.indexOf(profile) != -1){
          const point = curr.b.add(curr.e).divide(2);
          if(name == 'width'){
            if(point.x < bounds.center.x){
              res.left = profile
            }
            else{
              res.right = profile
            }
          }
          else{
            if(point.y < bounds.center.y){
              res.top = profile
            }
            else{
              res.bottom = profile
            }
          }
        }
      });
      return res;
    })

    shift.forEach((impost, index) => {
      const res = {impost, dx: [], dy: []};
      glasses.forEach((curr) => {
        if(curr.left == impost || curr.right == impost){
          res.dx.push(curr)
        }
        else if(curr.top == impost || curr.bottom == impost){
          res.dy.push(curr)
        }
      })
      shift[index] = res
    })

    const res = []
    shift.forEach((curr) => {

      let medium = 0;
      let delta = 0;

      if (name == 'width') {
        curr.dx.forEach((glass) => {
          medium += glass.width
        });
        medium = medium / curr.dx.length;
        curr.dx.forEach((glass) => {
          if(glass.right == curr.impost){
            delta += (medium - glass.width) / (1.3 * curr.dx.length)
          }
          else if(glass.left == curr.impost){
            delta += (glass.width - medium) / (1.3 * curr.dx.length)
          }
        });
        delta = new paper.Point([delta,0])
      }
      else {

        delta = new paper.Point([0, delta])
      }

      if(delta.length){
        curr.impost.move_points(delta, true);
      }
      res.push(delta)
    })

    return res;
  }
  glass_align(name = 'auto', glasses) {

    const shift = this.do_glass_align(name, glasses);
    const {data} = this.project;

    if(!data._align_counter){
      data._align_counter = 1;
    }
    if(data._align_counter > 12){
      data._align_counter = 0;
      return
    }

    if(!shift){
      return
    }

    if(shift.some((delta) => {
      return delta.length > 0.8
      })){

      data._align_counter+= 1;

      this.project.contours.forEach((l) => {
        l.redraw();
      });

      return this.glass_align(name, glasses);
    }
    else{
      data._align_counter = 0;
    }

  }


  clear_selection_bounds() {
    if (this._selectionBoundsShape) {
      this._selectionBoundsShape.remove();
    }
    this._selectionBoundsShape = null;
  }

  hide_selection_bounds() {
    if (this._drawSelectionBounds > 0)
      this._drawSelectionBounds--;
    if (this._drawSelectionBounds == 0) {
      if (this._selectionBoundsShape)
        this._selectionBoundsShape.visible = false;
    }
  }

  unload() {

    if(this.tool && this.tool._callbacks.deactivate.length)
      this.tool._callbacks.deactivate[0].call(this.tool);

    for(var t in this.tools){
      if(this.tools[t].remove)
        this.tools[t].remove();
      this.tools[t] = null;
    }

    this.tb_left.unload();
    this.tb_top.unload();
    this._acc.unload();

  }

}


$p.Editor = Editor;



(function (msg){

  msg.additional_inserts = "Доп. вставки";
	msg.align_node_right = "Уравнять вертикально вправо";
	msg.align_node_bottom = "Уравнять горизонтально вниз";
	msg.align_node_top = "Уравнять горизонтально вверх";
	msg.align_node_left = "Уравнять вертикально влево";
	msg.align_set_right = "Установить размер сдвигом правых элементов";
	msg.align_set_bottom = "Установить размер сдвигом нижних элементов";
	msg.align_set_top = "Установить размер сдвигом верхних элементов";
	msg.align_set_left = "Установить размер сдвигом левых элементов";
	msg.align_all = "Установить прямые углы или уравнять по заполнениям";
	msg.align_invalid_direction = "Неприменимо для элемента с данной ориентацией";

	msg.bld_constructor = "Конструктор объектов графического построителя";
	msg.bld_title = "Графический построитель";
	msg.bld_empty_param = "Не заполнен обязательный параметр <br />";
	msg.bld_not_product = "В текущей строке нет изделия построителя";
	msg.bld_not_draw = "Отсутствует эскиз или не указана система профилей";
	msg.bld_not_sys = "Не указана система профилей";
	msg.bld_from_blocks_title = "Выбор типового блока";
	msg.bld_from_blocks = "Текущее изделие будет заменено конфигурацией типового блока. Продолжить?";
	msg.bld_split_imp = "В параметрах продукции<br />'%1'<br />запрещены незамкнутые контуры<br />" +
		"Для включения деления импостом,<br />установите это свойство в 'Истина'";

	msg.bld_new_stv = "Добавить створку";
	msg.bld_new_stv_no_filling = "Перед добавлением створки, укажите заполнение,<br />в которое поместить створку";
  msg.bld_arc = "Радиус сегмента профиля";
  msg.arc_invalid_elm = "Укажите профиль на эскизе";

	msg.del_elm = "Удалить элемент";

  msg.to_contour = "в контур";
  msg.to_elm = "в элемент";
  msg.to_product = "в изделие";

	msg.ruler_elm = "Расстояние между элементами";
	msg.ruler_node = "Расстояние между узлами";
	msg.ruler_new_line = "Добавить размерную линию";

	msg.ruler_base = "По опорным линиям";
	msg.ruler_inner = "По внутренним линиям";
	msg.ruler_outer = "По внешним линиям";



})($p.msg);


class Keybrd {

  constructor(_editor){

  }

}


class UndoRedo {

  constructor(_editor) {

    this._editor = _editor;
    this._history = [];
    this._pos = -1;

    $p.eve.attachEvent("scheme_changed", this.scheme_changed.bind(this));

    $p.eve.attachEvent("editor_closed", this.clear.bind(this));

    $p.eve.attachEvent("scheme_snapshot", this.scheme_snapshot.bind(this));

  }

  run_snapshot() {

    if (this._pos >= 0) {

      if (this._pos > 0 && this._pos < (this._history.length - 1)) {
        this._history.splice(this._pos, this._history.length - this._pos - 1);
      }

      this._editor.project.save_coordinates({snapshot: true, clipboard: false});

    }

  }

  scheme_snapshot(scheme, attr) {
    if (scheme == this._editor.project && !attr.clipboard) {
      this.save_snapshot(scheme);
    }
  }

  scheme_changed(scheme, attr) {

    if (scheme == this._editor.project) {

      if (scheme.data._loading) {
        if (!scheme.data._snapshot) {
          this.clear();
          this.save_snapshot(scheme);
        }

      } else {
        if (this._snap_timer)
          clearTimeout(this._snap_timer);
        this._snap_timer = setTimeout(this.run_snapshot.bind(this), 700);
        this.enable_buttons();
      }
    }

  }

  save_snapshot(scheme) {
    this._history.push(JSON.stringify({}._mixin(scheme.ox._obj, [], ["extra_fields", "glasses", "specification", "predefined_name"])));
    this._pos = this._history.length - 1;
    this.enable_buttons();
  }

  apply_snapshot() {
    this._editor.project.load_stamp(JSON.parse(this._history[this._pos]), true);
    this.enable_buttons();
  }

  enable_buttons() {
    if (this._pos < 1)
      this._editor.tb_top.buttons.back.classList.add("disabledbutton");
    else
      this._editor.tb_top.buttons.back.classList.remove("disabledbutton");

    if (this._pos < (this._history.length - 1))
      this._editor.tb_top.buttons.rewind.classList.remove("disabledbutton");
    else
      this._editor.tb_top.buttons.rewind.classList.add("disabledbutton");

  }

  clear() {
    this._history.length = 0;
    this._pos = -1;
  }

  back() {
    if (this._pos > 0)
      this._pos--;
    if (this._pos >= 0)
      this.apply_snapshot();
    else
      this.enable_buttons();
  }

  rewind() {
    if (this._pos <= (this._history.length - 1)) {
      this._pos++;
      this.apply_snapshot();
    }
  }

}



class GlassSegment {

  constructor(profile, b, e, outer) {

    this.profile = profile;
    this.b = b.clone();
    this.e = e.clone();
    this.outer = !!outer;

    this.segment();

  }

  segment() {

    let gen;

    if(this.profile.children.some((addl) => {

        if(addl instanceof ProfileAddl && this.outer == addl.outer){

          if(!gen){
            gen = this.profile.generatrix;
          }

          const b = this.profile instanceof ProfileAddl ? this.profile.b : this.b;
          const e = this.profile instanceof ProfileAddl ? this.profile.e : this.e;


          if(b.is_nearest(gen.getNearestPoint(addl.b), true) && e.is_nearest(gen.getNearestPoint(addl.e), true)){
            this.profile = addl;
            this.outer = false;
            return true;
          }
        }
      })){

      this.segment();
    }

  }
}

function Contour(attr){

	this._noti = {};

  this._notifier = Object.getNotifier(this._noti);

  this._layers = {};


	if(attr.row){
    this._row = attr.row;
  }
	else{
	  const {constructions} = paper.project.ox;
    this._row = constructions.add({ parent: attr.parent ? attr.parent.cnstr : 0 });
    this._row.cnstr = constructions.aggregate([], ["cnstr"], "MAX") + 1;
	}


  Contour.superclass.constructor.call(this);

  if(attr.parent){
    this.parent = attr.parent;
  }


	if(this.cnstr){

		const {coordinates} = paper.project.ox;

		coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.profiles}}, (row) => {

      const profile = new Profile({row: row, parent: this});

			coordinates.find_rows({cnstr: row.cnstr, parent: {in: [row.elm, -row.elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => {
				new ProfileAddl({row: row,	parent: profile});
			});

		});

		coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.glasses}}, (row) => {
			new Filling({row: row,	parent: this});
		});

		coordinates.find_rows({cnstr: this.cnstr, elm_type: $p.enm.elm_types.Текст}, (row) => {

			if(row.elm_type == $p.enm.elm_types.Текст){
				new FreeText({row: row, parent: this.l_text});
			}
		});

	}

}
Contour._extend(paper.Layer);

Contour.prototype.__define({

  cnstr: {
    get : function(){
      return this._row.cnstr;
    },
    set : function(v){
      this._row.cnstr = v;
    }
  },

  notify: {
    value: function (obj) {
      this._notifier.notify(obj);
      this.project.register_change();
    }
  },

	activate: {
		value: function(custom) {
			this.project._activeLayer = this;
			$p.eve.callEvent("layer_activated", [this, !custom]);
			this.project.register_update();
		}
	},

  remove: {
	  value: function () {

      const {children, _row} = this;
      while(children.length){
        children[0].remove();
      }

      const {ox} = this.project;
      ox.coordinates.find_rows({cnstr: this.cnstr}).forEach(function (row) {
        ox.coordinates.del(row._row);
      });

      if(ox === _row._owner._owner){
        _row._owner.del(_row);
      }
      this._row = null;

      Contour.superclass.remove.call(this);
    }
  },

  path: {
    get : function(){
      return this.bounds;
    },
    set : function(attr){

      if(Array.isArray(attr)){

        const noti = {type: consts.move_points, profiles: [], points: []};
        const {outer_nodes} = this;

        let need_bind = attr.length,
          available_bind = outer_nodes.length,
          elm, curr;

        if(need_bind){
          for(var i in attr){
            curr = attr[i];             
            for(var j in outer_nodes){
              elm = outer_nodes[j];   
              if(elm.data.binded)
                continue;
              if(curr.profile.is_nearest(elm)){
                elm.data.binded = true;
                curr.binded = true;
                need_bind--;
                available_bind--;
                if(!curr.b.is_nearest(elm.b)){
                  elm.rays.clear(true);
                  elm.b = curr.b;
                  if(noti.profiles.indexOf(elm) == -1){
                    noti.profiles.push(elm);
                    noti.points.push(elm.b);
                  }
                }

                if(!curr.e.is_nearest(elm.e)){
                  elm.rays.clear(true);
                  elm.e = curr.e;
                  if(noti.profiles.indexOf(elm) == -1){
                    noti.profiles.push(elm);
                    noti.points.push(elm.e);
                  }
                }

                break;
              }
            }
          }
        }

        if(need_bind){
          for(var i in attr){
            curr = attr[i];
            if(curr.binded)
              continue;
            for(var j in outer_nodes){
              elm = outer_nodes[j];
              if(elm.data.binded)
                continue;
              if(curr.b.is_nearest(elm.b, true) || curr.e.is_nearest(elm.e, true)){
                elm.data.binded = true;
                curr.binded = true;
                need_bind--;
                available_bind--;
                elm.rays.clear(true);
                elm.b = curr.b;
                elm.e = curr.e;
                if(noti.profiles.indexOf(elm) == -1){
                  noti.profiles.push(elm);
                  noti.points.push(elm.b);
                  noti.points.push(elm.e);
                }
                break;
              }
            }
          }
        }

        if(need_bind && available_bind){
          for(var i in attr){
            curr = attr[i];
            if(curr.binded)
              continue;
            for(var j in outer_nodes){
              elm = outer_nodes[j];
              if(elm.data.binded)
                continue;
              elm.data.binded = true;
              curr.binded = true;
              need_bind--;
              available_bind--;
              elm.rays.clear(true);
              elm.b = curr.b;
              elm.e = curr.e;
              if(noti.profiles.indexOf(elm) == -1){
                noti.profiles.push(elm);
                noti.points.push(elm.b);
                noti.points.push(elm.e);
              }
              break;
            }
          }
        }

        if(need_bind){
          for(var i in attr){
            curr = attr[i];
            if(curr.binded)
              continue;
            elm = new Profile({
              generatrix: curr.profile.generatrix.get_subpath(curr.b, curr.e),
              proto: outer_nodes.length ? outer_nodes[0] : {
                  parent: this,
                  clr: this.project.default_clr()
                }
            });
            curr.profile = elm;
            if(curr.outer)
              delete curr.outer;
            curr.binded = true;

            elm.data.binded = true;
            elm.data.simulated = true;

            noti.profiles.push(elm);
            noti.points.push(elm.b);
            noti.points.push(elm.e);

            need_bind--;
          }
        }

        if(available_bind){
          outer_nodes.forEach(function (elm) {
            if(!elm.data.binded){
              elm.rays.clear(true);
              elm.remove();
              available_bind--;
            }
          });
        }

        if(noti.points.length){
          this.notify(noti);
        }

        this.profiles.forEach((p) => {
          if(p.nearest()){
            p.inset = p.project.default_inset({
              elm_type: p.elm_type,
              pos: p.pos,
              inset: p.inset
            });
          }
        });
        this.data._bounds = null;
      }
    },
    enumerable : true
  },

	profiles: {
		get: function(){
      return this.children.filter((elm) => elm instanceof Profile);
		}
	},

	imposts: {
		get: function(){
      return this.getItems({class: Profile}).filter((elm) => {
        return elm.rays.b.is_tt || elm.rays.e.is_tt || elm.rays.b.is_i || elm.rays.e.is_i;
      });
		}
	},

	glasses: {
		value: function (hide, glass_only) {
			return this.children.filter((elm) => {
        if((!glass_only && elm instanceof Contour) || elm instanceof Filling) {
          if(hide){
            elm.visible = false;
          }
          return true;
        }
      });
		}
	},

  contours: {
    get: function () {
      return this.children.filter((elm) => elm instanceof Contour);
    }
  },

	bounds: {
		get: function () {

      const {data} = this;

			if(!data._bounds || !data._bounds.width || !data._bounds.height){

				const {profiles} = this;

				if(profiles.length && profiles[0].path){

          profiles.forEach((profile) => {
            data._bounds = data._bounds ? data._bounds.unite(profile.path.bounds) : profile.path.bounds
          });

					if(!data._bounds.width || !data._bounds.height){
            profiles.forEach((profile) => {
              data._bounds = data._bounds.unite(profile.generatrix.bounds)
            });
					}
				}
				else{
          data._bounds = new paper.Rectangle();
				}
			}

			return data._bounds;
		}
	},

	dimension_bounds: {

		get: function(){
			let bounds = this.bounds;
			this.getItems({class: DimensionLineCustom}).forEach((dl) => {
				bounds = bounds.unite(dl.bounds);
			});
			return bounds;
		}
	},

	redraw: {
		value: function(on_redrawed){

			if(!this.visible){
        return on_redrawed ? on_redrawed() : undefined;
      }

			let llength = 0;

			function on_child_contour_redrawed(){
				llength--;
				if(!llength && on_redrawed)
					on_redrawed();
			}

			this.data._bounds = null;

			if(!this.project.data._saving && this.l_visualization._by_spec){
        this.l_visualization._by_spec.removeChildren();
      }

      this.profiles.forEach((elm) => {
				elm.redraw();
			});

      this.glass_recalc();

      this.glasses(false, true).forEach((glass) => {
				glass.redraw_onlay();
			});

      this.draw_opening();

      this.children.forEach((child_contour) => {
				if (child_contour instanceof Contour){
					llength++;
					child_contour.redraw(on_child_contour_redrawed);
				}
			});

			$p.eve.callEvent("contour_redrawed", [this, this.data._bounds]);

			if(!llength && on_redrawed){
        on_redrawed();
      }

		}
	},

	save_coordinates: {
		value: function () {

			this.glasses(false, true).forEach(function (glass) {
				if(!glass.visible)
					glass.remove();
			});

			this.children.forEach(function (elm) {
				if(elm.save_coordinates){
					elm.save_coordinates();

				}else if(elm instanceof paper.Group && (elm == elm.layer.l_text || elm == elm.layer.l_dimensions)){
					elm.children.forEach(function (elm) {
						if(elm.save_coordinates)
							elm.save_coordinates();
					});
				}
			});

			this._row.x = this.bounds ? this.bounds.width : 0;
			this._row.y = this.bounds? this.bounds.height : 0;
			this._row.is_rectangular = this.is_rectangular;
			if(this.parent){
				this._row.w = this.w;
				this._row.h = this.h;
			}else{
				this._row.w = 0;
				this._row.h = 0;
			}
		}
	},

	profile_by_nodes: {
		value: function (n1, n2, point) {
			var profiles = this.profiles, g;
			for(var i = 0; i < profiles.length; i++){
				g = profiles[i].generatrix;
				if(g.getNearestPoint(n1).is_nearest(n1) && g.getNearestPoint(n2).is_nearest(n2)){
					if(!point || g.getNearestPoint(point).is_nearest(point))
						return p;
				}
			}
		}
	},

	outer_nodes: {
		get: function(){
			return this.outer_profiles.map(function (v) {
				return v.elm;
			});
		}
	},

	outer_profiles: {
		get: function(){
			var profiles = this.profiles,
				to_remove = [], res = [], elm, findedb, findede;

			for(var i=0; i<profiles.length; i++){
				elm = profiles[i];
				if(elm.data.simulated)
					continue;
				findedb = false;
				findede = false;
				for(var j=0; j<profiles.length; j++){
					if(profiles[j] == elm)
						continue;
					if(!findedb && elm.has_cnn(profiles[j], elm.b) && elm.b.is_nearest(profiles[j].e))
						findedb = true;
					if(!findede && elm.has_cnn(profiles[j], elm.e) && elm.e.is_nearest(profiles[j].b))
						findede = true;
				}
				if(!findedb || !findede)
					to_remove.push(elm);
			}
			for(var i=0; i<profiles.length; i++){
				elm = profiles[i];
				if(to_remove.indexOf(elm) != -1)
					continue;
				elm.data.binded = false;
				res.push({
					elm: elm,
					profile: elm.nearest(),
					b: elm.b,
					e: elm.e
				});
			}
			return res;
		}
	},

	nodes: {
		get: function(){
			var findedb, findede, nodes = [];

			this.profiles.forEach(function (p) {
				findedb = false;
				findede = false;
				nodes.forEach(function (n) {
					if(p.b.is_nearest(n))
						findedb = true;
					if(p.e.is_nearest(n))
						findede = true;
				});
				if(!findedb)
					nodes.push(p.b.clone());
				if(!findede)
					nodes.push(p.e.clone());
			});

			return nodes;
		}
	},

	glass_segments: {
		get: function(){
			var profiles = this.profiles,
				is_flap = !!this.parent,
				nodes = [];

			profiles.forEach(function (p) {

				const ip = p.joined_imposts(),
					gen = p.generatrix,
					pb = p.cnn_point("b"),
					pe = p.cnn_point("e"),
          fn_sort = (a, b) => {
            const da = gen.getOffsetOf(a.point),
              db = gen.getOffsetOf(b.point);

            if (da < db){
              return -1;
            }
            else if (da > db){
              return 1;
            }
            return 0;
          };

				let pbg, peg;

				if(is_flap && pb.is_t)
					pbg = pb.profile.generatrix.getNearestPoint(p.b);
				else
					pbg = p.b;

				if(is_flap && pe.is_t)
					peg = pe.profile.generatrix.getNearestPoint(p.e);
				else
					peg = p.e;

				if(ip.inner.length){

				  ip.inner.sort(fn_sort);

					if(!pb.is_i){
            nodes.push(new GlassSegment(p, pbg, ip.inner[0].point));
          }

					for(let i = 1; i < ip.inner.length; i++){
            nodes.push(new GlassSegment(p, ip.inner[i-1].point, ip.inner[i].point));
          }

					if(!pe.is_i){
            nodes.push(new GlassSegment(p, ip.inner[ip.inner.length-1].point, peg));
          }

				}
				if(ip.outer.length){

					ip.outer.sort(fn_sort);

					if(!pb.is_i){
            nodes.push(new GlassSegment(p, ip.outer[0].point, pbg, true));
          }

					for(let i = 1; i < ip.outer.length; i++){
            nodes.push(new GlassSegment(p, ip.outer[i].point, ip.outer[i-1].point, true));
          }

					if(!pe.is_i){
            nodes.push(new GlassSegment(p, peg, ip.outer[ip.outer.length-1].point, true));
          }
				}
				if(!ip.inner.length){
					if(!pb.is_i && !pe.is_i){
            nodes.push(new GlassSegment(p, pbg, peg));
          }
				}
				if(!ip.outer.length && (pb.is_cut || pe.is_cut || pb.is_t || pe.is_t)){
					if(!pb.is_i && !pe.is_i){
            nodes.push(new GlassSegment(p, peg, pbg, true));
          }
				}
			});

			return nodes;
		}
	},

	glass_contours: {
		get: function(){
			const segments = this.glass_segments;
      const res = [];
			let curr, acurr;

			function find_next(curr){
				if(!curr.anext){
					curr.anext = [];
					segments.forEach((segm) => {
						if(segm == curr || segm.profile == curr.profile)
							return;
						if(curr.e.is_nearest(segm.b) && curr.profile.has_cnn(segm.profile, segm.b)){

							if(curr.e.subtract(curr.b).getDirectedAngle(segm.e.subtract(segm.b)) >= 0)
								curr.anext.push(segm);
						}

					});
				}
				return curr.anext;
			}

			function go_go(segm){
				const anext = find_next(segm);
				for(let i = 0; i < anext.length; i++){
					if(anext[i] == curr){
            return anext;
          }
					else if(acurr.every((el) => el != anext[i] )){
						acurr.push(anext[i]);
						return go_go(anext[i]);
					}
				}
			}

			while(segments.length){

				curr = segments[0];
				acurr = [curr];
				if(go_go(curr) && acurr.length > 1){
					res.push(acurr);
				}

				acurr.forEach((el) => {
					const ind = segments.indexOf(el);
					if(ind != -1){
            segments.splice(ind, 1);
          }
				});
			}

			return res;

		}
	},

	glass_recalc: {
		value: function () {

			const _contour = this;
      const contours = _contour.glass_contours;
      const glasses = _contour.glasses(true);

			function bind_glass(glass_contour){

				let rating = 0, glass, crating, cglass, glass_nodes, glass_path_center;

				for(let g in glasses){

					glass = glasses[g];
					if(glass.visible){
            continue;
          }

					crating = 0;
					glass_nodes = glass.outer_profiles;
					if(glass_nodes.length){
						for(let j = 0; j < glass_contour.length; j++){
							for(let i = 0; i < glass_nodes.length; i++){
								if(glass_contour[j].profile == glass_nodes[i].profile &&
									glass_contour[j].b.is_nearest(glass_nodes[i].b) &&
									glass_contour[j].e.is_nearest(glass_nodes[i].e)){

									crating++;
									break;
								}
							}
							if(crating > 2)
								break;
						}
					}
					else{
						glass_nodes = glass.nodes;
						for(let j = 0; j < glass_contour.length; j++){
							for(let i = 0; i < glass_nodes.length; i++){
								if(glass_contour[j].b.is_nearest(glass_nodes[i])){
									crating++;
									break;
								}
							}
							if(crating > 2){
                break;
              }
						}
					}

					if(crating > rating || !cglass){
						rating = crating;
						cglass = glass;
					}
					if(crating == rating && cglass != glass){
						if(!glass_path_center){
							glass_path_center = glass_contour[0].b;
							for(let i=1; i<glass_contour.length; i++){
                glass_path_center = glass_path_center.add(glass_contour[i].b);
              }
							glass_path_center = glass_path_center.divide(glass_contour.length);
						}
						if(glass_path_center.getDistance(glass.bounds.center, true) < glass_path_center.getDistance(cglass.bounds.center, true)){
              cglass = glass;
            }
					}
				}

				if(cglass || (cglass = _contour.getItem({class: Filling, visible: false}))) {
					cglass.path = glass_contour;
					cglass.visible = true;
					if (cglass instanceof Filling) {
						cglass.sendToBack();
						cglass.path.visible = true;
					}
				}else{
					if(glass = _contour.getItem({class: Filling})){

					}
					else if(glass = _contour.project.getItem({class: Filling})){

					}
					else{

					}
					cglass = new Filling({proto: glass, parent: _contour, path: glass_contour});
					cglass.sendToBack();
					cglass.path.visible = true;
				}
			}

			contours.forEach(bind_glass);

		}
	},

	glass_nodes: {
		value: function (path, nodes, bind) {

			var curve_nodes = [], path_nodes = [],
				ipoint = path.interiorPoint.negate(),
				i, curve, findedb, findede,
				d, d1, d2, node1, node2;

			if(!nodes)
				nodes = this.nodes;

			if(bind){
				path.data.curve_nodes = curve_nodes;
				path.data.path_nodes = path_nodes;
			}

			for(i in path.curves){
				curve = path.curves[i];

				d1 = 10e12; d2 = 10e12;
				nodes.forEach(function (n) {
					if((d = n.getDistance(curve.point1, true)) < d1){
						d1 = d;
						node1 = n;
					}
					if((d = n.getDistance(curve.point2, true)) < d2){
						d2 = d;
						node2 = n;
					}
				});

				if(path_nodes.indexOf(node1) == -1)
					path_nodes.push(node1);
				if(path_nodes.indexOf(node2) == -1)
					path_nodes.push(node2);

				if(!bind)
					continue;

				if(node1 == node2)
					continue;
				findedb = false;
				for(var n in curve_nodes){
					if(curve_nodes[n].node1 == node1 && curve_nodes[n].node2 == node2){
						findedb = true;
						break;
					}
				}
				if(!findedb){
					findedb = this.profile_by_nodes(node1, node2);
					var loc1 = findedb.generatrix.getNearestLocation(node1),
						loc2 = findedb.generatrix.getNearestLocation(node2);
					if(node1.add(ipoint).getDirectedAngle(node2.add(ipoint)) < 0)
						curve_nodes.push({node1: node2, node2: node1, profile: findedb, out: loc2.index == loc1.index ? loc2.parameter > loc1.parameter : loc2.index > loc1.index});
					else
						curve_nodes.push({node1: node1, node2: node2, profile: findedb, out: loc1.index == loc2.index ? loc1.parameter > loc2.parameter : loc1.index > loc2.index});
				}
			}

			this.sort_nodes(curve_nodes);

			return path_nodes;
		}
	},

	sort_nodes: {
		value: function (nodes) {
			if(!nodes.length)
				return nodes;
			var prev = nodes[0], res = [prev], curr, couner = nodes.length + 1;
			while (res.length < nodes.length && couner){
				couner--;
				for(var i = 0; i < nodes.length; i++){
					curr = nodes[i];
					if(res.indexOf(curr) != -1)
						continue;
					if(prev.node2 == curr.node1){
						res.push(curr);
						prev = curr;
						break;
					}
				}
			}
			if(couner){
				nodes.length = 0;
				for(var i = 0; i < res.length; i++)
					nodes.push(res[i]);
				res.length = 0;
			}
		}
	},

	_metadata: {
		get : function(){
			var t = this,
				_xfields = t.project.ox._metadata.tabular_sections.constructions.fields; 

			return {
				fields: {
					furn: _xfields.furn,
					clr_furn: _xfields.clr_furn,
					direction: _xfields.direction,
					h_ruch: _xfields.h_ruch
				},
				tabular_sections: {
					params: t.project.ox._metadata.tabular_sections.params
				}
			};
		}
	},

	_manager: {
		get: function () {
			return this.project._dp._manager;
		}
	},

	params: {
		get: function () {
			return this.project.ox.params;
		}
	},

	furn: {
		get: function () {
			return this._row.furn;
		},
		set: function (v) {

			if(this._row.furn == v)
				return;

			this._row.furn = v;

			if(this.direction.empty()){
				this.project._dp.sys.furn_params.find_rows({
					param: $p.job_prm.properties.direction
				}, function (row) {
					this.direction = row.value;
					return false;
				}.bind(this._row));
			}

			if(this.clr_furn.empty()){
				this.project.ox.constructions.find_rows({clr_furn: {not: $p.cat.clrs.get()}}, function (row) {
					this.clr_furn = row.clr_furn;
					return false;
				}.bind(this._row));
			}
			if(this.clr_furn.empty()){
				this._row.furn.colors.each(function (row) {
					this.clr_furn = row.clr;
					return false;
				}.bind(this._row));
			}

			this._row.furn.refill_prm(this);

			this.project.register_change(true);

			setTimeout($p.eve.callEvent.bind($p.eve, "furn_changed", [this]));

		}
	},

	clr_furn: {
		get: function () {
			return this._row.clr_furn;
		},
		set: function (v) {
			this._row.clr_furn = v;
			this.project.register_change();
		}
	},

	direction: {
		get: function () {
			return this._row.direction;
		},
		set: function (v) {
			this._row.direction = v;
			this.project.register_change(true);
		}
	},

	h_ruch: {
		get: function () {
			return this._row.h_ruch;
		},
		set: function (v) {
			this._row.h_ruch = v;
			this.project.register_change();
		}
	},

	profiles_by_side: {
		value: function (side) {
			const {profiles, bounds} = this;
      const res = {};
      const ares = [];

			function by_side(name) {
				ares.sort(function (a, b) {
					return a[name] - b[name];
				});
				res[name] = ares[0].profile;
			}

			if(profiles.length){

				profiles.forEach((profile) => {
					ares.push({
						profile: profile,
						left: Math.abs(profile.b.x + profile.e.x - bounds.left * 2),
						top: Math.abs(profile.b.y + profile.e.y - bounds.top * 2),
						bottom: Math.abs(profile.b.y + profile.e.y - bounds.bottom * 2),
						right: Math.abs(profile.b.x + profile.e.x - bounds.right * 2)
					});
				});

				if(side){
					by_side(side);
					return res[side];
				}

				["left","top","bottom","right"].forEach(by_side);
			}

			return res;

		}
	},

	profile_by_furn_side: {
		value: function (side, cache) {

			if(!cache){
        cache = {
          profiles: this.outer_nodes,
          bottom: this.profiles_by_side("bottom")
        };
      }

      const profile_node = this.direction == $p.enm.open_directions.Правое ? "b" : "e";
      const other_node = profile_node == "b" ? "e" : "b";

      let profile = cache.bottom;

      const next = () => {
					side--;
					if(side <= 0){
            return profile;
          }

					cache.profiles.some((curr) => {
						if(curr[other_node].is_nearest(profile[profile_node])){
							profile = curr;
							return true;
						}
					});

					return next();
				};

			return next();

		}
	},

	is_rectangular: {
		get : function(){
			return (this.side_count != 4) || !this.profiles.some(function (profile) {
				return !(profile.is_linear() && Math.abs(profile.angle_hor % 90) < 1);
			});
		}
	},

	side_count: {
		get : function(){
			return this.profiles.length;
		}
	},

	w: {
		get : function(){
			if(!this.is_rectangular)
				return 0;

			var profiles = this.profiles_by_side();
			return this.bounds ? this.bounds.width - profiles.left.nom.sizefurn - profiles.right.nom.sizefurn : 0;
		}
	},

	h: {
		get : function(){
			if(!this.is_rectangular)
				return 0;

			var profiles = this.profiles_by_side();
			return this.bounds ? this.bounds.height - profiles.top.nom.sizefurn - profiles.bottom.nom.sizefurn : 0;
		}
	},

	pos: {
		get: function () {

		}
	},

	is_pos: {
		value: function (pos) {

			if(this.project.contours.count == 1 || this.parent){
        return true;
      }

			let res = Math.abs(this.bounds[pos] - this.project.bounds[pos]) < consts.sticking_l;

			if(!res){
				if(pos == "top"){
					var rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.topRight.add([0, -200]));
				}else if(pos == "left"){
					var rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.bottomLeft.add([-200, 0]));
				}else if(pos == "right"){
					var rect = new paper.Rectangle(this.bounds.topRight, this.bounds.bottomRight.add([200, 0]));
				}else if(pos == "bottom"){
					var rect = new paper.Rectangle(this.bounds.bottomLeft, this.bounds.bottomRight.add([0, 200]));
				}

				res = !this.project.contours.some(function (l) {
					return l != this && rect.intersects(l.bounds);
				}.bind(this));
			}

			return res;

		}
	},

  l_text: {
    get: function () {
      const {_layers} = this;
      return _layers.text || (_layers.text = new paper.Group({ parent: this }));
    }
  },

  l_visualization: {
    get: function () {
      const {_layers} = this;
      return _layers.visualization || (_layers.visualization = new paper.Group({ parent: this, guide: true }));
    }
  },

  l_dimensions: {
    get: function () {
      const {_layers} = this;
      if(!_layers.dimensions){
        _layers.dimensions = new paper.Group({ parent: this });
        _layers.dimensions.bringToFront();
      }
      return _layers.dimensions;
    }
  },

	draw_opening: {
		value: function () {

      const _contour = this;
      const {l_visualization, furn} = this;

			if(!this.parent || !$p.enm.open_types.is_opening(furn.open_type)){
				if(l_visualization._opening && l_visualization._opening.visible)
					l_visualization._opening.visible = false;
				return;
			}

      const cache = {
        profiles: this.outer_nodes,
        bottom: this.profiles_by_side("bottom")
      };

			function rotary_folding() {

        const {_opening} = l_visualization;
        const {side_count} = _contour;

				furn.open_tunes.forEach((row) => {

					if(row.rotation_axis){
						const axis = _contour.profile_by_furn_side(row.side, cache);
            const other = _contour.profile_by_furn_side(
								row.side + 2 <= side_count ? row.side + 2 : row.side - 2, cache);

						_opening.moveTo(axis.corns(3));
						_opening.lineTo(other.rays.inner.getPointAt(other.rays.inner.length / 2));
						_opening.lineTo(axis.corns(4));

					}
				});
			}

			function sliding() {
        const {center} = _contour.bounds;
        const {_opening} = l_visualization;

        if(_contour.direction == $p.enm.open_directions.Правое) {
          _opening.moveTo(center.add([-100,0]));
          _opening.lineTo(center.add([100,0]));
          _opening.moveTo(center.add([30,30]));
          _opening.lineTo(center.add([100,0]));
          _opening.lineTo(center.add([30,-30]));
        }
        else {
          _opening.moveTo(center.add([100,0]));
          _opening.lineTo(center.add([-100,0]));
          _opening.moveTo(center.add([-30,30]));
          _opening.lineTo(center.add([-100,0]));
          _opening.lineTo(center.add([-30,-30]));
        }
			}

			if(!l_visualization._opening){
        l_visualization._opening = new paper.CompoundPath({
          parent: _contour.l_visualization,
          strokeColor: 'black'
        });
      }
			else{
        l_visualization._opening.removeChildren();
      }

      return furn.is_sliding ? sliding() : rotary_folding();

		}
	},

	draw_visualization: {
		value: function () {


			var profiles = this.profiles,
				l_vis = this.l_visualization;

			if(l_vis._by_spec)
				l_vis._by_spec.removeChildren();
			else
				l_vis._by_spec = new paper.Group({ parent: l_vis });

			this.project.ox.specification.find_rows({dop: -1}, function (row) {

				profiles.some(function (elm) {
					if(row.elm == elm.elm){

						row.nom.visualization.draw(elm, l_vis, row.len * 1000);

						return true;
					}
				});
			});

			this.children.forEach(function(l) {
				if(l instanceof Contour)
					l.draw_visualization();
			});

		}
	},

  perimeter: {
    get: function () {
      var res = [], tmp;
      this.outer_profiles.forEach(function (curr) {
        res.push(tmp = curr.sub_path ? {
          len: curr.sub_path.length,
          angle: curr.e.subtract(curr.b).angle
        } : {
            len: curr.elm.length,
            angle: curr.elm.angle_hor
          });
        if(tmp.angle < 0)
          tmp.angle += 360;
      });
      return res;
    }
  },

	draw_sizes: {

		value: function () {

			this.children.forEach(function (l) {
				if(l instanceof Contour)
					l.draw_sizes();
			});

			if(!this.parent){


				var ihor = [], ivert = [], i;

				this.imposts.forEach(function (elm) {
					if(elm.orientation == $p.enm.orientations.hor)
						ihor.push(elm);
					else if(elm.orientation == $p.enm.orientations.vert)
						ivert.push(elm);
				});

				if(ihor.length || ivert.length){

					var by_side = this.profiles_by_side(),

						imposts_dimensions = function(arr, collection, i, pos, xy, sideb, sidee) {

							var offset = (pos == "right" || pos == "bottom") ? -130 : 90;

							if(i == 0 && !collection[i]){
								collection[i] = new DimensionLine({
									pos: pos,
									elm1: sideb,
									p1: sideb.b[xy] > sideb.e[xy] ? "b" : "e",
									elm2: arr[i],
									p2: arr[i].b[xy] > arr[i].e[xy] ? "b" : "e",
									parent: this.l_dimensions,
									offset: offset,
									impost: true
								});
							}

							if(i >= 0 && i < arr.length-1 && !collection[i+1]){

								collection[i+1] = new DimensionLine({
									pos: pos,
									elm1: arr[i],
									p1: arr[i].b[xy] > arr[i].e[xy] ? "b" : "e",
									elm2: arr[i+1],
									p2: arr[i+1].b[xy] > arr[i+1].e[xy] ? "b" : "e",
									parent: this.l_dimensions,
									offset: offset,
									impost: true
								});

							}

							if(i == arr.length-1 && !collection[arr.length]){

								collection[arr.length] = new DimensionLine({
									pos: pos,
									elm1: arr[i],
									p1: arr[i].b[xy] > arr[i].e[xy] ? "b" : "e",
									elm2: sidee,
									p2: sidee.b[xy] > sidee.e[xy] ? "b" : "e",
									parent: this.l_dimensions,
									offset: offset,
									impost: true
								});

							}

						}.bind(this),

						purge = function (arr, asizes, xy) {

							var adel = [];
							arr.forEach(function (elm) {

								if(asizes.indexOf(elm.b[xy].round(0)) != -1 && asizes.indexOf(elm.e[xy].round(0)) != -1)
									adel.push(elm);

								else if(asizes.indexOf(elm.b[xy].round(0)) == -1)
									asizes.push(elm.b[xy].round(0));

								else if(asizes.indexOf(elm.e[xy].round(0)) == -1)
									asizes.push(elm.e[xy].round(0));

							});

							adel.forEach(function (elm) {
								arr.splice(arr.indexOf(elm), 1);
							});
							adel.length = 0;

							return arr;
						};

					var asizes = [this.bounds.top.round(0), this.bounds.bottom.round(0)];
					purge(ihor, asizes, "y").sort(function (a, b) {
						return b.b.y + b.e.y - a.b.y - a.e.y;
					});
					asizes = [this.bounds.left.round(0), this.bounds.right.round(0)];
					purge(ivert, asizes, "x").sort(function (a, b) {
						return a.b.x + a.e.x - b.b.x - b.e.x;
					});


					if(!this.l_dimensions.ihor)
						this.l_dimensions.ihor = {};
					for(i = 0; i< ihor.length; i++){

						if(this.is_pos("right"))
							imposts_dimensions(ihor, this.l_dimensions.ihor, i, "right", "x", by_side.bottom, by_side.top);

						else if(this.is_pos("left"))
							imposts_dimensions(ihor, this.l_dimensions.ihor, i, "left", "x", by_side.bottom, by_side.top);

					}

					if(!this.l_dimensions.ivert)
						this.l_dimensions.ivert = {};
					for(i = 0; i< ivert.length; i++){

						if(this.is_pos("bottom"))
							imposts_dimensions(ivert, this.l_dimensions.ivert, i, "bottom", "y", by_side.left, by_side.right);

						else if(this.is_pos("top"))
							imposts_dimensions(ivert, this.l_dimensions.ivert, i, "top", "y", by_side.left, by_side.right);

					}
				}


				if (this.project.contours.length > 1) {

					if(this.is_pos("left") && !this.is_pos("right") && this.project.bounds.height != this.bounds.height){
						if(!this.l_dimensions.left){
							this.l_dimensions.left = new DimensionLine({
								pos: "left",
								parent: this.l_dimensions,
								offset: ihor.length ? 220 : 90,
								contour: true
							});
						}else
							this.l_dimensions.left.offset = ihor.length ? 220 : 90;

					}else{
						if(this.l_dimensions.left){
							this.l_dimensions.left.remove();
							this.l_dimensions.left = null;
						}
					}

					if(this.is_pos("right") && this.project.bounds.height != this.bounds.height){
						if(!this.l_dimensions.right){
							this.l_dimensions.right = new DimensionLine({
								pos: "right",
								parent: this.l_dimensions,
								offset: ihor.length ? -260 : -130,
								contour: true
							});
						}else
							this.l_dimensions.right.offset = ihor.length ? -260 : -130;

					}else{
						if(this.l_dimensions.right){
							this.l_dimensions.right.remove();
							this.l_dimensions.right = null;
						}
					}

					if(this.is_pos("top") && !this.is_pos("bottom") && this.project.bounds.width != this.bounds.width){
						if(!this.l_dimensions.top){
							this.l_dimensions.top = new DimensionLine({
								pos: "top",
								parent: this.l_dimensions,
								offset: ivert.length ? 220 : 90,
								contour: true
							});
						}else
							this.l_dimensions.top.offset = ivert.length ? 220 : 90;
					}else{
						if(this.l_dimensions.top){
							this.l_dimensions.top.remove();
							this.l_dimensions.top = null;
						}
					}

					if(this.is_pos("bottom") && this.project.bounds.width != this.bounds.width){
						if(!this.l_dimensions.bottom){
							this.l_dimensions.bottom = new DimensionLine({
								pos: "bottom",
								parent: this.l_dimensions,
								offset: ivert.length ? -260 : -130,
								contour: true
							});
						}else
							this.l_dimensions.bottom.offset = ivert.length ? -260 : -130;

					}else{
						if(this.l_dimensions.bottom){
							this.l_dimensions.bottom.remove();
							this.l_dimensions.bottom = null;
						}
					}

				}
			}

			this.l_dimensions.children.forEach(function (dl) {
				if(dl.redraw)
					dl.redraw();
			});

		}
	},

	clear_dimentions: {

		value: function () {
			for(var key in this.l_dimensions.ihor){
				this.l_dimensions.ihor[key].removeChildren();
				this.l_dimensions.ihor[key].remove();
				delete this.l_dimensions.ihor[key];
			}
			for(var key in this.l_dimensions.ivert){
				this.l_dimensions.ivert[key].removeChildren();
				this.l_dimensions.ivert[key].remove();
				delete this.l_dimensions.ivert[key];
			}
			if(this.l_dimensions.bottom){
				this.l_dimensions.bottom.removeChildren();
				this.l_dimensions.bottom.remove();
				this.l_dimensions.bottom = null;
			}
			if(this.l_dimensions.top){
				this.l_dimensions.top.removeChildren();
				this.l_dimensions.top.remove();
				this.l_dimensions.top = null;
			}
			if(this.l_dimensions.right){
				this.l_dimensions.right.removeChildren();
				this.l_dimensions.right.remove();
				this.l_dimensions.right = null;
			}
			if(this.l_dimensions.left){
				this.l_dimensions.left.removeChildren();
				this.l_dimensions.left.remove();
				this.l_dimensions.left = null;
			}
		}
	},

	opacity: {
		get: function () {
			return this.children.length ? this.children[0].opacity : 1;
		},

		set: function (v) {
			this.children.forEach(function(elm){
				if(elm instanceof BuilderElement)
					elm.opacity = v;
			});
		}
	},

	on_remove_elm: {

		value: function (elm) {

			if(this.parent)
				this.parent.on_remove_elm(elm);

			if (elm instanceof Profile && !this.project.data._loading)
				this.clear_dimentions();

		}
	},

	on_insert_elm: {

		value: function (elm) {

			if(this.parent)
				this.parent.on_remove_elm(elm);

			if (elm instanceof Profile && !this.project.data._loading)
				this.clear_dimentions();

		}
	},

	on_sys_changed: {
		value: function () {

			this.profiles.forEach(function (profile) {
				profile.inset = profile.project.default_inset({
					elm_type: profile.elm_type,
					pos: profile.pos,
					inset: profile.inset
				});
			});

			this.glasses().forEach(function(elm) {
				if (elm instanceof Contour)
					elm.on_sys_changed();
				else{
					if(elm.thickness < elm.project._dp.sys.tmin || elm.thickness > elm.project._dp.sys.tmax)
						elm._row.inset = elm.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
					elm.profiles.forEach(function (curr) {
						if(!curr.cnn || !curr.cnn.check_nom2(curr.profile))
							curr.cnn = $p.cat.cnns.elm_cnn(elm, curr.profile, $p.enm.cnn_types.acn.ii);
					});
				}
			});
		}
	}

});

Editor.Contour = Contour;



function DimensionLine(attr){


	DimensionLine.superclass.constructor.call(this, {parent: attr.parent});

	var _row = attr.row;

	if(_row && _row.path_data){
		attr._mixin(JSON.parse(_row.path_data));
		if(attr.elm1)
			attr.elm1 = this.project.getItem({elm: attr.elm1});
		if(attr.elm2)
			attr.elm2 = this.project.getItem({elm: attr.elm2});
	}

	this.data.pos = attr.pos;
	this.data.elm1 = attr.elm1;
	this.data.elm2 = attr.elm2 || this.data.elm1;
	this.data.p1 = attr.p1 || "b";
	this.data.p2 = attr.p2 || "e";
	this.data.offset = attr.offset;

	if(attr.impost)
		this.data.impost = true;

	if(attr.contour)
		this.data.contour = true;

	this.__define({

		_row: {
			get: function () {
				return _row;
			}
		},

		remove: {
			value: function () {
				if(_row){
					_row._owner.del(_row);
					_row = null;
					this.project.register_change();
				}
				DimensionLine.superclass.remove.call(this);
			}
		}
	});

	if(!this.data.pos && (!this.data.elm1 || !this.data.elm2)){
		this.remove();
		return null;
	}

	new paper.Path({parent: this, name: 'callout1', strokeColor: 'black', guide: true});
	new paper.Path({parent: this, name: 'callout2', strokeColor: 'black', guide: true});
	new paper.Path({parent: this, name: 'scale', strokeColor: 'black', guide: true});
	new paper.PointText({
		parent: this,
		name: 'text',
		justification: 'center',
		fillColor: 'black',
		fontSize: 72});


	this.on({
		mouseenter: this._mouseenter,
		mouseleave: this._mouseleave,
		click: this._click
	});

	$p.eve.attachEvent("sizes_wnd", this._sizes_wnd.bind(this));

}
DimensionLine._extend(paper.Group);

DimensionLine.prototype.__define({

	_metadata: {
		get: function () {
			return $p.dp.builder_text.metadata();
		}
	},

	_manager: {
		get: function () {
			return $p.dp.builder_text;
		}
	},

	_mouseenter: {
		value: function (event) {
			paper.canvas_cursor('cursor-arrow-ruler');
		}
	},

	_mouseleave: {
		value: function (event) {
		}
	},

	_click: {
		value: function (event) {
			event.stop();
			this.wnd = new RulerWnd(null, this);
			this.wnd.size = this.size;
		}
	},

	_move_points: {
		value: function (event, xy) {

			var _bounds, delta, size;

			if(this.data.elm1){

				_bounds = {};


				if(this.pos == "top" || this.pos == "bottom"){

					size = Math.abs(this.data.elm1[this.data.p1].x - this.data.elm2[this.data.p2].x);

					if(event.name == "right"){
						delta = new paper.Point(event.size - size, 0);
						_bounds[event.name] = Math.max(this.data.elm1[this.data.p1].x, this.data.elm2[this.data.p2].x);

					}else{
						delta = new paper.Point(size - event.size, 0);
						_bounds[event.name] = Math.min(this.data.elm1[this.data.p1].x, this.data.elm2[this.data.p2].x);
					}


				}else{

					size = Math.abs(this.data.elm1[this.data.p1].y - this.data.elm2[this.data.p2].y);

					if(event.name == "bottom"){
						delta = new paper.Point(0, event.size - size);
						_bounds[event.name] = Math.max(this.data.elm1[this.data.p1].y, this.data.elm2[this.data.p2].y);

					}
					else{
						delta = new paper.Point(0, size - event.size);
						_bounds[event.name] = Math.min(this.data.elm1[this.data.p1].y, this.data.elm2[this.data.p2].y);
					}
				}

			}else {

				_bounds = this.layer.bounds;

				if(this.pos == "top" || this.pos == "bottom")
					if(event.name == "right")
						delta = new paper.Point(event.size - _bounds.width, 0);
					else
						delta = new paper.Point(_bounds.width - event.size, 0);
				else{
					if(event.name == "bottom")
						delta = new paper.Point(0, event.size - _bounds.height);
					else
						delta = new paper.Point(0, _bounds.height - event.size);
				}

			}

			if(delta.length){

				paper.project.deselect_all_points();

				paper.project.getItems({class: Profile}).forEach(function (p) {
					if(Math.abs(p.b[xy] - _bounds[event.name]) < consts.sticking0 && Math.abs(p.e[xy] - _bounds[event.name]) < consts.sticking0){
						p.generatrix.segments.forEach(function (segm) {
							segm.selected = true;
						})

					}else if(Math.abs(p.b[xy] - _bounds[event.name]) < consts.sticking0){
						p.generatrix.firstSegment.selected = true;

					}else if(Math.abs(p.e[xy] - _bounds[event.name]) < consts.sticking0){
						p.generatrix.lastSegment.selected = true;

					}

				});
				this.project.move_points(delta);
				setTimeout(function () {
					this.deselect_all_points(true);
					this.register_update();
				}.bind(this.project), 200);
			}
		}
	},

	_sizes_wnd: {
		value: function (event) {
      if(this.wnd && event.wnd == this.wnd.wnd){

				switch(event.name) {
					case 'close':
						if(this.children.text)
							this.children.text.selected = false;
						this.wnd = null;
						break;

					case 'left':
					case 'right':
						if(this.pos == "top" || this.pos == "bottom")
							this._move_points(event, "x");
						break;

					case 'top':
					case 'bottom':
						if(this.pos == "left" || this.pos == "right")
							this._move_points(event, "y");
						break;
				}
			}
		}
	},

	redraw: {
		value: function () {

			var _bounds = this.layer.bounds,
				_dim_bounds = this.layer instanceof DimensionLayer ? this.project.dimension_bounds : this.layer.dimension_bounds,
				offset = 0,
				b, e, tmp, normal, length, bs, es;

			if(!this.pos){

				if(typeof this.data.p1 == "number")
					b = this.data.elm1.corns(this.data.p1);
				else
					b = this.data.elm1[this.data.p1];

				if(typeof this.data.p2 == "number")
					e = this.data.elm2.corns(this.data.p2);
				else
					e = this.data.elm2[this.data.p2];

			}else if(this.pos == "top"){
				b = _bounds.topLeft;
				e = _bounds.topRight;
				offset = _bounds[this.pos] - _dim_bounds[this.pos];

			}else if(this.pos == "left"){
				b = _bounds.bottomLeft;
				e = _bounds.topLeft;
				offset = _bounds[this.pos] - _dim_bounds[this.pos];

			}else if(this.pos == "bottom"){
				b = _bounds.bottomLeft;
				e = _bounds.bottomRight;
				offset = _bounds[this.pos] - _dim_bounds[this.pos];

			}else if(this.pos == "right"){
				b = _bounds.bottomRight;
				e = _bounds.topRight;
				offset = _bounds[this.pos] - _dim_bounds[this.pos];
			}

			if(!b || !e){
				this.visible = false;
				return;
			}

			tmp = new paper.Path({ insert: false, segments: [b, e] });

			if(this.data.elm1 && this.pos){

				b = tmp.getNearestPoint(this.data.elm1[this.data.p1]);
				e = tmp.getNearestPoint(this.data.elm2[this.data.p2]);
				if(tmp.getOffsetOf(b) > tmp.getOffsetOf(e)){
					normal = e;
					e = b;
					b = normal;
				}
				tmp.firstSegment.point = b;
				tmp.lastSegment.point = e;

			};

			length = tmp.length;
			if(length < consts.sticking_l){
				this.visible = false;
				return;
			}

			this.visible = true;

			normal = tmp.getNormalAt(0).multiply(this.offset + offset);

			bs = b.add(normal.multiply(0.8));
			es = e.add(normal.multiply(0.8));

			if(this.children.callout1.segments.length){
				this.children.callout1.firstSegment.point = b;
				this.children.callout1.lastSegment.point = b.add(normal);
			}else
				this.children.callout1.addSegments([b, b.add(normal)]);

			if(this.children.callout2.segments.length){
				this.children.callout2.firstSegment.point = e;
				this.children.callout2.lastSegment.point = e.add(normal);
			}else
				this.children.callout2.addSegments([e, e.add(normal)]);

			if(this.children.scale.segments.length){
				this.children.scale.firstSegment.point = bs;
				this.children.scale.lastSegment.point = es;
			}else
				this.children.scale.addSegments([bs, es]);


			this.children.text.content = length.toFixed(0);
			this.children.text.rotation = e.subtract(b).angle;
			this.children.text.point = bs.add(es).divide(2);


		},
		enumerable : false
	},

	size: {
		get: function () {
			return parseFloat(this.children.text.content);
		},
		set: function (v) {
			this.children.text.content = parseFloat(v).round(1);
		}
	},

	angle: {
		get: function () {
			return 0;
		},
		set: function (v) {

		}
	},

	pos: {
		get: function () {
			return this.data.pos || "";
		},
		set: function (v) {
			this.data.pos = v;
			this.redraw();
		}
	},

	offset: {
		get: function () {
			return this.data.offset || 90;
		},
		set: function (v) {
			var offset = (parseInt(v) || 90).round(0);
			if(this.data.offset != offset){
				this.data.offset = offset;
				this.project.register_change(true);
			}
		}
	}

});

function DimensionLayer(attr) {

	DimensionLayer.superclass.constructor.call(this);

	if(!attr || !attr.parent){
		this.__define({
			bounds: {
				get: function () {
					return this.project.bounds;
				}
			}
		});
	}
}
DimensionLayer._extend(paper.Layer);


function DimensionLineCustom(attr) {

	if(!attr.row)
		attr.row = attr.parent.project.ox.coordinates.add();

	if(!attr.row.cnstr)
		attr.row.cnstr = attr.parent.layer.cnstr;

	if(!attr.row.elm)
		attr.row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;

	DimensionLineCustom.superclass.constructor.call(this, attr);

	this.on({
		mouseenter: this._mouseenter,
		mouseleave: this._mouseleave,
		click: this._click
	});

}
DimensionLineCustom._extend(DimensionLine);

DimensionLineCustom.prototype.__define({

	save_coordinates: {
		value: function () {

			var _row = this._row;

			_row.len = this.size;

			_row.elm_type = this.elm_type;

			_row.path_data = JSON.stringify({
				pos: this.pos,
				elm1: this.data.elm1.elm,
				elm2: this.data.elm2.elm,
				p1: this.data.p1,
				p2: this.data.p2,
				offset: this.offset
			});

		}
	},

	elm_type: {
		get : function(){

			return $p.enm.elm_types.Размер;

		}
	},


	_click: {
		value: function (event) {
			event.stop();
			this.selected = true;
		}
	}
});



function BuilderElement(attr){

	BuilderElement.superclass.constructor.call(this);

	if(!attr.row){
    attr.row = this.project.ox.coordinates.add();
  }

	this.__define({
		_row: {
			get: function () {
				return attr.row;
			}
		}
	});

	if(attr.proto){

		if(attr.proto.inset){
      this.inset = attr.proto.inset;
    }

		if(attr.parent){
      this.parent = attr.parent;
    }
		else if(attr.proto.parent){
      this.parent = attr.proto.parent;
    }

		if(attr.proto instanceof Profile){
      this.insertBelow(attr.proto);
    }

		this.clr = attr.proto.clr;

	}
	else if(attr.parent){
    this.parent = attr.parent;
  }

	if(!attr.row.cnstr){
    attr.row.cnstr = this.layer.cnstr;
  }

	if(!attr.row.elm){
    attr.row.elm = this.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
  }

	if(attr.row.elm_type.empty() && !this.inset.empty()){
    attr.row.elm_type = this.inset.nom().elm_type;
  }

	this.project.register_change();

	this.remove = function () {

		this.detache_wnd();

		if(this.parent){

			if (this.parent.on_remove_elm)
				this.parent.on_remove_elm(this);

			if (this.parent._noti && this._observer){
				Object.unobserve(this.parent._noti, this._observer);
				delete this._observer;
			}
		}

		if(this.project.ox === attr.row._owner._owner){
      attr.row._owner.del(attr.row);
    }
		delete attr.row;

		BuilderElement.superclass.remove.call(this);
		this.project.register_change();
	};

}

BuilderElement._extend(paper.Group);

BuilderElement.prototype.__define({

	owner: {
		get : function(){ return this.data.owner; },
		set : function(v){ this.data.owner = v; }
	},

	generatrix: {
		get : function(){ return this.data.generatrix; },
		set : function(attr){

			this.data.generatrix.removeSegments();

			if(this.hasOwnProperty('rays'))
				this.rays.clear();

			if(Array.isArray(attr))
				this.data.generatrix.addSegments(attr);

			else if(attr.proto &&  attr.p1 &&  attr.p2){

				var tpath = attr.proto;
				if(tpath.getDirectedAngle(attr.ipoint) < 0)
					tpath.reverse();

				var d1 = tpath.getOffsetOf(attr.p1),
					d2 = tpath.getOffsetOf(attr.p2), d3;
				if(d1 > d2){
					d3 = d2;
					d2 = d1;
					d1 = d3;
				}
				if(d1 > 0){
					tpath = tpath.split(d1);
					d2 = tpath.getOffsetOf(attr.p2);
				}
				if(d2 < tpath.length)
					tpath.split(d2);

				this.data.generatrix.remove();
				this.data.generatrix = tpath;
				this.data.generatrix.parent = this;

				if(this.parent.parent)
					this.data.generatrix.guide = true;
			}
		},
		enumerable : true
	},

	path: {
		get : function(){ return this.data.path; },
		set : function(attr){
			if(attr instanceof paper.Path){
				this.data.path.removeSegments();
				this.data.path.addSegments(attr.segments);
				if(!this.data.path.closed)
					this.data.path.closePath(true);
			}
		},
		enumerable : true
	},

	_metadata: {
		get : function(){
			var t = this,
				_meta = t.project.ox._metadata,
				_xfields = _meta.tabular_sections.coordinates.fields, 
				inset = _xfields.inset._clone(),
				cnn1 = _meta.tabular_sections.cnn_elmnts.fields.cnn._clone(),
				cnn2 = cnn1._clone(),
				cnn3 = cnn1._clone(),
				info = _meta.fields.note._clone();

			function cnn_choice_links(o, cnn_point){
				var nom_cnns = $p.cat.cnns.nom_cnn(t, cnn_point.profile, cnn_point.cnn_types);

				if($p.utils.is_data_obj(o)){
					return nom_cnns.some(function (cnn) {
						return o == cnn;
					});

				}else{
					var refs = "";
					nom_cnns.forEach(function (cnn) {
						if(refs)
							refs += ", ";
						refs += "'" + cnn.ref + "'";
					});
					return "_t_.ref in (" + refs + ")";
				}
			}

			info.synonym = "Элемент";


			inset.choice_links = [{
				name: ["selection",	"ref"],
				path: [
					function(o, f){
						var selection;

						if(t instanceof Filling){

							if($p.utils.is_data_obj(o)){
								return $p.cat.inserts._inserts_types_filling.indexOf(o.insert_type) != -1 &&
										o.thickness >= t.project._dp.sys.tmin && o.thickness <= t.project._dp.sys.tmax;

							}else{
								var refs = "";
								$p.cat.inserts.by_thickness(t.project._dp.sys.tmin, t.project._dp.sys.tmax).forEach(function (row) {
									if(refs)
										refs += ", ";
									refs += "'" + row.ref + "'";
								});
								return "_t_.ref in (" + refs + ")";
							}

						}else if(t instanceof Profile){
							if(t.nearest())
								selection = {elm_type: {in: [$p.enm.elm_types.Створка, $p.enm.elm_types.Добор]}};
							else
								selection = {elm_type: {in: [$p.enm.elm_types.Рама, $p.enm.elm_types.Импост, $p.enm.elm_types.Добор]}};
						}else
							selection = {elm_type: t.nom.elm_type};


						if($p.utils.is_data_obj(o)){
							var ok = false;
							selection.nom = o;
							t.project._dp.sys.elmnts.find_rows(selection, function (row) {
								ok = true;
								return false;
							});
							return ok;
						}else{
							var refs = "";
							t.project._dp.sys.elmnts.find_rows(selection, function (row) {
								if(refs)
									refs += ", ";
								refs += "'" + row.nom.ref + "'";
							});
							return "_t_.ref in (" + refs + ")";
						}
				}]}
			];

			cnn1.choice_links = [{
				name: ["selection",	"ref"],
				path: [
					function(o, f){
						return cnn_choice_links(o, t.rays.b);
					}]}
			];

			cnn2.choice_links = [{
				name: ["selection",	"ref"],
				path: [
					function(o, f){
						return cnn_choice_links(o, t.rays.e);
					}]}
			];

			cnn3.choice_links = [{
				name: ["selection",	"ref"],
				path: [
					function(o){

						var cnn_ii = t.selected_cnn_ii(), nom_cnns;

						if(cnn_ii.elm instanceof Filling)
							nom_cnns = $p.cat.cnns.nom_cnn(cnn_ii.elm, t, $p.enm.cnn_types.acn.ii);
						else
							nom_cnns = $p.cat.cnns.nom_cnn(t, cnn_ii.elm, $p.enm.cnn_types.acn.ii);

						if($p.utils.is_data_obj(o)){
							return nom_cnns.some(function (cnn) {
								return o == cnn;
							});

						}else{
							var refs = "";
							nom_cnns.forEach(function (cnn) {
								if(refs)
									refs += ", ";
								refs += "'" + cnn.ref + "'";
							});
							return "_t_.ref in (" + refs + ")";
						}
					}]}
			];

			$p.cat.clrs.selection_exclude_service(_xfields.clr, t);


			return {
				fields: {
					info: info,
					inset: inset,
					clr: _xfields.clr,
					x1: _xfields.x1,
					x2: _xfields.x2,
					y1: _xfields.y1,
					y2: _xfields.y2,
					cnn1: cnn1,
					cnn2: cnn2,
					cnn3: cnn3,
          r: _xfields.r,
          arc_ccw: _xfields.arc_ccw
				}
			};
		}
	},

	_manager: {
		get: function () {
			return this.project._dp._manager;
		}
	},

	nom:{
		get : function(){
			return this.inset.nom(this);
		}
	},

	elm: {
		get : function(){
			return this._row.elm;
		}
	},

	info: {
		get : function(){
			return "№" + this.elm;
		},
		enumerable : true
	},

	inset: {
		get : function(){
			return (this._row ? this._row.inset : null) || $p.cat.inserts.get();
		},
		set : function(v){

			if(this._row.inset != v){

				this._row.inset = v;

				if(this.data && this.data._rays){
          this.data._rays.clear(true);
        }

        if(this.joined_nearests){
          this.joined_nearests().forEach((profile) => {
            profile.data._rays.clear(true);
          })
        }

				this.project.register_change();
			}
		}
	},

	clr: {
		get : function(){
			return this._row.clr;
		},
		set : function(v){

			this._row.clr = v;

			if(this.path instanceof paper.Path){
        this.path.fillColor = BuilderElement.clr_by_clr.call(this, this._row.clr, false);
      }

			this.project.register_change();

		}
	},

	width: {
		get : function(){
			return this.nom.width || 80;
		}
	},

	thickness: {
		get : function(){
			return this.inset.thickness;
		}
	},

	sizeb: {
		get : function(){
			return this.inset.sizeb || 0;
		}
	},

	sizefurn: {
		get : function(){
			return this.nom.sizefurn || 20;
		}
	},

	cnn3: {
		get : function(){
			const cnn_ii = this.selected_cnn_ii();
			return cnn_ii ? cnn_ii.row.cnn : $p.cat.cnns.get();
		},
		set: function(v){
      const cnn_ii = this.selected_cnn_ii();
			if(cnn_ii){
        cnn_ii.row.cnn = v;
      }
			this.project.register_change();
		}
	},

	attache_wnd: {
		value: function(cell){

			if(!this.data._grid || !this.data._grid.cell){

				this.data._grid = cell.attachHeadFields({
					obj: this,
					oxml: this.oxml
				});
				this.data._grid.attachEvent("onRowSelect", function(id){
					if(["x1","y1","cnn1"].indexOf(id) != -1)
						this._obj.select_node("b");

					else if(["x2","y2","cnn2"].indexOf(id) != -1)
						this._obj.select_node("e");
				});

			}else{
				if(this.data._grid._obj != this)
					this.data._grid.attach({
						obj: this,
						oxml: this.oxml
					});
			}

			cell.layout.base.style.height = (Math.max(this.data._grid.rowsBuffer.length, 9) + 1) * 22 + "px";
			cell.layout.setSizes();
			this.data._grid.objBox.style.width = "100%";
		}
	},

	detache_wnd: {
		value: function(){
			if(this.data._grid && this.data._grid.destructor){
				this.data._grid._owner_cell.detachObject(true);
				delete this.data._grid;
			}
		}
	},

	selected_cnn_ii: {
		value: function(){
			var t = this,
				sel = t.project.getSelectedItems(),
				cnns = this.project.connections.cnns,
				items = [], res;

			sel.forEach(function (item) {
				if(item.parent instanceof ProfileItem || item.parent instanceof Filling)
					items.push(item.parent);
				else if(item instanceof Filling)
					items.push(item);
			});

			if(items.length > 1 &&
				items.some(function (item) { return item == t; }) &&
				items.some(function (item) {
					if(item != t){
						cnns.forEach(function (row) {
							if(!row.node1 && !row.node2 &&
								((row.elm1 == t.elm && row.elm2 == item.elm) || (row.elm1 == item.elm && row.elm2 == t.elm))){
								res = {elm: item, row: row};
								return false;
							}
						});
						if(res)
							return true;
					}
				}))
				return res;
		}
	}

});

BuilderElement.clr_by_clr = function (clr, view_out) {

	var clr_str = clr.clr_str;

	if(!view_out){
		if(!clr.clr_in.empty() && clr.clr_in.clr_str)
			clr_str = clr.clr_in.clr_str;
	}else{
		if(!clr.clr_out.empty() && clr.clr_out.clr_str)
			clr_str = clr.clr_out.clr_str;
	}

	if(!clr_str)
		clr_str = this.default_clr_str ? this.default_clr_str : "fff";


	if(clr_str){
		clr = clr_str.split(",");
		if(clr.length == 1){
			if(clr_str[0] != "#")
				clr_str = "#" + clr_str;
			clr = new paper.Color(clr_str);
			clr.alpha = 0.96;

		}else if(clr.length == 4){
			clr = new paper.Color(clr[0], clr[1], clr[2], clr[3]);

		}else if(clr.length == 3){
			if(this.path && this.path.bounds)
				clr = new paper.Color({
					stops: [clr[0], clr[1], clr[2]],
					origin: this.path.bounds.bottomLeft,
					destination: this.path.bounds.topRight
				});
			else
				clr = new paper.Color(clr[0]);
		}
		return clr;
	}
};

Editor.BuilderElement = BuilderElement;




function Filling(attr){

	Filling.superclass.constructor.call(this, attr);

	this._noti = {};

	this.notify = function (obj) {
		Object.getNotifier(this._noti).notify(obj);
		this.project.register_change();
	}.bind(this);


	this.initialize(attr);


}
Filling._extend(BuilderElement);

Filling.prototype.__define({

	initialize: {
		value: function (attr) {

			var _row = attr.row,
				h = this.project.bounds.height + this.project.bounds.y;

			if(_row.path_data)
				this.data.path = new paper.Path(_row.path_data);

			else if(attr.path){

				this.data.path = new paper.Path();
				this.path = attr.path;

			}else
				this.data.path = new paper.Path([
					[_row.x1, h - _row.y1],
					[_row.x1, h - _row.y2],
					[_row.x2, h - _row.y2],
					[_row.x2, h - _row.y1]
				]);
			this.data.path.closePath(true);
			this.data.path.reduce();
			this.data.path.strokeWidth = 0;

			if(_row.inset.empty())
				_row.inset = this.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});

			if(_row.clr.empty())
				this.project._dp.sys.elmnts.find_rows({nom: _row.inset}, function (row) {
					_row.clr = row.clr;
					return false;
				});
			if(_row.clr.empty())
				this.project._dp.sys.elmnts.find_rows({elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}}, function (row) {
					_row.clr = row.clr;
					return false;
				});
			this.clr = _row.clr;

			if(_row.elm_type.empty())
				_row.elm_type = $p.enm.elm_types.Стекло;

			this.data.path.visible = false;

			this.addChild(this.data.path);

			this.project.ox.coordinates.find_rows({
				cnstr: this.layer.cnstr,
				parent: this.elm,
				elm_type: $p.enm.elm_types.Раскладка
			}, function(row){
				new Onlay({row: row, parent: this});
			}.bind(this));

		}
	},

	profiles: {
		get : function(){
			return this.data._profiles || [];
		}
	},

	onlays: {
		get: function () {
			return this.getItems({class: Onlay});
		}
	},

	save_coordinates: {
		value: function () {

			var h = this.project.bounds.height + this.project.bounds.y,
				_row = this._row,
				bounds = this.bounds,
				cnns = this.project.connections.cnns,
				profiles = this.profiles,
				length = profiles.length,
				curr, prev,	next,

				glass = this.project.ox.glasses.add({
					elm: _row.elm,
					nom: this.nom,
					width: bounds.width,
					height: bounds.height,
					s: this.s,
					is_rectangular: this.is_rectangular,
					thickness: this.thickness
				});

			_row.x1 = (bounds.bottomLeft.x - this.project.bounds.x).round(3);
			_row.y1 = (h - bounds.bottomLeft.y).round(3);
			_row.x2 = (bounds.topRight.x - this.project.bounds.x).round(3);
			_row.y2 = (h - bounds.topRight.y).round(3);
			_row.path_data = this.path.pathData;


			for(var i=0; i<length; i++ ){

				curr = profiles[i];

				if(!curr.profile || !curr.profile._row || !curr.cnn){
					if($p.job_prm.debug)
						throw new ReferenceError("Не найдено ребро заполнения");
					else
						return;
				}

				curr.aperture_path = curr.profile.generatrix.get_subpath(curr.b, curr.e).data.reversed ? curr.profile.rays.outer : curr.profile.rays.inner;
			}

			for(var i=0; i<length; i++ ){

				prev = i==0 ? profiles[length-1] : profiles[i-1];
				curr = profiles[i];
				next = i==length-1 ? profiles[0] : profiles[i+1];

				var pb = curr.aperture_path.intersect_point(prev.aperture_path, curr.b, true),
					pe = curr.aperture_path.intersect_point(next.aperture_path, curr.e, true);

				if(!pb || !pe){
					if($p.job_prm.debug)
						throw "Filling:path";
					else
						return;
				}

				cnns.add({
					elm1: _row.elm,
					elm2: curr.profile._row.elm,
					node1: "",
					node2: "",
					cnn: curr.cnn.ref,
					aperture_len: curr.aperture_path.get_subpath(pb, pe).length.round(1)
				});

			}

			for(var i=0; i<length; i++ ){
				delete profiles[i].aperture_path;
			}


			this.onlays.forEach(function (curr) {
				curr.save_coordinates();
			});


		}
	},

	create_leaf: {
		value: function () {

			var contour = new Contour( {parent: this.parent});

			contour.path = this.profiles;

			this.parent = contour;
			this._row.cnstr = contour.cnstr;

			contour.furn = this.project.default_furn;

			Object.getNotifier(this.project._noti).notify({
				type: 'rows',
				tabular: "constructions"
			});

		}
	},

	s: {
		get : function(){
			return this.bounds.width * this.bounds.height / 1000000;
		},
		enumerable : true
	},

	is_rectangular: {
		get : function(){
			return this.profiles.length == 4 && !this.data.path.hasHandles();
		}
	},

	is_sandwich: {
		get : function(){
			return false;
		}
	},

	path: {
		get : function(){ return this.data.path; },
		set : function(attr){

			const data = this.data;
			data.path.removeSegments();
			data._profiles = [];

			if(attr instanceof paper.Path){

				if(attr.data.curve_nodes){

					data.path.addSegments(attr.segments);
				}else{
					data.path.addSegments(attr.segments);
				}


			}else if(Array.isArray(attr)){
				var length = attr.length, prev, curr, next, sub_path;
				for(var i=0; i<length; i++ ){
					curr = attr[i];
					next = i==length-1 ? attr[0] : attr[i+1];
					curr.cnn = $p.cat.cnns.elm_cnn(this, curr.profile);
					sub_path = curr.profile.generatrix.get_subpath(curr.b, curr.e);

					curr.sub_path = sub_path.equidistant(
						(sub_path.data.reversed ? -curr.profile.d1 : curr.profile.d2) + (curr.cnn ? curr.cnn.sz : 20), consts.sticking);

				}
				for(var i=0; i<length; i++ ){
					prev = i==0 ? attr[length-1] : attr[i-1];
					curr = attr[i];
					next = i==length-1 ? attr[0] : attr[i+1];
					if(!curr.pb)
						curr.pb = prev.pe = curr.sub_path.intersect_point(prev.sub_path, curr.b, true);
					if(!curr.pe)
						curr.pe = next.pb = curr.sub_path.intersect_point(next.sub_path, curr.e, true);
					if(!curr.pb || !curr.pe){
						if($p.job_prm.debug)
							throw "Filling:path";
						else
							continue;
					}
					curr.sub_path = curr.sub_path.get_subpath(curr.pb, curr.pe);
				}
				for(var i=0; i<length; i++ ){
					curr = attr[i];
					data.path.addSegments(curr.sub_path.segments);
					["anext","pb","pe"].forEach(function (prop) {
						delete curr[prop];
					});
					data._profiles.push(curr);
				}
			}

			if(data.path.segments.length && !data.path.closed)
				data.path.closePath(true);

			data.path.reduce();

		}
	},

	nodes: {
		get: function () {
			var res = [];
			if(this.profiles.length){
				this.profiles.forEach(function (curr) {
					res.push(curr.b);
				});
			}else{
				res = this.parent.glass_nodes(this.path);
			}
			return res;
		}
	},

	outer_profiles: {
		get: function () {
			return this.profiles;
		}
	},

	perimeter: {
		get: function () {
			var res = [], tmp;
			this.profiles.forEach(function (curr) {
				res.push(tmp = {
					len: curr.sub_path.length,
					angle: curr.e.subtract(curr.b).angle
				});
				if(tmp.angle < 0){
          tmp.angle += 360;
        }
			});
			return res;
		}
	},

	x1: {
		get: function () {
			return (this.bounds.left - this.project.bounds.x).round(1);
		},
		set: function (v) {

		}
	},

	x2: {
		get: function () {
			return (this.bounds.right - this.project.bounds.x).round(1);
		},
		set: function (v) {

		}
	},

	y1: {
		get: function () {
			return (this.project.bounds.height + this.project.bounds.y - this.bounds.bottom).round(1);
		},
		set: function (v) {

		}
	},

	y2: {
		get: function () {
			return (this.project.bounds.height + this.project.bounds.y - this.bounds.top).round(1);
		},
		set: function (v) {

		}
	},

	info: {
		get : function(){
			return "№" + this.elm + " w:" + this.bounds.width.toFixed(0) + " h:" + this.bounds.height.toFixed(0);
		},
		enumerable : true
	},

	select_node: {
		value: function (v) {
			var point, segm, delta = Infinity;
			if(v == "b"){
				point = this.bounds.bottomLeft;
			}else{
				point = this.bounds.topRight;
			}
			this.data.path.segments.forEach(function (curr) {
				curr.selected = false;
				if(point.getDistance(curr.point) < delta){
					delta = point.getDistance(curr.point);
					segm = curr;
				}
			});
			segm.selected = true;
			this.view.update();
		}
	},

	oxml: {
		get: function () {
			var cnn_ii = this.selected_cnn_ii(),
				oxml = {
					" ": [
						{id: "info", path: "o.info", type: "ro"},
						"inset",
						"clr"
					],
					"Начало": [
						{id: "x1", path: "o.x1", synonym: "X1", type: "ro"},
						{id: "y1", path: "o.y1", synonym: "Y1", type: "ro"}
					],
					"Конец": [
						{id: "x2", path: "o.x2", synonym: "X2", type: "ro"},
						{id: "y2", path: "o.y2", synonym: "Y2", type: "ro"}
					]
				};

			if(cnn_ii)
				oxml["Примыкание"] = ["cnn3"];

			return oxml;

		},
		enumerable: false
	},

	default_clr_str: {
		value: "#def,#d0ddff,#eff",
		enumerable: false
	},

	redraw_onlay: {
		value: function () {
			this.onlays.forEach(function (elm) {
				elm.redraw();
			});
		}
	},

  formula: {
	  get: function () {
      const {ox} = this.project;
      let res = '';

      ox.glass_specification.find_rows({elm: this.elm}, (row) => {
        if(!res){
          res = row._row.inset.name;
        }
        else{
          res += "x" + row._row.inset.name;
        }
      });

      return res || this.inset.name;
    }
  },

});

Editor.Filling = Filling;




function FreeText(attr){

	var _row;

	if(!attr.fontSize)
		attr.fontSize = consts.font_size;

	if(attr.row)
		_row = attr.row;
	else{
		_row = attr.row = attr.parent.project.ox.coordinates.add();
	}

	if(!_row.cnstr)
		_row.cnstr = attr.parent.layer.cnstr;

	if(!_row.elm)
		_row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;


	FreeText.superclass.constructor.call(this, attr);

	this.__define({
		_row: {
			get: function () {
				return _row;
			},
			enumerable: false
		}
	});

	if(attr.point){
		if(attr.point instanceof paper.Point)
			this.point = attr.point;
		else
			this.point = new paper.Point(attr.point);
	}else{


				this.clr = _row.clr;
		this.angle = _row.angle_hor;

		if(_row.path_data){
			var path_data = JSON.parse(_row.path_data);
			this.x = _row.x1 + path_data.bounds_x || 0;
			this.y = _row.y1 - path_data.bounds_y || 0;
			this._mixin(path_data, null, ["bounds_x","bounds_y"]);
		}else{
			this.x = _row.x1;
			this.y = _row.y1;
		}
	}

	this.bringToFront();



	this.remove = function () {
		_row._owner.del(_row);
		_row = null;
		FreeText.superclass.remove.call(this);
	};

}
FreeText._extend(paper.PointText);

FreeText.prototype.__define({


	save_coordinates: {
		value: function () {

			var _row = this._row;

			_row.x1 = this.x;
			_row.y1 = this.y;
			_row.angle_hor = this.angle;

			_row.elm_type = this.elm_type;

			_row.path_data = JSON.stringify({
				text: this.text,
				font_family: this.font_family,
				font_size: this.font_size,
				bold: this.bold,
				align: this.align.ref,
				bounds_x: this.project.bounds.x,
				bounds_y: this.project.bounds.y
			});
		}
	},


	elm_type: {
		get : function(){

			return $p.enm.elm_types.Текст;

		}
	},


	move_points: {
		value: function (point) {

			this.point = point;

			Object.getNotifier(this).notify({
				type: 'update',
				name: "x"
			});
			Object.getNotifier(this).notify({
				type: 'update',
				name: "y"
			});
		}
	},

	_metadata: {
		get: function () {
			return $p.dp.builder_text.metadata();
		},
		enumerable: false
	},

	_manager: {
		get: function () {
			return $p.dp.builder_text;
		},
		enumerable: false
	},

	clr: {
		get: function () {
			return this._row ? this._row.clr : $p.cat.clrs.get();
		},
		set: function (v) {
			this._row.clr = v;
			if(this._row.clr.clr_str.length == 6)
				this.fillColor = "#" + this._row.clr.clr_str;
			this.project.register_update();
		},
		enumerable: false
	},

	font_family: {
		get: function () {
			return this.fontFamily || "";
		},
		set: function (v) {
			this.fontFamily = v;
			this.project.register_update();
		},
		enumerable: false
	},

	font_size: {
		get: function () {
			return this.fontSize || consts.font_size;
		},
		set: function (v) {
			this.fontSize = v;
			this.project.register_update();
		},
		enumerable: false
	},

	bold: {
		get: function () {
			return this.fontWeight != 'normal';
		},
		set: function (v) {
			this.fontWeight = v ? 'bold' : 'normal';
		},
		enumerable: false
	},

	x: {
		get: function () {
			return (this.point.x - this.project.bounds.x).round(1);
		},
		set: function (v) {
			this.point.x = parseFloat(v) + this.project.bounds.x;
			this.project.register_update();
		},
		enumerable: false
	},

	y: {
		get: function () {
			return (this.project.bounds.height + this.project.bounds.y - this.point.y).round(1);
		},
		set: function (v) {
			this.point.y = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
		},
		enumerable: false
	},

	text: {
		get: function () {
			return this.content;
		},
		set: function (v) {
			if(v){
				this.content = v;
				this.project.register_update();
			}
			else{
				Object.getNotifier(this).notify({
					type: 'unload'
				});
				setTimeout(this.remove.bind(this), 50);
			}

		},
		enumerable: false
	},

	angle: {
		get: function () {
			return Math.round(this.rotation);
		},
		set: function (v) {
			this.rotation = v;
			this.project.register_update();
		},
		enumerable: false
	},

	align: {
		get: function () {
			return $p.enm.text_aligns.get(this.justification);
		},
		set: function (v) {
			this.justification = $p.utils.is_data_obj(v) ? v.ref : v;
			this.project.register_update();
		},
		enumerable: false
	}

});


paper.Path.prototype.__define({

	getDirectedAngle: {
		value: function (point) {
			var np = this.getNearestPoint(point),
				offset = this.getOffsetOf(np);
			return this.getTangentAt(offset).getDirectedAngle(point.add(np.negate()));
		},
		enumerable: false
	},

	angle_to: {
		value : function(other, point, interior, round){
			var p1 = this.getNearestPoint(point),
				p2 = other.getNearestPoint(point),
				t1 = this.getTangentAt(this.getOffsetOf(p1)),
				t2 = other.getTangentAt(other.getOffsetOf(p2)),
				res = t2.angle - t1.angle;
			if(res < 0)
				res += 360;
			if(interior && res > 180)
				res = 180 - (res - 180);
			return round ? res.round(round) : res.round(1);
		},
		enumerable : false
	},

	is_linear: {
		value: function () {
			if(this.curves.length == 1 && this.firstCurve.isLinear())
				return true;
			else if(this.hasHandles())
				return false;
			else{
				var curves = this.curves,
					da = curves[0].point1.getDirectedAngle(curves[0].point2), dc;
				for(var i = 1; i < curves.lenght; i++){
					dc = curves[i].point1.getDirectedAngle(curves[i].point2);
					if(Math.abs(dc - da) > 0.01)
						return false;
				}
			}
			return true;
		},
		enumerable: false
	},

	get_subpath: {
		value: function (point1, point2) {
			var tmp;

			if(!this.length || (point1.is_nearest(this.firstSegment.point) && point2.is_nearest(this.lastSegment.point))){
				tmp = this.clone(false);

			}else if(point2.is_nearest(this.firstSegment.point) && point1.is_nearest(this.lastSegment.point)){
				tmp = this.clone(false);
				tmp.reverse();
				tmp.data.reversed = true;

			} else{

				var loc1 = this.getLocationOf(point1),
					loc2 = this.getLocationOf(point2);
				if(!loc1)
					loc1 = this.getNearestLocation(point1);
				if(!loc2)
					loc2 = this.getNearestLocation(point2);

				if(this.is_linear()){
					tmp = new paper.Path({
						segments: [loc1.point, loc2.point],
						insert: false
					});

				}else{
					var step = (loc2.offset - loc1.offset) * 0.02,
						tmp = new paper.Path({
							segments: [point1],
							insert: false
						});

					if(step < 0){
						tmp.data.reversed = true;
						for(var i = loc1.offset; i>=loc2.offset; i+=step)
							tmp.add(this.getPointAt(i));
					}else if(step > 0){
						for(var i = loc1.offset; i<=loc2.offset; i+=step)
							tmp.add(this.getPointAt(i));
					}
					tmp.add(point2);
					tmp.simplify(0.8);
				}

				if(loc1.offset > loc2.offset)
					tmp.data.reversed = true;
			}

			return tmp;
		},
		enumerable: false
	},

	equidistant: {
		value: function (delta, elong) {

			var normal = this.getNormalAt(0),
				res = new paper.Path({
					segments: [this.firstSegment.point.add(normal.multiply(delta))],
					insert: false
				});

			if(this.is_linear()) {
				res.add(this.lastSegment.point.add(normal.multiply(delta)));

			}else{

				var len = this.length, step = len * 0.02, point;

				for(var i = step; i<=len; i+=step) {
					point = this.getPointAt(i);
					if(!point)
						continue;
					normal = this.getNormalAt(i);
					res.add(point.add(normal.multiply(delta)));
				}

				normal = this.getNormalAt(len);
				res.add(this.lastSegment.point.add(normal.multiply(delta)));

				res.simplify(0.8);
			}

			return res.elongation(elong);
		},
		enumerable: false
	},

	elongation: {
		value: function (delta) {

			if(delta){
				var tangent = this.getTangentAt(0);
				if(this.is_linear()) {
					this.firstSegment.point = this.firstSegment.point.add(tangent.multiply(-delta));
					this.lastSegment.point = this.lastSegment.point.add(tangent.multiply(delta));
				}else{
					this.insert(0, this.firstSegment.point.add(tangent.multiply(-delta)));
					tangent = this.getTangentAt(this.length);
					this.add(this.lastSegment.point.add(tangent.multiply(delta)));
				}
			}

			return this;

		},
		enumerable: false
	},

	intersect_point: {
		value: function (path, point, elongate) {
			const intersections = this.getIntersections(path);
			let delta = Infinity, tdelta, tpoint;

			if(intersections.length == 1){
        return intersections[0].point;
      }
      else if(intersections.length > 1){

				if(!point){
          point = this.getPointAt(this.length /2);
        }

				intersections.forEach((o) => {
					tdelta = o.point.getDistance(point, true);
					if(tdelta < delta){
						delta = tdelta;
						tpoint = o.point;
					}
				});
				return tpoint;
			}
			else if(elongate == "nearest"){

				return this.getNearestPoint(path.getNearestPoint(point));

			}
			else if(elongate){

				let p1 = this.getNearestPoint(point),
					p2 = path.getNearestPoint(point),
					p1last = this.firstSegment.point.getDistance(p1, true) > this.lastSegment.point.getDistance(p1, true),
					p2last = path.firstSegment.point.getDistance(p2, true) > path.lastSegment.point.getDistance(p2, true),
					tg;

				tg = (p1last ? this.getTangentAt(this.length) : this.getTangentAt(0).negate()).multiply(100);
				if(this.is_linear){
					if(p1last)
						this.lastSegment.point = this.lastSegment.point.add(tg);
					else
						this.firstSegment.point = this.firstSegment.point.add(tg);
				}

				tg = (p2last ? path.getTangentAt(path.length) : path.getTangentAt(0).negate()).multiply(100);
				if(path.is_linear){
					if(p2last)
						path.lastSegment.point = path.lastSegment.point.add(tg);
					else
						path.firstSegment.point = path.firstSegment.point.add(tg);
				}

				return this.intersect_point(path, point);

			}
		},
		enumerable: false
	}

});


paper.Point.prototype.__define({

	is_nearest: {
		value: function (point, sticking) {
			return this.getDistance(point, true) < (sticking ? consts.sticking2 : 10);
		},
		enumerable: false
	},

	point_pos: {
		value: function(x1,y1, x2,y2){
			if (Math.abs(x1-x2) < 0.2){
				return (this.x-x1)*(y1-y2);
			}
			if (Math.abs(y1-y2) < 0.2){
				return (this.y-y1)*(x2-x1);
			}
			return (this.y-y1)*(x2-x1)-(y2-y1)*(this.x-x1);
		},
		enumerable: false
	},

	arc_cntr: {
		value: function(x1,y1, x2,y2, r0, ccw){
			var a,b,p,r,q,yy1,xx1,yy2,xx2;
			if(ccw){
				var tmpx=x1, tmpy=y1;
				x1=x2; y1=y2; x2=tmpx; y2=tmpy;
			}
			if (x1!=x2){
				a=(x1*x1 - x2*x2 - y2*y2 + y1*y1)/(2*(x1-x2));
				b=((y2-y1)/(x1-x2));
				p=b*b+ 1;
				r=-2*((x1-a)*b+y1);
				q=(x1-a)*(x1-a) - r0*r0 + y1*y1;
				yy1=(-r + Math.sqrt(r*r - 4*p*q))/(2*p);
				xx1=a+b*yy1;
				yy2=(-r - Math.sqrt(r*r - 4*p*q))/(2*p);
				xx2=a+b*yy2;
			} else{
				a=(y1*y1 - y2*y2 - x2*x2 + x1*x1)/(2*(y1-y2));
				b=((x2-x1)/(y1-y2));
				p=b*b+ 1;
				r=-2*((y1-a)*b+x1);
				q=(y1-a)*(y1-a) - r0*r0 + x1*x1;
				xx1=(-r - Math.sqrt(r*r - 4*p*q))/(2*p);
				yy1=a+b*xx1;
				xx2=(-r + Math.sqrt(r*r - 4*p*q))/(2*p);
				yy2=a+b*xx2;
			}

			if (new paper.Point(xx1,yy1).point_pos(x1,y1, x2,y2)>0)
				return {x: xx1, y: yy1};
			else
				return {x: xx2, y: yy2}
		},
		enumerable: false
	},

	arc_point: {
		value: function(x1,y1, x2,y2, r, arc_ccw, more_180){
			var point = {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
			if (r>0){
				var dx = x1-x2, dy = y1-y2, dr = r*r-(dx*dx+dy*dy)/4, l, h, centr;
				if(dr >= 0){
					centr = this.arc_cntr(x1,y1, x2,y2, r, arc_ccw);
					dx = centr.x - point.x;
					dy = point.y - centr.y;	
					l = Math.sqrt(dx*dx + dy*dy);

					if(more_180)
						h = r+Math.sqrt(dr);
					else
						h = r-Math.sqrt(dr);

					point.x += dx*h/l;
					point.y += dy*h/l;
				}
			}
			return point;
		},
		enumerable: false
	},

	snap_to_angle: {
		value: function(snapAngle) {

			if(!snapAngle){
        snapAngle = Math.PI*2/8;
      }

			let angle = Math.atan2(this.y, this.x);
			angle = Math.round(angle/snapAngle) * snapAngle;

			const dirx = Math.cos(angle),
				diry = Math.sin(angle),
				d = dirx*this.x + diry*this.y;

			return new paper.Point(dirx*d, diry*d);
		}
	}

});







class CnnPoint {

  constructor(parent, node) {

    this._parent = parent;
    this._node = node;

    this.initialize();
  }

  get is_t() {
    if(!this.cnn || this.cnn.cnn_type == $p.enm.cnn_types.УгловоеДиагональное){
      return false;
    }

    if(this.cnn.cnn_type == $p.enm.cnn_types.ТОбразное){
      return true;
    }

    if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной && this.parent.orientation != $p.enm.orientations.vert){
      return true;
    }

    if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной && this.parent.orientation != $p.enm.orientations.hor){
      return true;
    }

    return false;
  }

  get is_tt() {
    return !(this.is_i || this.profile_point == "b" || this.profile_point == "e" || this.profile == this.parent);
  }

  get is_l() {
    return this.is_t ||
      !!(this.cnn && (this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной ||
      this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной));
  }

  get is_i() {
    return !this.profile && !this.is_cut;
  }

  get parent() {
    return this._parent;
  }

  get node() {
    return this._node;
  }

  clear() {
    if(this.profile_point){
      delete this.profile_point;
    }
    if(this.is_cut){
      delete this.is_cut;
    }
    this.profile = null;
    this.err = null;
    this.distance = Infinity;
    this.cnn_types = $p.enm.cnn_types.acn.i;
    if(this.cnn && this.cnn.cnn_type != $p.enm.cnn_types.tcn.i){
      this.cnn = null;
    }
  }

  get err() {
    return this._err;
  }
  set err(v) {
    if(!v){
      this._err.length = 0;
    }
    else if(this._err.indexOf(v) == -1){
      this._err.push(v);
    }
  }

  get profile() {
    if(this._profile === undefined && this._row && this._row.elm2){
      this._profile = this.parent.layer.getItem({elm: this._row.elm2});
      delete this._row;
    }
    return this._profile;
  }
  set profile(v) {
    this._profile = v;
  }

  initialize() {

    const {_parent, _node} = this;

    this._err = [];

    this._row = _parent.project.connections.cnns.find({elm1: _parent.elm, node1: _node});

    this._profile;

    if(this._row){

      this.cnn = this._row.cnn;

      if($p.enm.cnn_types.acn.a.indexOf(this.cnn.cnn_type) != -1){
        this.cnn_types = $p.enm.cnn_types.acn.a;
      }
      else if($p.enm.cnn_types.acn.t.indexOf(this.cnn.cnn_type) != -1){
        this.cnn_types = $p.enm.cnn_types.acn.t;
      }
      else{
        this.cnn_types = $p.enm.cnn_types.acn.i;
      }
    }
    else{
      this.cnn = null;
      this.cnn_types = $p.enm.cnn_types.acn.i;
    }

    this.distance = Infinity;

    this.point = null;

    this.profile_point = "";

  }
}

class ProfileRays {

  constructor(parent) {
    this.parent = parent;
    this.b = new CnnPoint(this.parent, "b");
    this.e = new CnnPoint(this.parent, "e");
    this.inner = new paper.Path({ insert: false });
    this.outer = new paper.Path({ insert: false });
  }

  clear_segments() {
    if(this.inner.segments.length){
      this.inner.removeSegments();
    }
    if(this.outer.segments.length){
      this.outer.removeSegments();
    }
  }

  clear(with_cnn) {
    this.clear_segments();
    if(with_cnn){
      this.b.clear();
      this.e.clear();
    }
  }

  recalc() {

    const {parent} = this;
    const path = parent.generatrix;
    const len = path.length;

    this.clear_segments();

    if(!len){
      return;
    }

    const {d1, d2, width} = parent;
    const ds = 3 * width;
    const step = len * 0.02;

    let point_b = path.firstSegment.point,
      tangent_b = path.getTangentAt(0),
      normal_b = path.getNormalAt(0),
      point_e = path.lastSegment.point,
      tangent_e, normal_e;

    this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
    this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_b.multiply(-ds)));

    if(path.is_linear()){

      this.outer.add(point_e.add(normal_b.multiply(d1)).add(tangent_b.multiply(ds)));
      this.inner.add(point_e.add(normal_b.multiply(d2)).add(tangent_b.multiply(ds)));

    }else{

      this.outer.add(point_b.add(normal_b.multiply(d1)));
      this.inner.add(point_b.add(normal_b.multiply(d2)));

      for(let i = step; i<=len; i+=step) {
        point_b = path.getPointAt(i);
        if(!point_b){
          continue;
        }
        normal_b = path.getNormalAt(i);
        this.outer.add(point_b.add(normal_b.normalize(d1)));
        this.inner.add(point_b.add(normal_b.normalize(d2)));
      }

      normal_e = path.getNormalAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)));
      this.inner.add(point_e.add(normal_e.multiply(d2)));

      tangent_e = path.getTangentAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)).add(tangent_e.multiply(ds)));
      this.inner.add(point_e.add(normal_e.multiply(d2)).add(tangent_e.multiply(ds)));

      this.outer.simplify(0.8);
      this.inner.simplify(0.8);
    }

    this.inner.reverse();
  }

}


function ProfileItem(attr){

	ProfileItem.superclass.constructor.call(this, attr);

	this.initialize(attr);

}
ProfileItem._extend(BuilderElement);

ProfileItem.prototype.__define({

  setSelection: {
    value: function (selection) {

      BuilderElement.prototype.setSelection.call(this, selection);

      const {generatrix, path} = this.data;

      generatrix.setSelection(selection);

      if(selection){

        const {angle_hor, rays} = this;
        const {inner, outer} = rays;
        const delta = ((angle_hor > 20 && angle_hor < 70) || (angle_hor > 200 && angle_hor < 250)) ? [500, 500] : [500, -500];
        this._hatching = new paper.CompoundPath({
          parent: this,
          guide: true,
          strokeColor: 'grey',
          strokeScaling: false
        })

        path.setSelection(0);

        for(let t = 0; t < inner.length; t+=40){
          const ip = inner.getPointAt(t);
          const fp = new paper.Path({
            insert: false,
            segments: [
              ip.add(delta),
              ip.subtract(delta)
            ]
          })
          const op = fp.intersect_point(outer, ip);
          if(ip && op){
            const cip = path.contains(ip);
            const cop = path.contains(op);
            if(cip && cop){
              this._hatching.moveTo(ip);
              this._hatching.lineTo(op);
            }
            else if(cip && !cop){
              const pp = fp.intersect_point(path, op);
              this._hatching.moveTo(ip);
              this._hatching.lineTo(pp);
            }
            else if(!cip && cop){
              const pp = fp.intersect_point(path, ip);
              this._hatching.moveTo(pp);
              this._hatching.lineTo(op);
            }
          }
        }

      }
      else{
        if(this._hatching){
          this._hatching.remove();
          this._hatching = null;
        }
      }

    }
  },

	save_coordinates: {
		value: function () {

		  const {data, _row, rays, generatrix, project} = this;

			if(!generatrix){
        return;
      }

      const cnns = project.connections.cnns;
      const b = rays.b;
      const e = rays.e;

			let	row_b = cnns.add({
					elm1: _row.elm,
					node1: "b",
					cnn: b.cnn ? b.cnn.ref : "",
					aperture_len: this.corns(1).getDistance(this.corns(4)).round(1)
				}),
				row_e = cnns.add({
					elm1: _row.elm,
					node1: "e",
					cnn: e.cnn ? e.cnn.ref : "",
					aperture_len: this.corns(2).getDistance(this.corns(3)).round(1)
				});

			_row.x1 = this.x1;
			_row.y1 = this.y1;
			_row.x2 = this.x2;
			_row.y2 = this.y2;
			_row.path_data = generatrix.pathData;
			_row.nom = this.nom;


			_row.len = this.length.round(1);

			if(b.profile){
				row_b.elm2 = b.profile.elm;
				if(b.profile.e.is_nearest(b.point))
					row_b.node2 = "e";
				else if(b.profile.b.is_nearest(b.point))
					row_b.node2 = "b";
				else
					row_b.node2 = "t";
			}
			if(e.profile){
				row_e.elm2 = e.profile.elm;
				if(e.profile.b.is_nearest(e.point))
					row_e.node2 = "b";
				else if(e.profile.e.is_nearest(e.point))
					row_e.node2 = "b";
				else
					row_e.node2 = "t";
			}

			if(row_b = this.nearest()){
				cnns.add({
					elm1: _row.elm,
					elm2: row_b.elm,
					cnn: data._nearest_cnn,
					aperture_len: _row.len
				});
			}

			_row.angle_hor = this.angle_hor;

			_row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
			if(_row.alp1 < 0){
        _row.alp1 = _row.alp1 + 360;
      }

			_row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
			if(_row.alp2 < 0){
        _row.alp2 = _row.alp2 + 360;
      }

			_row.elm_type = this.elm_type;




			this.addls.forEach(function (addl) {
				addl.save_coordinates();
			});

		}
	},

	initialize: {
		value : function(attr){

			const h = this.project.bounds.height + this.project.bounds.y,
				_row = this._row;

			if(attr.r)
				_row.r = attr.r;

			if(attr.generatrix) {
				this.data.generatrix = attr.generatrix;
				if(this.data.generatrix.data.reversed)
					delete this.data.generatrix.data.reversed;

			} else {

				if(_row.path_data) {
					this.data.generatrix = new paper.Path(_row.path_data);

				}else{

          const first_point = new paper.Point([_row.x1, h - _row.y1]);
					this.data.generatrix = new paper.Path(first_point);

					if(_row.r){
						this.data.generatrix.arcTo(
              first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2,
								_row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
					}else{
						this.data.generatrix.lineTo([_row.x2, h - _row.y2]);
					}
				}
			}

			this.data._corns = [];

			this.data._rays = new ProfileRays(this);

			this.data.generatrix.strokeColor = 'grey';

			this.data.path = new paper.Path();
			this.data.path.strokeColor = 'black';
			this.data.path.strokeWidth = 1;
			this.data.path.strokeScaling = false;

			this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;

			this.addChild(this.data.path);
			this.addChild(this.data.generatrix);

		}
	},

	observer: {
		value: function(an){

			var bcnn, ecnn, moved;

			if(Array.isArray(an)){
				moved = an[an.length-1];

				if(moved.profiles.indexOf(this) == -1){

					bcnn = this.cnn_point("b");
					ecnn = this.cnn_point("e");

					moved.profiles.forEach(function (p) {
						this.do_bind(p, bcnn, ecnn, moved);
					}.bind(this));

					moved.profiles.push(this);
				}

			}else if(an instanceof Profile){
				this.do_bind(an, this.cnn_point("b"), this.cnn_point("e"));

			}

		}
	},

	b: {
		get : function(){
			if(this.data.generatrix)
				return this.data.generatrix.firstSegment.point;
		},
		set : function(v){
			this.data._rays.clear();
			if(this.data.generatrix)
				this.data.generatrix.firstSegment.point = v;
		}
	},

	e: {
		get : function(){
			if(this.data.generatrix)
				return this.data.generatrix.lastSegment.point;
		},
		set : function(v){
			this.data._rays.clear();
			if(this.data.generatrix)
				this.data.generatrix.lastSegment.point = v;
		}
	},

	bc: {
		get : function(){
			return this.corns(1);
		}
	},

	ec: {
		get : function(){
			return this.corns(2);
		}
	},

	x1: {
		get : function(){
			return (this.b.x - this.project.bounds.x).round(1);
		},
		set: function(v){
			this.select_node("b");
			this.move_points(new paper.Point(parseFloat(v) + this.project.bounds.x - this.b.x, 0));
		}
	},

	y1: {
		get : function(){
			return (this.project.bounds.height + this.project.bounds.y - this.b.y).round(1);
		},
		set: function(v){
			v = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
			this.select_node("b");
			this.move_points(new paper.Point(0, v - this.b.y));
		}
	},

	x2: {
		get : function(){
			return (this.e.x - this.project.bounds.x).round(1);
		},
		set: function(v){
			this.select_node("e");
			this.move_points(new paper.Point(parseFloat(v) + this.project.bounds.x - this.e.x, 0));
		}
	},

	y2: {
		get : function(){
			return (this.project.bounds.height + this.project.bounds.y - this.e.y).round(1);
		},
		set: function(v){
			v = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
			this.select_node("e");
			this.move_points(new paper.Point(0, v - this.e.y));
		}
	},

	cnn1: {
		get : function(){
			return this.cnn_point("b").cnn || $p.cat.cnns.get();
		},
		set: function(v){
			this.rays.b.cnn = $p.cat.cnns.get(v);
			this.project.register_change();
		}
	},

	cnn2: {
		get : function(){
			return this.cnn_point("e").cnn || $p.cat.cnns.get();
		},
		set: function(v){
			this.rays.e.cnn = $p.cat.cnns.get(v);
			this.project.register_change();
		}
	},

	info: {
		get : function(){
			return "№" + this.elm + " α:" + this.angle_hor.toFixed(0) + "° l:" + this.length.toFixed(0);
		}
	},

	r: {
		get : function(){
			return this._row.r;
		},
		set: function(v){
		  if(this._row.r != v){
        this.data._rays.clear();
        this._row.r = v;
        this.set_generatrix_radius();
      }
		}
	},

  set_generatrix_radius: {
	  value: function (h) {

	    const _row = this._row,
        gen = this.data.generatrix,
        b = gen.firstSegment.point.clone(),
        e = gen.lastSegment.point.clone(),
        min_radius = b.getDistance(e) / 2;

	    if(!h){
        h = this.project.bounds.height + this.project.bounds.y
      }

      gen.removeSegments(1);
      gen.firstSegment.handleIn = null;
      gen.firstSegment.handleOut = null;

      if(_row.r < min_radius){
        _row.r = 0;
      }else if(_row.r == min_radius){
        _row.r += 0.001;
      }

      if(_row.r){
        let p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, _row.arc_ccw, false));
        if(p.point_pos(b.x, b.y, e.x, e.y) > 0 && !_row.arc_ccw || p.point_pos(b.x, b.y, e.x, e.y) < 0 && _row.arc_ccw){
          p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, !_row.arc_ccw, false));
        }
        gen.arcTo(p, e);

      }else{

        gen.lineTo(e);

      }

      gen.layer.notify({
        type: consts.move_points,
        profiles: [this],
        points: []
      });

    }
  },

	arc_ccw: {
		get : function(){
      return this._row.arc_ccw;
		},
		set: function(v){
		  if(this._row.arc_ccw != v){
        this.data._rays.clear();
        this._row.arc_ccw = v;
        this.set_generatrix_radius();
      }
		}
	},

	postcalc_cnn: {
		value: function(node){

			var cnn_point = this.cnn_point(node);

			cnn_point.cnn = $p.cat.cnns.elm_cnn(this, cnn_point.profile, cnn_point.cnn_types, cnn_point.cnn);

			if(!cnn_point.point)
				cnn_point.point = this[node];

			return cnn_point;
		}
	},

	postcalc_inset: {

		value: function(){

			this.inset = this.project.check_inset({ elm: this });

			return this;
		}
	},

	path_points: {
		value: function(cnn_point, profile_point){

			var _profile = this,
				_corns = this.data._corns,
				rays = this.rays,
				prays,  normal;

			if(!this.generatrix.curves.length)
				return cnn_point;

			function intersect_point(path1, path2, index){
				var intersections = path1.getIntersections(path2),
					delta = Infinity, tdelta, point, tpoint;

				if(intersections.length == 1)
					if(index)
						_corns[index] = intersections[0].point;
					else
						return intersections[0].point.getDistance(cnn_point.point, true);

				else if(intersections.length > 1){
					intersections.forEach(function(o){
						tdelta = o.point.getDistance(cnn_point.point, true);
						if(tdelta < delta){
							delta = tdelta;
							point = o.point;
						}
					});
					if(index)
						_corns[index] = point;
					else
						return delta;
				}
			}

			function detect_side(){

				if(cnn_point.profile instanceof ProfileItem){
					var isinner = intersect_point(prays.inner, _profile.generatrix),
						isouter = intersect_point(prays.outer, _profile.generatrix);
					if(isinner != undefined && isouter == undefined)
						return 1;
					else if(isinner == undefined && isouter != undefined)
						return -1;
					else
						return 1;
				}else
					return 1;

			}

			if(cnn_point.profile instanceof ProfileItem){
				prays = cnn_point.profile.rays;

			}else if(cnn_point.profile instanceof Filling){
				prays = {
					inner: cnn_point.profile.path,
					outer: cnn_point.profile.path
				};
			}

			if(cnn_point.is_t){

				if(!cnn_point.profile.path.segments.length)
					cnn_point.profile.redraw();

				if(profile_point == "b"){
					if(detect_side() < 0){
						intersect_point(prays.outer, rays.outer, 1);
						intersect_point(prays.outer, rays.inner, 4);

					}else{
						intersect_point(prays.inner, rays.outer, 1);
						intersect_point(prays.inner, rays.inner, 4);

					}

				}else if(profile_point == "e"){
					if(detect_side() < 0){
						intersect_point(prays.outer, rays.outer, 2);
						intersect_point(prays.outer, rays.inner, 3);

					}else{
						intersect_point(prays.inner, rays.outer, 2);
						intersect_point(prays.inner, rays.inner, 3);

					}
				}

			}else if(!cnn_point.profile_point || !cnn_point.cnn || cnn_point.cnn.cnn_type == $p.enm.cnn_types.tcn.i){
				if(profile_point == "b"){
					normal = this.generatrix.firstCurve.getNormalAt(0, true);
					_corns[1] = this.b.add(normal.normalize(this.d1));
					_corns[4] = this.b.add(normal.normalize(this.d2));

				}else if(profile_point == "e"){
					normal = this.generatrix.lastCurve.getNormalAt(1, true);
					_corns[2] = this.e.add(normal.normalize(this.d1));
					_corns[3] = this.e.add(normal.normalize(this.d2));
				}

			}else if(cnn_point.cnn.cnn_type == $p.enm.cnn_types.tcn.ad){
				if(profile_point == "b"){
					intersect_point(prays.outer, rays.outer, 1);
					intersect_point(prays.inner, rays.inner, 4);

				}else if(profile_point == "e"){
					intersect_point(prays.outer, rays.outer, 2);
					intersect_point(prays.inner, rays.inner, 3);
				}

			}else if(cnn_point.cnn.cnn_type == $p.enm.cnn_types.tcn.av){
				if(this.orientation == $p.enm.orientations.vert){
					if(profile_point == "b"){
						intersect_point(prays.outer, rays.outer, 1);
						intersect_point(prays.outer, rays.inner, 4);

					}else if(profile_point == "e"){
						intersect_point(prays.outer, rays.outer, 2);
						intersect_point(prays.outer, rays.inner, 3);
					}
				}else if(this.orientation == $p.enm.orientations.hor){
					if(profile_point == "b"){
						intersect_point(prays.inner, rays.outer, 1);
						intersect_point(prays.inner, rays.inner, 4);

					}else if(profile_point == "e"){
						intersect_point(prays.inner, rays.outer, 2);
						intersect_point(prays.inner, rays.inner, 3);
					}
				}else{
					cnn_point.err = "orientation";
				}

			}else if(cnn_point.cnn.cnn_type == $p.enm.cnn_types.tcn.ah){
				if(this.orientation == $p.enm.orientations.vert){
					if(profile_point == "b"){
						intersect_point(prays.inner, rays.outer, 1);
						intersect_point(prays.inner, rays.inner, 4);

					}else if(profile_point == "e"){
						intersect_point(prays.inner, rays.outer, 2);
						intersect_point(prays.inner, rays.inner, 3);
					}
				}else if(this.orientation == $p.enm.orientations.hor){
					if(profile_point == "b"){
						intersect_point(prays.outer, rays.outer, 1);
						intersect_point(prays.outer, rays.inner, 4);

					}else if(profile_point == "e"){
						intersect_point(prays.outer, rays.outer, 2);
						intersect_point(prays.outer, rays.inner, 3);
					}
				}else{
					cnn_point.err = "orientation";
				}
			}

			if(profile_point == "b"){
				if(!_corns[1])
					_corns[1] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
				if(!_corns[4])
					_corns[4] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));

			}else if(profile_point == "e"){
				if(!_corns[2])
					_corns[2] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
				if(!_corns[3])
					_corns[3] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
			}
			return cnn_point;
		}
	},

	interiorPoint: {
		value: function () {
			var gen = this.generatrix, igen;
			if(gen.curves.length == 1)
				igen = gen.firstCurve.getPointAt(0.5, true);
			else if (gen.curves.length == 2)
				igen = gen.firstCurve.point2;
			else
				igen = gen.curves[1].point2;
			return this.rays.inner.getNearestPoint(igen).add(this.rays.outer.getNearestPoint(igen)).divide(2)
		}
	},

	select_node: {
		value:  function(node){
			var gen = this.generatrix;
			this.project.deselect_all_points();
			this.data.path.selected = false;
			if(node == "b")
				gen.firstSegment.selected = true;
			else
				gen.lastSegment.selected = true;
			this.view.update();
		}
	},

	select_corn: {
		value:  function(point){

			var res = {dist: Infinity},
				dist;

			this.path.segments.forEach(function (segm) {
				dist = segm.point.getDistance(point);
				if(dist < res.dist){
					res.dist = dist;
					res.segm = segm;
				}
			});

			dist = this.b.getDistance(point);
			if(dist < res.dist){
				res.dist = dist;
				res.segm = this.generatrix.firstSegment;
			}

			dist = this.e.getDistance(point);
			if(dist < res.dist){
				res.dist = dist;
				res.segm = this.generatrix.lastSegment;
			}

			if(res.dist < consts.sticking0){
				this.project.deselectAll();
				res.segm.selected = true;
			}
		}
	},

	angle_hor: {
		get : function(){
			var res = (new paper.Point(this.e.x - this.b.x, this.b.y - this.e.y)).angle.round(1);
			return res < 0 ? res + 360 : res;
		}
	},

	length: {

		get: function () {

		  const {b, e, outer} = this.rays;
			const gen = this.elm_type == $p.enm.elm_types.Импост ? this.generatrix : outer;
      const ppoints = {};

			for(let i = 1; i<=4; i++){
        ppoints[i] = gen.getNearestPoint(this.corns(i));
      }

			ppoints.b = gen.getOffsetOf(ppoints[1]) < gen.getOffsetOf(ppoints[4]) ? ppoints[1] : ppoints[4];
			ppoints.e = gen.getOffsetOf(ppoints[2]) > gen.getOffsetOf(ppoints[3]) ? ppoints[2] : ppoints[3];

			const sub_gen = gen.get_subpath(ppoints.b, ppoints.e);
			const res = sub_gen.length + (b.cnn ? b.cnn.sz : 0) + (e.cnn ? e.cnn.sz : 0);
			sub_gen.remove();

			return res;
		}
	},

	orientation: {
		get : function(){
			var angle_hor = this.angle_hor;
			if(angle_hor > 180)
				angle_hor -= 180;
			if((angle_hor > -consts.orientation_delta && angle_hor < consts.orientation_delta) ||
				(angle_hor > 180-consts.orientation_delta && angle_hor < 180+consts.orientation_delta))
				return $p.enm.orientations.hor;
			if((angle_hor > 90-consts.orientation_delta && angle_hor < 90+consts.orientation_delta) ||
				(angle_hor > 270-consts.orientation_delta && angle_hor < 270+consts.orientation_delta))
				return $p.enm.orientations.vert;
			return $p.enm.orientations.incline;
		}
	},

	is_linear: {
		value : function(){
			return this.generatrix.is_linear();
		}
	},

	is_nearest: {
		value : function(p){
			return (this.b.is_nearest(p.b, true) && this.e.is_nearest(p.e, true)) ||
				(this.generatrix.getNearestPoint(p.b).is_nearest(p.b) && this.generatrix.getNearestPoint(p.e).is_nearest(p.e));
		}
	},

	is_collinear: {
		value : function(p) {
			var angl = p.e.subtract(p.b).getDirectedAngle(this.e.subtract(this.b));
			if (angl < 0)
				angl += 180;
			return Math.abs(angl) < consts.orientation_delta;
		}
	},

	rays: {
		get : function(){
			if(!this.data._rays.inner.segments.length || !this.data._rays.outer.segments.length)
				this.data._rays.recalc();
			return this.data._rays;
		}
	},

	addls: {
		get : function(){
			return this.children.reduce(function (val, elm) {
				if(elm instanceof ProfileAddl){
					val.push(elm);
				}
				return val;
			}, []);
		}
	},

	corns: {
		value: function(corn){

			if(typeof corn == "number")
				return this.data._corns[corn];

			else if(corn instanceof paper.Point){

				var res = {dist: Infinity, profile: this},
					dist;

				for(var i = 1; i<5; i++){
					dist = this.data._corns[i].getDistance(corn);
					if(dist < res.dist){
						res.dist = dist;
						res.point = this.data._corns[i];
						res.point_name = i;
					}
				}

				if(res.point.is_nearest(this.b)){
					res.dist = this.b.getDistance(corn);
					res.point = this.b;
					res.point_name = "b";

				}else if(res.point.is_nearest(this.e)){
					res.dist = this.e.getDistance(corn);
					res.point = this.e;
					res.point_name = "e";
				}

				return res;

			}else{
				var index = corn.substr(corn.length-1, 1),
					axis = corn.substr(corn.length-2, 1);
				return this.data._corns[index][axis];
			}
		}
	},

	redraw: {
		value: function () {

			const bcnn = this.postcalc_cnn("b");
      const ecnn = this.postcalc_cnn("e");
      const {path, generatrix, rays, project} = this;

      let offset1, offset2, tpath, step;

			if(project._dp.sys.allow_open_cnn){
        this.postcalc_inset();
      }

			this.path_points(bcnn, "b");
			this.path_points(ecnn, "e");

			path.removeSegments();

			path.add(this.corns(1));

			if(generatrix.is_linear()){
				path.add(this.corns(2), this.corns(3));

			}else{

				tpath = new paper.Path({insert: false});
				offset1 = rays.outer.getNearestLocation(this.corns(1)).offset;
				offset2 = rays.outer.getNearestLocation(this.corns(2)).offset;
				step = (offset2 - offset1) / 50;
				for(var i = offset1 + step; i<offset2; i+=step)
					tpath.add(rays.outer.getPointAt(i));
				tpath.simplify(0.8);
				path.join(tpath);
				path.add(this.corns(2));

				path.add(this.corns(3));

				tpath = new paper.Path({insert: false});
				offset1 = rays.inner.getNearestLocation(this.corns(3)).offset;
				offset2 = rays.inner.getNearestLocation(this.corns(4)).offset;
				step = (offset2 - offset1) / 50;
				for(var i = offset1 + step; i<offset2; i+=step)
					tpath.add(rays.inner.getPointAt(i));
				tpath.simplify(0.8);
				path.join(tpath);

			}

			path.add(this.corns(4));
			path.closePath();
			path.reduce();

			this.children.forEach(function (elm) {
				if(elm instanceof ProfileAddl){
					elm.observer(elm.parent);
					elm.redraw();
				}
			});

			return this;
		}
	},

	move_points: {
		value:  function(delta, all_points, start_point){

			if(!delta.length)
				return;

			var changed,
				other = [],
				noti = {type: consts.move_points, profiles: [this], points: []}, noti_points;


			if(!all_points){
				all_points = !this.generatrix.segments.some(function (segm) {
					if (segm.selected)
						return true;
				});
			}

			this.generatrix.segments.forEach(function (segm) {

				var cnn_point, free_point;

				if (segm.selected || all_points){

					noti_points = {old: segm.point.clone(), delta: delta};

					free_point = segm.point.add(delta);

					if(segm.point == this.b){
						cnn_point = this.rays.b;
						if(!cnn_point.profile_point || paper.Key.isDown('control'))
							cnn_point = this.cnn_point("b", free_point);

					}else if(segm.point == this.e){
						cnn_point = this.rays.e;
						if(!cnn_point.profile_point || paper.Key.isDown('control'))
							cnn_point = this.cnn_point("e", free_point);

					}

					if(cnn_point && cnn_point.cnn_types == $p.enm.cnn_types.acn.t && (segm.point == this.b || segm.point == this.e)){
						segm.point = cnn_point.point;

					}else{
						segm.point = free_point;
						if(cnn_point && !paper.Key.isDown('control')){
							if(cnn_point.profile && cnn_point.profile_point && !cnn_point.profile[cnn_point.profile_point].is_nearest(free_point)){
								other.push(cnn_point.profile_point == "b" ? cnn_point.profile.data.generatrix.firstSegment : cnn_point.profile.data.generatrix.lastSegment );
								cnn_point.profile[cnn_point.profile_point] = free_point;
								noti.profiles.push(cnn_point.profile);
							}
						}
					}

					noti_points.new = segm.point;
					if(start_point)
						noti_points.start = start_point;
					noti.points.push(noti_points);

					changed = true;
				}

			}.bind(this));


			if(changed){
				this.data._rays.clear();

				if(this.parent.notify)
					this.parent.notify(noti);

				var notifier = Object.getNotifier(this);
				notifier.notify({ type: 'update', name: "x1" });
				notifier.notify({ type: 'update', name: "y1" });
				notifier.notify({ type: 'update', name: "x2" });
				notifier.notify({ type: 'update', name: "y2" });
			}

			return other;
		}
	},

	oxml: {
		get: function () {
			var cnn_ii = this.selected_cnn_ii(),
				oxml = {
					" ": [
						{id: "info", path: "o.info", type: "ro"},
						"inset",
						"clr"
					],
					"Начало": ["x1", "y1", "cnn1"],
					"Конец": ["x2", "y2", "cnn2"]
				};

			if(cnn_ii)
				oxml["Примыкание"] = ["cnn3"];

			return oxml;
		}
	},

	has_cnn: {
		value: function (profile, point) {

			var t = this;

			while (t.parent instanceof ProfileItem)
				t = t.parent;

			while (profile.parent instanceof ProfileItem)
				profile = profile.parent;

			if(
				(t.b.is_nearest(point, true) && t.cnn_point("b").profile == profile) ||
				(t.e.is_nearest(point, true) && t.cnn_point("e").profile == profile) ||
				(profile.b.is_nearest(point, true) && profile.cnn_point("b").profile == t) ||
				(profile.e.is_nearest(point, true) && profile.cnn_point("e").profile == t)
			)
				return true;

			else
				return false;

		}
	},

	check_distance: {
		value: function (element, res, point, check_only) {
			return this.project.check_distance(element, this, res, point, check_only);
		}
	},

	default_clr_str: {
		value: "FEFEFE"
	},

	opacity: {
		get: function () {
			return this.path ? this.path.opacity : 1;
		},

		set: function (v) {
			if(this.path)
				this.path.opacity = v;
		}
	}

});



function Profile(attr){

	Profile.superclass.constructor.call(this, attr);

	if(this.parent){

		this._observer = this.observer.bind(this);
		Object.observe(this.layer._noti, this._observer, [consts.move_points]);

		this.layer.on_insert_elm(this);
	}

}
Profile._extend(ProfileItem);

Profile.prototype.__define({


	nearest: {
		value : function(){

			var _profile = this,
				b = _profile.b,
				e = _profile.e,
				ngeneratrix, children;

			function check_nearest(){
				if(_profile.data._nearest){
					ngeneratrix = _profile.data._nearest.generatrix;
					if( ngeneratrix.getNearestPoint(b).is_nearest(b) && ngeneratrix.getNearestPoint(e).is_nearest(e)){
						_profile.data._nearest_cnn = $p.cat.cnns.elm_cnn(_profile, _profile.data._nearest, $p.enm.cnn_types.acn.ii, _profile.data._nearest_cnn);
						return true;
					}
				}
				_profile.data._nearest = null;
				_profile.data._nearest_cnn = null;
			}

			if(_profile.layer && _profile.layer.parent){
				if(!check_nearest()){
					children = _profile.layer.parent.children;
					for(var p in children){
						if((_profile.data._nearest = children[p]) instanceof Profile && check_nearest())
							return _profile.data._nearest;
						else
							_profile.data._nearest = null;
					}
				}
			}else
				_profile.data._nearest = null;

			return _profile.data._nearest;
		}
	},

	d0: {
		get : function(){
			var res = 0, curr = this, nearest;

			while(nearest = curr.nearest()){
				res -= nearest.d2 + (curr.data._nearest_cnn ? curr.data._nearest_cnn.sz : 20);
				curr = nearest;
			}
			return res;
		}
	},

	d1: {
		get : function(){ return -(this.d0 - this.sizeb); }
	},

	d2: {
		get : function(){ return this.d1 - this.width; }
	},

	joined_imposts: {

		value : function(check_only){

		  const {rays, generatrix} = this;
      const tinner = [];
      const touter = [];

      if(this.parent.profiles.some((curr) => {

          if(curr == this){
            return
          }

          const pb = curr.cnn_point("b");
          if(pb.profile == this && pb.cnn && pb.cnn.cnn_type == $p.enm.cnn_types.tcn.t){

            if(check_only){
              return true;
            }

            const ip = curr.corns(1);
            if(rays.inner.getNearestPoint(ip).getDistance(ip, true) < rays.outer.getNearestPoint(ip).getDistance(ip, true))
              tinner.push({point: generatrix.getNearestPoint(pb.point), profile: curr});
            else
              touter.push({point: generatrix.getNearestPoint(pb.point), profile: curr});
          }

          const pe = curr.cnn_point("e");
          if(pe.profile == this && pe.cnn && pe.cnn.cnn_type == $p.enm.cnn_types.tcn.t){

            if(check_only){
              return true;
            }

            const ip = curr.corns(2);
            if(rays.inner.getNearestPoint(ip).getDistance(ip, true) < rays.outer.getNearestPoint(ip).getDistance(ip, true))
              tinner.push({point: generatrix.getNearestPoint(pe.point), profile: curr});
            else
              touter.push({point: generatrix.getNearestPoint(pe.point), profile: curr});
          }

        })) {
        return true;
      }

      return check_only ? false : {inner: tinner, outer: touter};

		}
	},

  joined_nearests: {
	  value: function () {

	    const res = [];

	    this.layer.contours.forEach((contour) => {
        contour.profiles.forEach((profile) => {
          if(profile.nearest() == this){
            res.push(profile)
          }
        })
      })

      return res;
    }
  },

	elm_type: {
		get : function(){

			if(this.data._rays && (this.data._rays.b.is_tt || this.data._rays.e.is_tt))
				return $p.enm.elm_types.Импост;

			if(this.layer.parent instanceof Contour)
				return $p.enm.elm_types.Створка;

			return $p.enm.elm_types.Рама;

		}
	},

	cnn_point: {
		value: function(node, point){

			var res = this.rays[node];

			if(!point)
				point = this[node];


			if(res.profile &&
				res.profile.children.length &&
				this.check_distance(res.profile, res, point, true) === false)
				return res;

			res.clear();
			if(this.parent){
				var profiles = this.parent.profiles,
					allow_open_cnn = this.project._dp.sys.allow_open_cnn,
					ares = [];

				for(var i=0; i<profiles.length; i++){
					if(this.check_distance(profiles[i], res, point, false) === false){

						if(!allow_open_cnn)
							return res;

						ares.push({
							profile_point: res.profile_point,
							profile: res.profile,
							cnn_types: res.cnn_types,
							point: res.point});
					}
				}

				if(ares.length == 1){
					res._mixin(ares[0]);


				}else if(ares.length >= 2){

					res.clear();
					res.is_cut = true;
				}
				ares = null;
			}

			return res;
		}
	},

	pos: {
		get: function () {
			const by_side = this.layer.profiles_by_side();
			if(by_side.top == this){
        return $p.enm.positions.Верх;
      }
			if(by_side.bottom == this){
        return $p.enm.positions.Низ;
      }
			if(by_side.left == this){
        return $p.enm.positions.Лев;
      }
			if(by_side.right == this){
        return $p.enm.positions.Прав;
      }
			return $p.enm.positions.Центр;
		}
	},


	do_bind: {
		value: function (p, bcnn, ecnn, moved) {

			var mpoint, imposts, moved_fact;

			if(bcnn.cnn && bcnn.profile == p){
				if($p.enm.cnn_types.acn.a.indexOf(bcnn.cnn.cnn_type)!=-1 ){
					if(!this.b.is_nearest(p.e)){
						if(bcnn.is_t || bcnn.cnn.cnn_type == $p.enm.cnn_types.tcn.ad){
							if(paper.Key.isDown('control')){
								console.log('control');
							}else{
								if(this.b.getDistance(p.e, true) < this.b.getDistance(p.b, true))
									this.b = p.e;
								else
									this.b = p.b;
								moved_fact = true;
							}
						} else{
							bcnn.clear();
							this.data._rays.clear_segments();
						}
					}

				}
				else if($p.enm.cnn_types.acn.t.indexOf(bcnn.cnn.cnn_type)!=-1 ){
					mpoint = (p.nearest() ? p.rays.outer : p.generatrix).getNearestPoint(this.b);
					if(!mpoint.is_nearest(this.b)){
						this.b = mpoint;
						moved_fact = true;
					}
				}

			}
			if(ecnn.cnn && ecnn.profile == p){
				if($p.enm.cnn_types.acn.a.indexOf(ecnn.cnn.cnn_type)!=-1 ){
					if(!this.e.is_nearest(p.b)){
						if(ecnn.is_t || ecnn.cnn.cnn_type == $p.enm.cnn_types.tcn.ad){
							if(paper.Key.isDown('control')){
								console.log('control');
							}else{
								if(this.e.getDistance(p.b, true) < this.e.getDistance(p.e, true))
									this.e = p.b;
								else
									this.e = p.e;
								moved_fact = true;
							}
						} else{
							ecnn.clear();
							this.data._rays.clear_segments();
						}
					}
				}
				else if($p.enm.cnn_types.acn.t.indexOf(ecnn.cnn.cnn_type)!=-1 ){
					mpoint = (p.nearest() ? p.rays.outer : p.generatrix).getNearestPoint(this.e);
					if(!mpoint.is_nearest(this.e)){
						this.e = mpoint;
						moved_fact = true;
					}
				}

			}

			if(moved && moved_fact){
				imposts = this.joined_imposts();
				imposts = imposts.inner.concat(imposts.outer);
				for(var i in imposts){
					if(moved.profiles.indexOf(imposts[i]) == -1){
						imposts[i].profile.observer(this);
					}
				}
			}
		}
	}

});

Editor.Profile = Profile;



function ProfileAddl(attr){

	ProfileAddl.superclass.constructor.call(this, attr);

	this.data.generatrix.strokeWidth = 0;

	if(!attr.side && this._row.parent < 0)
		attr.side = "outer";

	this.data.side = attr.side || "inner";

	if(!this._row.parent){
		this._row.parent = this.parent.elm;
		if(this.outer)
			this._row.parent = -this._row.parent;
	}
}
ProfileAddl._extend(ProfileItem);


ProfileAddl.prototype.__define({

	nearest: {
		value : function(){
			this.data._nearest_cnn = $p.cat.cnns.elm_cnn(this, this.parent, $p.enm.cnn_types.acn.ii, this.data._nearest_cnn);
			return this.parent;
		}
	},

	d0: {
		get : function(){
			this.nearest();
			return this.data._nearest_cnn ? -this.data._nearest_cnn.sz : 0;
		}
	},

	d1: {
		get : function(){ return -(this.d0 - this.sizeb); }
	},

	d2: {
		get : function(){ return this.d1 - this.width; }
	},

	outer: {
		get: function () { return this.data.side == "outer"; }
	},

	elm_type: {
		get : function(){ return $p.enm.elm_types.Добор; }
	},

	cnn_point: {
		value: function(node, point){

			var res = this.rays[node],

				check_distance = function(elm, with_addl) {

					if(elm == this || elm == this.parent)
						return;

					var gp = elm.generatrix.getNearestPoint(point), distance;

					if(gp && (distance = gp.getDistance(point)) < consts.sticking){
						if(distance <= res.distance){
							res.point = gp;
							res.distance = distance;
							res.profile = elm;
						}
					}


					if(with_addl)
						elm.getItems({class: ProfileAddl}).forEach(function (addl) {
							check_distance(addl, with_addl);
						});

				}.bind(this);

			if(!point)
				point = this[node];


			if(res.profile && res.profile.children.length){

				check_distance(res.profile);

				if(res.distance < consts.sticking)
					return res;
			}


			res.clear();
			res.cnn_types = $p.enm.cnn_types.acn.t;

			this.layer.profiles.forEach(function (addl) {
				check_distance(addl, true);
			});


			return res;

		}
	},

	path_points: {
		value: function(cnn_point, profile_point){

			var _profile = this,
				_corns = this.data._corns,
        interior = this.generatrix.getPointAt(this.generatrix.length/2),
				rays = this.rays,
				prays,  normal;

			if(!this.generatrix.curves.length)
				return cnn_point;

			function intersect_point(path1, path2, index){
				var intersections = path1.getIntersections(path2),
					delta = Infinity, tdelta, point, tpoint;

				if(intersections.length == 1)
					if(index)
						_corns[index] = intersections[0].point;
					else
						return intersections[0].point.getDistance(cnn_point.point, true);

				else if(intersections.length > 1){
					intersections.forEach(function(o){
						tdelta = o.point.getDistance(cnn_point.point, true);
						if(tdelta < delta){
							delta = tdelta;
							point = o.point;
						}
					});
					if(index)
						_corns[index] = point;
					else
						return delta;
				}
			}

			function detect_side(){

				return prays.inner.getNearestPoint(interior).getDistance(interior, true) <
						prays.outer.getNearestPoint(interior).getDistance(interior, true) ? 1 : -1;

			}

			prays = cnn_point.profile.rays;

			if(!cnn_point.profile.path.segments.length)
				cnn_point.profile.redraw();

			if(profile_point == "b"){
				if(detect_side() < 0){
					intersect_point(prays.outer, rays.outer, 1);
					intersect_point(prays.outer, rays.inner, 4);

				}else{
					intersect_point(prays.inner, rays.outer, 1);
					intersect_point(prays.inner, rays.inner, 4);

				}

			}else if(profile_point == "e"){
				if(detect_side() < 0){
					intersect_point(prays.outer, rays.outer, 2);
					intersect_point(prays.outer, rays.inner, 3);

				}else{
					intersect_point(prays.inner, rays.outer, 2);
					intersect_point(prays.inner, rays.inner, 3);

				}
			}

			if(profile_point == "b"){
				if(!_corns[1])
					_corns[1] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
				if(!_corns[4])
					_corns[4] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));

			}else if(profile_point == "e"){
				if(!_corns[2])
					_corns[2] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
				if(!_corns[3])
					_corns[3] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
			}

			return cnn_point;
		}
	},

	do_bind: {
		value: function (p, bcnn, ecnn, moved) {

			var imposts, moved_fact,

				bind_node = function (node, cnn) {

					if(!cnn.profile)
						return;

					var gen = this.outer ? this.parent.rays.outer : this.parent.rays.inner;
						mpoint = cnn.profile.generatrix.intersect_point(gen, cnn.point, "nearest");
					if(!mpoint.is_nearest(this[node])){
						this[node] = mpoint;
						moved_fact = true;
					}

				}.bind(this);

			if(this.parent == p){

				bind_node("b", bcnn);
				bind_node("e", ecnn);

			}

			if(bcnn.cnn && bcnn.profile == p){

				bind_node("b", bcnn);

			}
			if(ecnn.cnn && ecnn.profile == p){

				bind_node("e", ecnn);

			}

			if(moved && moved_fact){
			}
		}
	},

	glass_segment: {
		value: function () {

		}
	}

});



function ProfileConnective(attr){

	ProfileConnective.superclass.constructor.call(this, attr);

}
ProfileConnective._extend(ProfileItem);


ProfileConnective.prototype.__define({

	save_coordinates: {
		value: function () {

			if(!this.data.generatrix)
				return;

			var _row = this._row,

				cnns = this.project.connections.cnns,
				b = this.rays.b,
				e = this.rays.e,

				row_b = cnns.add({
					elm1: _row.elm,
					node1: "b",
					cnn: b.cnn ? b.cnn.ref : "",
					aperture_len: this.corns(1).getDistance(this.corns(4))
				}),
				row_e = cnns.add({
					elm1: _row.elm,
					node1: "e",
					cnn: e.cnn ? e.cnn.ref : "",
					aperture_len: this.corns(2).getDistance(this.corns(3))
				}),

				gen = this.generatrix;

			_row.x1 = this.x1;
			_row.y1 = this.y1;
			_row.x2 = this.x2;
			_row.y2 = this.y2;
			_row.path_data = gen.pathData;
			_row.nom = this.nom;
			_row.parent = this.parent.elm;


			_row.len = this.length;

			if(b.profile){
				row_b.elm2 = b.profile.elm;
				if(b.profile instanceof Filling)
					row_b.node2 = "t";
				else if(b.profile.e.is_nearest(b.point))
					row_b.node2 = "e";
				else if(b.profile.b.is_nearest(b.point))
					row_b.node2 = "b";
				else
					row_b.node2 = "t";
			}
			if(e.profile){
				row_e.elm2 = e.profile.elm;
				if(e.profile instanceof Filling)
					row_e.node2 = "t";
				else if(e.profile.b.is_nearest(e.point))
					row_e.node2 = "b";
				else if(e.profile.e.is_nearest(e.point))
					row_e.node2 = "b";
				else
					row_e.node2 = "t";
			}

			_row.angle_hor = this.angle_hor;

			_row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - gen.getTangentAt(0).angle) * 10) / 10;
			if(_row.alp1 < 0)
				_row.alp1 = _row.alp1 + 360;

			_row.alp2 = Math.round((gen.getTangentAt(gen.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
			if(_row.alp2 < 0)
				_row.alp2 = _row.alp2 + 360;

			_row.elm_type = this.elm_type;

		}
	},

	d0: {
		get : function(){
			return 0;
		}
	},

	d1: {
		get : function(){ return this.sizeb; }
	},

	d2: {
		get : function(){ return this.d1 - this.width; }
	},

	elm_type: {
		get : function(){

			return $p.enm.elm_types.Соединитель;

		}
	},

	cnn_point: {
		value: function(node){

			return this.rays[node];

		}
	}

});


function Onlay(attr){

	Onlay.superclass.constructor.call(this, attr);

}
Onlay._extend(ProfileItem);


Onlay.prototype.__define({

	save_coordinates: {
		value: function () {

			if(!this.data.generatrix)
				return;

			var _row = this._row,

				cnns = this.project.connections.cnns,
				b = this.rays.b,
				e = this.rays.e,

				row_b = cnns.add({
					elm1: _row.elm,
					node1: "b",
					cnn: b.cnn ? b.cnn.ref : "",
					aperture_len: this.corns(1).getDistance(this.corns(4))
				}),
				row_e = cnns.add({
					elm1: _row.elm,
					node1: "e",
					cnn: e.cnn ? e.cnn.ref : "",
					aperture_len: this.corns(2).getDistance(this.corns(3))
				}),

				gen = this.generatrix;

			_row.x1 = this.x1;
			_row.y1 = this.y1;
			_row.x2 = this.x2;
			_row.y2 = this.y2;
			_row.path_data = gen.pathData;
			_row.nom = this.nom;
			_row.parent = this.parent.elm;


			_row.len = this.length;

			if(b.profile){
				row_b.elm2 = b.profile.elm;
				if(b.profile instanceof Filling)
					row_b.node2 = "t";
				else if(b.profile.e.is_nearest(b.point))
					row_b.node2 = "e";
				else if(b.profile.b.is_nearest(b.point))
					row_b.node2 = "b";
				else
					row_b.node2 = "t";
			}
			if(e.profile){
				row_e.elm2 = e.profile.elm;
				if(e.profile instanceof Filling)
					row_e.node2 = "t";
				else if(e.profile.b.is_nearest(e.point))
					row_e.node2 = "b";
				else if(e.profile.e.is_nearest(e.point))
					row_e.node2 = "b";
				else
					row_e.node2 = "t";
			}

			_row.angle_hor = this.angle_hor;

			_row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - gen.getTangentAt(0).angle) * 10) / 10;
			if(_row.alp1 < 0)
				_row.alp1 = _row.alp1 + 360;

			_row.alp2 = Math.round((gen.getTangentAt(gen.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
			if(_row.alp2 < 0)
				_row.alp2 = _row.alp2 + 360;

			_row.elm_type = this.elm_type;

		}
	},

	d0: {
		get : function(){
			return 0;
		}
	},

	d1: {
		get : function(){ return this.sizeb; }
	},

	d2: {
		get : function(){ return this.d1 - this.width; }
	},

	elm_type: {
		get : function(){

			return $p.enm.elm_types.Раскладка;

		}
	},

	cnn_point: {
		value: function(node, point){

			var res = this.rays[node];

			if(!point)
				point = this[node];


			if(res.profile && res.profile.children.length){

				if(res.profile instanceof Filling){
					var np = res.profile.path.getNearestPoint(point),
						distance = np.getDistance(point);

					if(distance < consts.sticking_l){
            res.point = np;
            return res;
          }

				}else{
					if(this.check_distance(res.profile, res, point, true) === false)
						return res;
				}
			}


			res.clear();
			if(this.parent){

				var res_bind = this.bind_node(point);
				if(res_bind.binded){
					res._mixin(res_bind, ["point","profile","cnn_types","profile_point"]);
				}
			}

			return res;

		}
	},

	bind_node: {

		value: function (point, glasses) {

			if(!glasses)
				glasses = [this.parent];

			var res = {distance: Infinity, is_l: true};

			glasses.some(function (glass) {
				var np = glass.path.getNearestPoint(point),
					distance = np.getDistance(point);

				if(distance < res.distance){
					res.distance = distance;
					res.point = np;
					res.profile = glass;
					res.cnn_types = $p.enm.cnn_types.acn.t;
				}

				if(distance < consts.sticking_l){
					res.binded = true;
					return true;
				}

				glass.onlays.some(function (elm) {
					if (elm.project.check_distance(elm, null, res, point, "node_generatrix") === false ){
						return true;
					}
				});

			});

			if(!res.binded && res.point && res.distance < consts.sticking){
				res.binded = true;
			}

			return res;
		}
	}

});


function Scheme(_canvas){

	Scheme.superclass.constructor.call(this, _canvas);

	const _scheme = paper.project = this,
		_data = _scheme.data = {
			_bounds: null,
			_calc_order_row: null,
			_update_timer: 0
		},
		_changes = [],

		_dp_observer = function (changes) {

			if(_data._loading || _data._snapshot)
				return;

			const scheme_changed_names = ["clr","sys"];
      const row_changed_names = ["quantity","discount_percent","discount_percent_internal"];
			let evented

			changes.forEach(function(change){

				if(scheme_changed_names.indexOf(change.name) != -1){

					if(change.name == "clr"){
						_scheme.ox.clr = change.object.clr;
						_scheme.getItems({class: ProfileItem}).forEach(function (p) {
							if(!(p instanceof Onlay))
								p.clr = change.object.clr;
						})
					}

					if(change.name == "sys" && !change.object.sys.empty()){

						change.object.sys.refill_prm(_scheme.ox);

						Object.getNotifier(change.object).notify({
							type: 'rows',
							tabular: 'extra_fields'
						});

						if(_scheme.activeLayer)
							Object.getNotifier(_scheme.activeLayer).notify({
								type: 'rows',
								tabular: 'params'
							});

						_scheme.contours.forEach(function (l) {
							l.on_sys_changed();
						});


						if(change.object.sys != $p.wsql.get_user_param("editor_last_sys"))
							$p.wsql.set_user_param("editor_last_sys", change.object.sys.ref);

						if(_scheme.ox.clr.empty())
							_scheme.ox.clr = change.object.sys.default_clr;

						_scheme.register_change(true);
					}

					if(!evented){
						$p.eve.callEvent("scheme_changed", [_scheme]);
						evented = true;
					}

				}else if(row_changed_names.indexOf(change.name) != -1){

					_data._calc_order_row[change.name] = change.object[change.name];

					_scheme.register_change(true);

				}

			});
		},

		_papam_observer = function (changes) {

			if(_data._loading || _data._snapshot)
				return;

			changes.some(function(change){
				if(change.tabular == "params"){
					_scheme.register_change();
					return true;
				}
			});
		};



	this.__define({

		_noti: {
			value: {}
		},

		notify: {
			value: 	function (obj) {
				Object.getNotifier(this._noti).notify(obj);
			}
		},

		_dp: {
			value: $p.dp.buyers_order.create()
		},

		ox: {
			get: function () {
				return this._dp.characteristic;
			},
			set: function (v) {

			  const {_dp} = this;
			  let setted;

				Object.unobserve(_dp.characteristic, _papam_observer);

				_dp.characteristic = v;

        const ox = _dp.characteristic;

				_dp.len = ox.x;
				_dp.height = ox.y;
				_dp.s = ox.s;

        _data._calc_order_row = ox.calc_order_row;

				if(_data._calc_order_row){
					"quantity,price_internal,discount_percent_internal,discount_percent,price,amount,note".split(",").forEach(function (fld) {
						_dp[fld] = _data._calc_order_row[fld];
					});
				}else{
				}


				if(ox.empty())
					_dp.sys = "";

				else if(ox.owner.empty()){

					_dp.sys = $p.wsql.get_user_param("editor_last_sys");
					setted = !_dp.sys.empty();

				}else if(_dp.sys.empty()){

					$p.cat.production_params.find_rows({is_folder: false}, function(o){

						if(setted)
							return false;

						o.production.find_rows({nom: ox.owner}, function () {
							_dp.sys = o;
							setted = true;
							return false;
						});

					});
				}

				if(setted){
					_dp.sys.refill_prm(ox);
				}

				if(_dp.clr.empty()){
          _dp.clr = _dp.sys.default_clr;
        }

				Object.getNotifier(_scheme._noti).notify({
					type: 'rows',
					tabular: 'constructions'
				});
				Object.getNotifier(_dp).notify({
					type: 'rows',
					tabular: 'extra_fields'
				});

				Object.observe(ox, _papam_observer, ["row", "rows"]);

			}
		},

		_calc_order_row: {
			get: function () {
				if(!_data._calc_order_row && !this.ox.empty()){
					_data._calc_order_row = this.ox.calc_order_row;
				}
				return _data._calc_order_row;
			}
		},

		bounds: {
			get : function(){

				if(!_data._bounds){
					_scheme.contours.forEach(function(l){
						if(!_data._bounds)
							_data._bounds = l.bounds;
						else
							_data._bounds = _data._bounds.unite(l.bounds);
					});
				}

				return _data._bounds;
			}
		},

		dimension_bounds: {

			get: function(){
				var bounds = this.bounds;
				this.getItems({class: DimensionLine}).forEach(function (dl) {

					if(dl instanceof DimensionLineCustom || dl.data.impost || dl.data.contour)
						bounds = bounds.unite(dl.bounds);

				});
				return bounds;
			}
		}
	});


	this._dp.__define({

		extra_fields: {
				get: function(){
					return _scheme.ox.params;
				}
			}
	});

	Object.observe(this._dp, _dp_observer, ["update"]);


	this.connections = new function Connections() {

		this.__define({

			cnns: {
				get : function(){
					return _scheme.ox.cnn_elmnts;
				}
			}
		});

	};

	this.has_changes = function () {
		return _changes.length > 0;
	};

	this.register_change = function (with_update) {
		if(!_data._loading){
			_data._bounds = null;
			this.ox._data._modified = true;
			$p.eve.callEvent("scheme_changed", [this]);
		}
		_changes.push(Date.now());

		if(with_update)
			this.register_update();
	};

	this.register_update = function () {

		if(_data._update_timer)
			clearTimeout(_data._update_timer);

		_data._update_timer = setTimeout(function () {
			_scheme.view.update();
			_data._update_timer = 0;
		}, 100);
	};

  this.load = function(id){

    function load_contour(parent) {
      var out_cns = parent ? parent.cnstr : 0;
      _scheme.ox.constructions.find_rows({parent: out_cns}, function(row){

        var contour = new Contour( {parent: parent, row: row});

        load_contour(contour);

      });
    }

    function load_dimension_lines() {

      _scheme.ox.coordinates.find_rows({elm_type: $p.enm.elm_types.Размер}, function(row){

        new DimensionLineCustom( {
          parent: _scheme.getItem({cnstr: row.cnstr}).l_dimensions,
          row: row
        });

      });
    }

    function load_object(o){

      _scheme.ox = o;

      _data._opened = true;
      requestAnimationFrame(redraw);

      _data._bounds = new paper.Rectangle({
        point: [0, 0],
        size: [o.x, o.y]
      });
      o = null;

      load_contour(null);

      setTimeout(function () {

        _data._bounds = null;

        load_dimension_lines();

        _data._bounds = null;
        _scheme.zoom_fit();

        $p.eve.callEvent("scheme_changed", [_scheme]);

        _scheme.register_change(true);

        if(_scheme.contours.length){
          $p.eve.callEvent("layer_activated", [_scheme.contours[0], true]);
        }

        delete _data._loading;
        delete _data._snapshot;

        setTimeout(function () {
          if(_scheme.ox.coordinates.count()){
            if(_scheme.ox.specification.count()){
              $p.eve.callEvent("coordinates_calculated", [_scheme, {onload: true}]);
            }else{
              _scheme.register_change(true);
            }
          }else{
            paper.load_stamp();
          }
        }, 100);


      }, 20);

    }

    _data._loading = true;
    if(id != _scheme.ox){
      _scheme.ox = null;
    }
    _scheme.clear();

    if($p.utils.is_data_obj(id) && id.calc_order && !id.calc_order.is_new())
      load_object(id);

    else if($p.utils.is_guid(id) || $p.utils.is_data_obj(id)){
      $p.cat.characteristics.get(id, true, true)
        .then(function (ox) {
          $p.doc.calc_order.get(ox.calc_order, true, true)
            .then(function () {
              load_object(ox);
            })
        });
    }
  };

	this.unload = function () {
		_data._loading = true;
		this.clear();
		this.remove();
		Object.unobserve(this._dp, _dp_observer);
		Object.unobserve(this._dp.characteristic, _papam_observer);
		this.data._calc_order_row = null;
	};

	function redraw () {

		function process_redraw(){

			var llength = 0;

			function on_contour_redrawed(){
				if(!_changes.length){
					llength--;

					if(!llength){

						_data._bounds = null;
						_scheme.contours.forEach(function(l){
							l.draw_sizes();
						});

						_scheme.draw_sizes();

						_scheme.view.update();

					}
				}
			}


			if(_changes.length){
				_changes.length = 0;

				if(_scheme.contours.length){
					_scheme.contours.forEach(function(l){
						llength++;
						l.redraw(on_contour_redrawed);
					});
				}else{
					_scheme.draw_sizes();
				}
			}
		}

		if(_data._opened)
			requestAnimationFrame(redraw);

		process_redraw();

	}

	$p.eve.attachEvent("coordinates_calculated", function (scheme, attr) {

		if(_scheme != scheme)
			return;

		_scheme.contours.forEach(function(l){
			l.draw_visualization();
		});
		_scheme.view.update();

	});

}
Scheme._extend(paper.Project);

Scheme.prototype.__define({

	move_points: {
		value: function (delta, all_points) {

			let other = [];
			const layers = [];
      const profiles = [];

			this.selectedItems.forEach((item) => {

				if(item instanceof paper.Path && item.parent instanceof ProfileItem){

				  if(profiles.indexOf(item.parent) != -1){
				    return;
          }

          profiles.push(item.parent);

				  if(item.parent._hatching){
            item.parent._hatching.remove();
            item.parent._hatching = null;
          }

					if(!item.layer.parent || !item.parent.nearest || !item.parent.nearest()){

						var check_selected;
						item.segments.forEach(function (segm) {
							if(segm.selected && other.indexOf(segm) != -1)
								check_selected = !(segm.selected = false);
						});

						if(check_selected && !item.segments.some(function (segm) {
								return segm.selected;
							}))
							return;

						other = other.concat(item.parent.move_points(delta, all_points));

						if(layers.indexOf(item.layer) == -1){
							layers.push(item.layer);
							item.layer.clear_dimentions();
						}

					}

				}
				else if(item instanceof Filling){
					while (item.children.length > 1){
						if(!(item.children[1] instanceof Onlay))
							item.children[1].remove();
					}
				}
			});
		}
	},

	save_coordinates: {
		value: function (attr) {

			if(!this.bounds)
				return;

			var ox = this.ox;

			ox._silent();

			this.data._saving = true;

			ox.x = this.bounds.width.round(1);
			ox.y = this.bounds.height.round(1);
			ox.s = this.area;

			ox.cnn_elmnts.clear();
			ox.glasses.clear();


			this.contours.forEach(function (contour) {
				contour.save_coordinates();
			});
			$p.eve.callEvent("save_coordinates", [this, attr]);

		}
	},

	strokeBounds: {

		get: function () {

			var bounds = new paper.Rectangle();
			this.contours.forEach(function(l){
				bounds = bounds.unite(l.strokeBounds);
			});

			return bounds;
		}
	},

	zoom_fit: {
		value: function (bounds) {

			if(!bounds)
				bounds = this.strokeBounds;

			var height = (bounds.height < 1000 ? 1000 : bounds.height) + 320,
				width = (bounds.width < 1000 ? 1000 : bounds.width) + 320,
				shift;

			if(bounds){
				this.view.zoom = Math.min((this.view.viewSize.height - 20) / height, (this.view.viewSize.width - 20) / width);
				shift = (this.view.viewSize.width - bounds.width * this.view.zoom) / 2;
				if(shift < 200)
					shift = 0;
				this.view.center = bounds.center.add([shift, 40]);
			}
		}
	},

	get_svg: {

		value: function (attr) {

      this.deselectAll();

			const svg = this.exportSVG({excludeData: true});
			const bounds = this.strokeBounds.unite(this.l_dimensions.strokeBounds);

			svg.setAttribute("x", bounds.x);
			svg.setAttribute("y", bounds.y);
			svg.setAttribute("width", bounds.width);
			svg.setAttribute("height", bounds.height);
			svg.querySelector("g").removeAttribute("transform");

			return svg.outerHTML;
		}
	},

	load_stamp: {
		value: function(obx, is_snapshot){

			function do_load(obx){

				var ox = this.ox;

				if(!is_snapshot)
					this._dp.base_block = obx;

				this.clear();

				ox._mixin(obx, ["owner","sys","clr","x","y","s","s"]);

				ox.constructions.load(obx.constructions);
				ox.coordinates.load(obx.coordinates);
				ox.params.load(obx.params);
				ox.cnn_elmnts.load(obx.cnn_elmnts);
        ox.inserts.load(obx.inserts);

				ox.specification.clear();
				ox.glass_specification.clear();
				ox.glasses.clear();

				this.load(ox);

			}

			this.data._loading = true;

			if(is_snapshot){
				this.data._snapshot = true;
				do_load.call(this, obx);

			}else
				$p.cat.characteristics.get(obx, true, true)
					.then(do_load.bind(this));

		}
	},

	resize_canvas: {
		value: function(w, h){
			this.view.viewSize.width = w;
			this.view.viewSize.height = h;
		}
	},

	contours: {
		get: function () {
			return this.layers.filter((l) => l instanceof Contour);
		}
	},

	area: {
		get: function () {
			return (this.bounds.width * this.bounds.height / 1000000).round(3);
		}
	},

	clr: {
		get: function () {
			return this._dp.characteristic.clr;
		},
		set: function (v) {
			this._dp.characteristic.clr = v;
		}
	},

	l_dimensions: {
		get: function () {

			var curr;

			if(!this.data.l_dimensions){
				curr = this.activeLayer;
				this.data.l_dimensions = new DimensionLayer();
				if(curr){
          this._activeLayer = curr;
        }
			}

			if(!this.data.l_dimensions.isInserted()){
				curr = this.activeLayer;
				this.addLayer(this.data.l_dimensions);
				if(curr){
          this._activeLayer = curr;
        }
			}

			return this.data.l_dimensions;
		}
	},

	draw_sizes: {
		value: function () {

			var bounds = this.bounds;

			if(bounds){

				if(!this.l_dimensions.bottom)
					this.l_dimensions.bottom = new DimensionLine({
						pos: "bottom",
						parent: this.l_dimensions,
						offset: -120
					});
				else
					this.l_dimensions.bottom.offset = -120;

				if(!this.l_dimensions.right)
					this.l_dimensions.right = new DimensionLine({
						pos: "right",
						parent: this.l_dimensions,
						offset: -120
					});
				else
					this.l_dimensions.right.offset = -120;




				if(this.contours.some(function(l){
						return l.l_dimensions.children.some(function (dl) {
							if(dl.pos == "right" && Math.abs(dl.size - bounds.height) < consts.sticking_l ){
								return true;
							}
						});
					})){
					this.l_dimensions.right.visible = false;
				}else
					this.l_dimensions.right.redraw();


				if(this.contours.some(function(l){
						return l.l_dimensions.children.some(function (dl) {
							if(dl.pos == "bottom" && Math.abs(dl.size - bounds.width) < consts.sticking_l ){
								return true;
							}
						});
					})){
					this.l_dimensions.bottom.visible = false;
				}else
					this.l_dimensions.bottom.redraw();

			}else{
				if(this.l_dimensions.bottom)
					this.l_dimensions.bottom.visible = false;
				if(this.l_dimensions.right)
					this.l_dimensions.right.visible = false;
			}
		}
	},

	default_inset: {
		value: function (attr) {

			var rows;

			if(!attr.pos){
				rows = this._dp.sys.inserts(attr.elm_type, true);
				if(attr.inset && rows.some(function (row) { return attr.inset == row; })){
					return attr.inset;
				}
				return rows[0];
			}

			rows = this._dp.sys.inserts(attr.elm_type, "rows");

			if(rows.length == 1)
				return rows[0].nom;

			if(attr.inset && rows.some(function (row) {
					return attr.inset == row.nom && (row.pos == attr.pos || row.pos == $p.enm.positions.Любое);
				})){
				return attr.inset;
			}

			var inset;
			rows.some(function (row) {
				if(row.pos == attr.pos && row.by_default)
					return inset = row.nom;
			});
			if(!inset)
				rows.some(function (row) {
					if(row.pos == attr.pos)
						return inset = row.nom;
				});
			if(!inset)
				rows.some(function (row) {
					if(row.pos == $p.enm.positions.Любое && row.by_default)
						return inset = row.nom;
				});
			if(!inset)
				rows.some(function (row) {
					if(row.pos == $p.enm.positions.Любое)
						return inset = row.nom;
				});

			return inset;
		}
	},

	check_inset: {
		value: function (attr) {

			const inset = attr.inset ? attr.inset : attr.elm.inset;
      const elm_type = attr.elm ? attr.elm.elm_type : attr.elm_type;
      const nom = inset.nom();
      const rows = [];

			if(!nom || nom.empty()){
        return inset;
      }

			this._dp.sys.elmnts.each(function(row){
				if((elm_type ? row.elm_type == elm_type : true) && row.nom.nom() == nom)
					rows.push(row);
			});


			for(var i=0; i<rows.length; i++){
				if(rows[i].nom == inset)
					return inset;
			}

			if(rows.length)
				return rows[0].nom;

		}
	},

  check_distance: {
	  value: function(element, profile, res, point, check_only){

	    const _scheme = this;

      let distance, gp, cnns, addls,
        bind_node = typeof check_only == "string" && check_only.indexOf("node") != -1,
        bind_generatrix = typeof check_only == "string" ? check_only.indexOf("generatrix") != -1 : check_only,
        node_distance;

      function check_node_distance(node) {

        if((distance = element[node].getDistance(point)) < (_scheme._dp.sys.allow_open_cnn ? parseFloat(consts.sticking_l) : consts.sticking)){

          if(typeof res.distance == "number" && res.distance < distance)
            return 1;

          if(profile && (!res.cnn || $p.enm.cnn_types.acn.a.indexOf(res.cnn.cnn_type) == -1)){

            cnns = $p.cat.cnns.nom_cnn(element, profile, $p.enm.cnn_types.acn.a);
            if(!cnns.length)
              return 1;



          }else if(res.cnn && $p.enm.cnn_types.acn.a.indexOf(res.cnn.cnn_type) == -1)
            return 1;

          res.point = bind_node ? element[node] : point;
          res.distance = distance;
          res.profile = element;
          res.profile_point = node;
          res.cnn_types = $p.enm.cnn_types.acn.a;

          return 2;
        }

      }

      if(element === profile){
        if(profile.is_linear())
          return;
        else{

        }
        return;

      }else if(node_distance = check_node_distance("b")){
        if(node_distance == 2)
          return false;
        else
          return;

      }else if(node_distance = check_node_distance("e")){
        if(node_distance == 2)
          return false;
        else
          return;

      }

      res.profile_point = '';


      gp = element.generatrix.getNearestPoint(point);
      distance = gp.getDistance(point);

      if(distance < ((res.is_t || !res.is_l)  ? consts.sticking : consts.sticking_l)){

        if(distance < res.distance || bind_generatrix){
          if(element.d0 != 0 && element.rays.outer){
            res.point = element.rays.outer.getNearestPoint(point);
            res.distance = 0;
          }else{
            res.point = gp;
            res.distance = distance;
          }
          res.profile = element;
          res.cnn_types = $p.enm.cnn_types.acn.t;
        }
        if(bind_generatrix){
          return false;
        }
      }
    }
  },

	default_clr: {
		value: function (attr) {
			return this.ox.clr;
		}
	},

	default_furn: {
		get: function () {
			var sys = this._dp.sys,
				res;
			while (true){
				if(res = $p.job_prm.builder.base_furn[sys.ref])
					break;
				if(sys.empty())
					break;
				sys = sys.parent;
			}
			if(!res){
				res = $p.job_prm.builder.base_furn.null;
			}
			if(!res){
				$p.cat.furns.find_rows({is_folder: false, is_set: false, id: {not: ""}}, function (row) {
					res = row;
					return false;
				});
			}
			return res;
		}
	},

	selected_profiles: {
		value: function (all) {

			const res = [];
			const count = this.selectedItems.length;

			this.selectedItems.forEach(function (item) {

        const p = item.parent;

				if(p instanceof ProfileItem){
					if(all || !item.layer.parent || !p.nearest || !p.nearest()){

						if(res.indexOf(p) != -1){
              return;
            }

						if(count < 2 || !(p.data.generatrix.firstSegment.selected ^ p.data.generatrix.lastSegment.selected)){
              res.push(p);
            }

					}
				}
			});

			return res;
		}
	},

  selected_glasses: {
    value: function () {

      const res = [];

      this.selectedItems.forEach(function (item) {

        if(item instanceof Filling && res.indexOf(item) == -1){
          res.push(item);
        }
        else if(item.parent instanceof Filling && res.indexOf(item.parent) == -1){
          res.push(item.parent);
        }
      });

      return res;
    }
  },

  selected_elm: {
    get: function () {

      var res;

      this.selectedItems.some(function (item) {

        if(item instanceof BuilderElement){
          return res = item;

        }else if(item.parent instanceof BuilderElement){
          return res = item.parent;
        }
      });

      return res;
    }
  },

  hitPoints: {
    value: function (point, tolerance) {

      var item, hit;

      this.selectedItems.some(function (item) {
        hit = item.hitTest(point, { segments: true, tolerance: tolerance || 8 });
        if(hit)
          return true;
      });

      if(!hit)
        hit = this.hitTest(point, { segments: true, tolerance: tolerance || 6 });

      if(!tolerance && hit && hit.item.layer && hit.item.layer.parent){
        item = hit.item;
        if(
          (item.parent.b && item.parent.b.is_nearest(hit.point) && item.parent.rays.b &&
          (item.parent.rays.b.cnn_types.indexOf($p.enm.cnn_types.ТОбразное) != -1 || item.parent.rays.b.cnn_types.indexOf($p.enm.cnn_types.НезамкнутыйКонтур) != -1))
          || (item.parent.e && item.parent.e.is_nearest(hit.point) && item.parent.rays.e &&
          (item.parent.rays.e.cnn_types.indexOf($p.enm.cnn_types.ТОбразное) != -1 || item.parent.rays.e.cnn_types.indexOf($p.enm.cnn_types.НезамкнутыйКонтур) != -1)))
          return hit;

        item.layer.parent.profiles.some(function (item) {
          hit = item.hitTest(point, { segments: true, tolerance: tolerance || 6 });
          if(hit)
            return true;
        });
      }
      return hit;
    }
  },

  rootLayer: {
    value: function (layer) {

      if(!layer){
        layer = this.activeLayer
      }

      while (layer.parent){
        layer = layer.parent
      }

      return layer
    }
  },

  deselect_all_points: {
    value: function(with_items) {
      this.getItems({class: paper.Path}).forEach(function (item) {
        item.segments.forEach(function (s) {
          if (s.selected)
            s.selected = false;
        });
        if(with_items && item.selected)
          item.selected = false;
      });
    }
  },

  perimeter: {
    get: function () {

      let res = [],
        contours = this.contours,
        tmp;

      if(contours.length == 1){
        return contours[0].perimeter;
      }



      return res;
    }
  }


});


function Sectional(arg){
	Sectional.superclass.constructor.call(this, arg);
}
Sectional._extend(BuilderElement);


	var consts = new function Settings(){


	this.tune_paper = function (settings) {
		settings.handleSize = $p.job_prm.builder.handle_size;

		this.sticking = $p.job_prm.builder.sticking || 90;
		this.sticking_l = $p.job_prm.builder.sticking_l || 9;
		this.sticking0 = this.sticking / 2;
		this.sticking2 = this.sticking * this.sticking;
		this.font_size = $p.job_prm.builder.font_size || 60;

		this.orientation_delta = $p.job_prm.builder.orientation_delta || 20;


	}.bind(this);



	this.move_points = 'move_points';
	this.move_handle = 'move_handle';
	this.move_shapes = 'move-shapes';



};


class ToolElement extends paper.Tool {

  resetHot(type, event, mode) {

  }

  testHot(type, event, mode) {
    return this.hitTest(event)
  }

  detache_wnd() {
    if (this.wnd) {

      if (this._grid && this._grid.destructor) {
        if (this.wnd.detachObject)
          this.wnd.detachObject(true);
        delete this._grid;
      }

      if (this.wnd.wnd_options) {
        this.wnd.wnd_options(this.options.wnd);
        $p.wsql.save_options("editor", this.options);
        this.wnd.close();
      }

      delete this.wnd;
    }
    this.profile = null;
  }

  check_layer() {
    if (!this._scope.project.contours.length) {

      new Contour({parent: undefined});

      Object.getNotifier(this._scope.project._noti).notify({
        type: 'rows',
        tabular: "constructions"
      });

    }
  }

  on_activate(cursor) {

    this._scope.tb_left.select(this.options.name);

    this._scope.canvas_cursor(cursor);

    if (this.options.name != "select_node") {

      this.check_layer();

      if (this._scope.project._dp.sys.empty()) {
        $p.msg.show_msg({
          type: "alert-warning",
          text: $p.msg.bld_not_sys,
          title: $p.msg.bld_title
        });
      }
    }
  }

}



class ToolArc extends ToolElement{

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'arc'},
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false,
      duplicates: null
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-arc-arrow');
      },

      deactivate: function() {
        paper.hide_selection_bounds();
      },

      mousedown: function(event) {

        var b, e, r;

        this.mode = null;
        this.changed = false;

        if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
          && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

          this.mode = this.hitItem.item.parent.generatrix;

          if (event.modifiers.control || event.modifiers.option){

            b = this.mode.firstSegment.point;
            e = this.mode.lastSegment.point;
            r = (b.getDistance(e) / 2) + 0.001;

            this.do_arc(this.mode, event.point.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

            r = this.mode;
            this.mode = null;


          }else if(event.modifiers.space){

            e = this.mode.lastSegment.point;
            r = this.mode;
            this.mode = null;

            r.removeSegments(1);
            r.firstSegment.handleIn = null;
            r.firstSegment.handleOut = null;
            r.lineTo(e);
            r.parent.rays.clear();
            r.parent._row.r = 0;
            r.selected = true;
            r.layer.notify({type: consts.move_points, profiles: [r.parent], points: []});

          } else {
            paper.project.deselectAll();

            r = this.mode;
            r.selected = true;
            paper.project.deselect_all_points();
            this.mouseStartPos = event.point.clone();
            this.originalContent = paper.capture_selection_state();

          }

          setTimeout(function () {
            r.layer.redraw();
            r.parent.attache_wnd(paper._acc.elm.cells("a"));
            $p.eve.callEvent("layer_activated", [r.layer]);
          }, 10);

        }else{
          paper.project.deselectAll();
        }
      },

      mouseup: function(event) {

        var item = this.hitItem ? this.hitItem.item : null;

        if(item instanceof Filling && item.visible){
          item.attache_wnd(paper._acc.elm.cells("a"));
          item.selected = true;

          if(item.selected && item.layer)
            $p.eve.callEvent("layer_activated", [item.layer]);
        }

        if (this.mode && this.changed) {
        }

        paper.canvas_cursor('cursor-arc-arrow');

      },

      mousedrag: function(event) {
        if (this.mode) {

          this.changed = true;

          paper.canvas_cursor('cursor-arrow-small');

          this.do_arc(this.mode, event.point);


        }
      },

      mousemove: function(event) {
        this.hitTest(event);
      }

    })

  }

  do_arc(element, point){
    var end = element.lastSegment.point.clone();
    element.removeSegments(1);

    try{
      element.arcTo(point, end);
    }catch (e){	}

    if(!element.curves.length)
      element.lineTo(end);

    element.parent.rays.clear();
    element.selected = true;

    element.layer.notify({type: consts.move_points, profiles: [element.parent], points: []});
  }

  hitTest(event) {

    var hitSize = 6;
    this.hitItem = null;

    if (event.point)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
    if(!this.hitItem)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: hitSize });

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      paper.canvas_cursor('cursor-arc');
    } else {
      paper.canvas_cursor('cursor-arc-arrow');
    }

    return true;
  }

}



class ToolLayImpost extends ToolElement {

  constructor() {

    super()

    const tool = Object.assign(this, {
        options: {
          name: 'lay_impost',
          wnd: {
            caption: "Импосты и раскладки",
            height: 420,
            width: 320
          }
        },
        mode: null,
        hitItem: null,
        paths: [],
        changed: false
      })

    var sys;

    function tool_wnd(){

      sys = paper.project._dp.sys;

      tool.profile = $p.dp.builder_lay_impost.create();

      $p.wsql.restore_options("editor", tool.options);
      for(var prop in tool.profile._metadata.fields) {
        if(tool.options.wnd.hasOwnProperty(prop))
          tool.profile[prop] = tool.options.wnd[prop];
      }

      if(tool.profile.elm_type.empty())
        tool.profile.elm_type = $p.enm.elm_types.Импост;

      $p.dp.builder_lay_impost.handle_event(tool.profile, "value_change", {
        field: "elm_type"
      });

      if(tool.profile.align_by_y.empty())
        tool.profile.align_by_y = $p.enm.positions.Центр;
      if(tool.profile.align_by_x.empty())
        tool.profile.align_by_x = $p.enm.positions.Центр;

      if(tool.profile.clr.empty())
        tool.profile.clr = paper.project.clr;

      tool.profile._metadata.fields.inset_by_y.choice_links = tool.profile._metadata.fields.inset_by_y.choice_links = [{
        name: ["selection",	"ref"],
        path: [
          function(o, f){
            if($p.utils.is_data_obj(o)){
              return tool.profile.rama_impost.indexOf(o) != -1;

            }else{
              var refs = "";
              tool.profile.rama_impost.forEach(function (o) {
                if(refs)
                  refs += ", ";
                refs += "'" + o.ref + "'";
              });
              return "_t_.ref in (" + refs + ")";
            }
          }]
      }];

      $p.cat.clrs.selection_exclude_service(tool.profile._metadata.fields.clr, sys);

      tool.wnd = $p.iface.dat_blank(paper._dxw, tool.options.wnd);
      tool._grid = tool.wnd.attachHeadFields({
        obj: tool.profile
      });

      if(!tool.options.wnd.bounds_open){
        tool._grid.collapseKids(tool._grid.getRowById(
          tool._grid.getAllRowIds().split(",")[13]
        ));
      }
      tool._grid.attachEvent("onOpenEnd", function(id,state){
        if(id == this.getAllRowIds().split(",")[13])
          tool.options.wnd.bounds_open = state > 0;
      });

      if(!tool._grid_button_click)
        tool._grid_button_click = function (btn, bar) {
          tool.wnd.elmnts._btns.forEach(function (val, ind) {
            if(val.id == bar){
              var suffix = (ind == 0) ? "y" : "x";
              tool.profile["step_by_" + suffix] = 0;

              if(btn == "clear"){
                tool.profile["elm_by_" + suffix] = 0;

              }else if(btn == "del"){

                if(tool.profile["elm_by_" + suffix] > 0)
                  tool.profile["elm_by_" + suffix] = tool.profile["elm_by_" + suffix] - 1;
                else if(tool.profile["elm_by_" + suffix] < 0)
                  tool.profile["elm_by_" + suffix] = 0;

              }else if(btn == "add"){

                if(tool.profile["elm_by_" + suffix] < 1)
                  tool.profile["elm_by_" + suffix] = 1;
                else
                  tool.profile["elm_by_" + suffix] = tool.profile["elm_by_" + suffix] + 1;
              }

            }
          })
        };

      tool.wnd.elmnts._btns = [];
      tool._grid.getAllRowIds().split(",").forEach(function (id, ind) {
        if(id.match(/^\d+$/)){

          var cell = tool._grid.cells(id, 1);
          cell.cell.style.position = "relative";

          if(ind < 10){
            tool.wnd.elmnts._btns.push({
              id: id,
              bar: new $p.iface.OTooolBar({
                wrapper: cell.cell,
                top: '0px',
                right: '1px',
                name: id,
                width: '80px',
                height: '20px',
                class_name: "",
                buttons: [
                  {name: 'clear', text: '<i class="fa fa-trash-o"></i>', title: 'Очистить направление', class_name: "md_otooolbar_grid_button"},
                  {name: 'del', text: '<i class="fa fa-minus-square-o"></i>', title: 'Удалить ячейку', class_name: "md_otooolbar_grid_button"},
                  {name: 'add', text: '<i class="fa fa-plus-square-o"></i>', title: 'Добавить ячейку', class_name: "md_otooolbar_grid_button"}
                ],
                onclick: tool._grid_button_click
              })
            });
          }else{
            tool.wnd.elmnts._btns.push({
              id: id,
              bar: new $p.iface.OTooolBar({
                wrapper: cell.cell,
                top: '0px',
                right: '1px',
                name: id,
                width: '80px',
                height: '20px',
                class_name: "",
                buttons: [
                  {name: 'clear', text: '<i class="fa fa-trash-o"></i>', title: 'Очистить габариты', class_name: "md_otooolbar_grid_button"},
                ],
                onclick: function () {
                  tool.profile.w = tool.profile.h = 0;
                }
              })
            });
          }

          cell.cell.title = "";
        }

      });

      var wnd_options = tool.wnd.wnd_options;
      tool.wnd.wnd_options = function (opt) {
        wnd_options.call(tool.wnd, opt);

        for(var prop in tool.profile._metadata.fields) {
          if(prop.indexOf("step") == -1 && prop.indexOf("inset") == -1 && prop != "clr" && prop != "w" && prop != "h"){
            var val = tool.profile[prop];
            opt[prop] = $p.utils.is_data_obj(val) ? val.ref : val;
          }
        }
      };

    }

    this.on({

      activate: function() {
        this.on_activate('cursor-arrow-lay');
        tool_wnd();
      },

      deactivate: function() {

        paper.clear_selection_bounds();

        this.paths.forEach(function (p) {
          p.remove();
        });
        this.paths.length = 0;

        this.detache_wnd();
      },

      mouseup: function(event) {

        paper.canvas_cursor('cursor-arrow-lay');

        if(this.profile.inset_by_y.empty() && this.profile.inset_by_x.empty())
          return;

        if(!this.hitItem && (this.profile.elm_type == $p.enm.elm_types.Раскладка || !this.profile.w || !this.profile.h))
          return;

        this.check_layer();

        var layer = this.hitItem ? this.hitItem.layer : paper.project.activeLayer,
          lgeneratics = layer.profiles.map(function (p) {
            return p.nearest() ? p.rays.outer : p.generatrix
          }),
          nprofiles = [];

        function n1(p) {
          return p.segments[0].point.add(p.segments[3].point).divide(2);
        }

        function n2(p) {
          return p.segments[1].point.add(p.segments[2].point).divide(2);
        }

        function check_inset(inset, pos){

          var nom = inset.nom(),
            rows = [];

          paper.project._dp.sys.elmnts.each(function(row){
            if(row.nom.nom() == nom)
              rows.push(row);
          });

          for(var i=0; i<rows.length; i++){
            if(rows[i].pos == pos)
              return rows[i].nom;
          }

          return inset;
        }

        function rectification() {
          var bounds, ares = [],
            group = new paper.Group({ insert: false });

          function reverce(p) {
            var s = p.segments.map(function(s){return s.point.clone()})
            p.removeSegments();
            p.addSegments([s[1], s[0], s[3], s[2]]);
          }

          function by_side(name) {

            ares.sort(function (a, b) {
              return a[name] - b[name];
            });

            ares.forEach(function (p) {
              if(ares[0][name] == p[name]){
                var p1 = n1(p.profile),
                  p2 = n2(p.profile),
                  angle = p2.subtract(p1).angle.round(0);
                if(angle < 0)
                  angle += 360;

                if(name == "left" && angle != 270){
                  reverce(p.profile);
                }else if(name == "top" && angle != 0){
                  reverce(p.profile);
                }else if(name == "right" && angle != 90){
                  reverce(p.profile);
                }else if(name == "bottom" && angle != 180){
                  reverce(p.profile);
                }

                if(name == "left" || name == "right")
                  p.profile._inset = check_inset(tool.profile.inset_by_x, $p.enm.positions[name]);
                else
                  p.profile._inset = check_inset(tool.profile.inset_by_y, $p.enm.positions[name]);
              }
            });

          }

          tool.paths.forEach(function (p) {
            if(p.segments.length)
              p.parent = group;
          });
          bounds = group.bounds;

          group.children.forEach(function (p) {
            ares.push({
              profile: p,
              left: Math.abs(n1(p).x + n2(p).x - bounds.left * 2),
              top: Math.abs(n1(p).y + n2(p).y - bounds.top * 2),
              bottom: Math.abs(n1(p).y + n2(p).y - bounds.bottom * 2),
              right: Math.abs(n1(p).x + n2(p).x - bounds.right * 2)
            });
          });

          ["left","top","bottom","right"].forEach(by_side);
        }

        if(!this.hitItem){
          rectification();
        }

        tool.paths.forEach(function (p) {

          var p1, p2, iter = 0, angle, proto = {clr: tool.profile.clr};

          function do_bind() {

            var correctedp1 = false,
              correctedp2 = false;

            lgeneratics.forEach(function (gen) {
              var np = gen.getNearestPoint(p1);
              if(!correctedp1 && np.getDistance(p1) < consts.sticking){
                correctedp1 = true;
                p1 = np;
              }
              np = gen.getNearestPoint(p2);
              if(!correctedp2 && np.getDistance(p2) < consts.sticking){
                correctedp2 = true;
                p2 = np;
              }
            });

            if(tool.profile.split != $p.enm.lay_split_types.КрестВСтык && (!correctedp1 || !correctedp2)){
              nprofiles.forEach(function (p) {
                var np = p.generatrix.getNearestPoint(p1);
                if(!correctedp1 && np.getDistance(p1) < consts.sticking){
                  correctedp1 = true;
                  p1 = np;
                }
                np = p.generatrix.getNearestPoint(p2);
                if(!correctedp2 && np.getDistance(p2) < consts.sticking){
                  correctedp2 = true;
                  p2 = np;
                }
              });
            }
          }

          p.remove();
          if(p.segments.length){

            p1 = n1(p);
            p2 = n2(p);

            angle = p2.subtract(p1).angle;
            if((angle > -40 && angle < 40) || (angle > 180-40 && angle < 180+40)){
              proto.inset = p._inset || tool.profile.inset_by_y;
            }else{
              proto.inset = p._inset || tool.profile.inset_by_x;
            }

            if(tool.profile.elm_type == $p.enm.elm_types.Раскладка){

              nprofiles.push(new Onlay({
                generatrix: new paper.Path({
                  segments: [p1, p2]
                }),
                parent: tool.hitItem,
                proto: proto
              }));

            }else{

              while (iter < 10){

                iter++;
                do_bind();
                angle = p2.subtract(p1).angle;
                var delta = Math.abs(angle % 90);

                if(delta > 45)
                  delta -= 90;

                if(delta < 0.02)
                  break;

                if(angle > 180)
                  angle -= 180;
                else if(angle < 0)
                  angle += 180;

                if((angle > -40 && angle < 40) || (angle > 180-40 && angle < 180+40)){
                  p1.y = p2.y = (p1.y + p2.y) / 2;

                }else if((angle > 90-40 && angle < 90+40) || (angle > 270-40 && angle < 270+40)){
                  p1.x = p2.x = (p1.x + p2.x) / 2;

                }else
                  break;
              }

              if(p2.getDistance(p1) > proto.inset.nom().width)
                nprofiles.push(new Profile({
                  generatrix: new paper.Path({
                    segments: [p1, p2]
                  }),
                  parent: layer,
                  proto: proto
                }));
            }
          }
        });
        tool.paths.length = 0;

        nprofiles.forEach(function (p) {
          var bcnn = p.cnn_point("b"),
            ecnn = p.cnn_point("e");
        });

        if(!this.hitItem)
          setTimeout(function () {
            paper.tools[1].activate();
          }, 100);

      },

      mousemove: function(event) {

        this.hitTest(event);

        this.paths.forEach(function (p) {
          p.removeSegments();
        });

        if(this.profile.inset_by_y.empty() && this.profile.inset_by_x.empty())
          return;

        var bounds, gen, hit = !!this.hitItem;

        if(hit){
          bounds = this.hitItem.bounds;
          gen = this.hitItem.path;
        }else if(this.profile.w && this.profile.h) {
          gen = new paper.Path({
            insert: false,
            segments: [[0,0], [0, -this.profile.h], [this.profile.w, -this.profile.h], [this.profile.w, 0]],
            closed: true
          });
          bounds = gen.bounds;
          paper.project.zoom_fit(paper.project.strokeBounds.unite(bounds));

        }else
          return;

        var stepy = this.profile.step_by_y || (this.profile.elm_by_y && bounds.height / (this.profile.elm_by_y + ((hit || this.profile.elm_by_y < 2) ? 1 : -1))),
          county = this.profile.elm_by_y > 0 ? this.profile.elm_by_y.round(0) : Math.round(bounds.height / stepy) - 1,
          stepx = this.profile.step_by_x || (this.profile.elm_by_x && bounds.width / (this.profile.elm_by_x + ((hit || this.profile.elm_by_x < 2) ? 1 : -1))),
          countx = this.profile.elm_by_x > 0 ? this.profile.elm_by_x.round(0) : Math.round(bounds.width / stepx) - 1,
          w2x = this.profile.inset_by_x.nom().width / 2,
          w2y = this.profile.inset_by_y.nom().width / 2,
          clr = BuilderElement.clr_by_clr(this.profile.clr, false),
          by_x = [], by_y = [], base, pos, path, i, j, pts;

        function get_path() {
          base++;
          if(base < tool.paths.length){
            path = tool.paths[base];
            path.fillColor = clr;
            if(!path.isInserted())
              path.parent = tool.hitItem ? tool.hitItem.layer : paper.project.activeLayer;
          }else{
            path = new paper.Path({
              strokeColor: 'black',
              fillColor: clr,
              strokeScaling: false,
              guide: true,
              closed: true
            });
            tool.paths.push(path);
          }
          return path;
        }

        function get_points(p1, p2) {

          var res = {
              p1: new paper.Point(p1),
              p2: new paper.Point(p2)
            },
            c1 = gen.contains(res.p1),
            c2 = gen.contains(res.p2);

          if(c1 && c2)
            return res;

          var intersect = gen.getIntersections(new paper.Path({ insert: false, segments: [res.p1, res.p2] }));

          if(c1){
            intersect.reduce(function (sum, curr) {
              var dist = sum.point.getDistance(curr.point);
              if(dist < sum.dist){
                res.p2 = curr.point;
                sum.dist = dist;
              }
              return sum;
            }, {dist: Infinity, point: res.p2});
          }else if(c2){
            intersect.reduce(function (sum, curr) {
              var dist = sum.point.getDistance(curr.point);
              if(dist < sum.dist){
                res.p1 = curr.point;
                sum.dist = dist;
              }
              return sum;
            }, {dist: Infinity, point: res.p1});
          }else if(intersect.length > 1){
            intersect.reduce(function (sum, curr) {
              var dist = sum.point.getDistance(curr.point);
              if(dist < sum.dist){
                res.p2 = curr.point;
                sum.dist = dist;
              }
              return sum;
            }, {dist: Infinity, point: res.p2});
            intersect.reduce(function (sum, curr) {
              var dist = sum.point.getDistance(curr.point);
              if(dist < sum.dist){
                res.p1 = curr.point;
                sum.dist = dist;
              }
              return sum;
            }, {dist: Infinity, point: res.p1});
          }else{
            return null;
          }

          return res;
        }

        function do_x() {
          for(i = 0; i < by_x.length; i++){

            if(!by_y.length || tool.profile.split.empty() ||
              tool.profile.split == $p.enm.lay_split_types.ДелениеГоризонтальных ||
              tool.profile.split == $p.enm.lay_split_types.КрестПересечение){

              if(pts = get_points([by_x[i], bounds.bottom], [by_x[i], bounds.top]))
                get_path().addSegments([[pts.p1.x-w2x, pts.p1.y], [pts.p2.x-w2x, pts.p2.y], [pts.p2.x+w2x, pts.p2.y], [pts.p1.x+w2x, pts.p1.y]]);

            }else{
              by_y.sort(function (a,b) { return b-a; });
              for(j = 0; j < by_y.length; j++){

                if(j == 0){
                  if(hit && (pts = get_points([by_x[i], bounds.bottom], [by_x[i], by_y[j]])))
                    get_path().addSegments([[pts.p1.x-w2x, pts.p1.y], [pts.p2.x-w2x, pts.p2.y+w2x], [pts.p2.x+w2x, pts.p2.y+w2x], [pts.p1.x+w2x, pts.p1.y]]);

                }else{
                  if(pts = get_points([by_x[i], by_y[j-1]], [by_x[i], by_y[j]]))
                    get_path().addSegments([[pts.p1.x-w2x, pts.p1.y-w2x], [pts.p2.x-w2x, pts.p2.y+w2x], [pts.p2.x+w2x, pts.p2.y+w2x], [pts.p1.x+w2x, pts.p1.y-w2x]]);

                }

                if(j == by_y.length -1){
                  if(hit && (pts = get_points([by_x[i], by_y[j]], [by_x[i], bounds.top])))
                    get_path().addSegments([[pts.p1.x-w2x, pts.p1.y-w2x], [pts.p2.x-w2x, pts.p2.y], [pts.p2.x+w2x, pts.p2.y], [pts.p1.x+w2x, pts.p1.y-w2x]]);

                }

              }
            }
          }
        }

        function do_y() {
          for(i = 0; i < by_y.length; i++){

            if(!by_x.length || tool.profile.split.empty() ||
              tool.profile.split == $p.enm.lay_split_types.ДелениеВертикальных ||
              tool.profile.split == $p.enm.lay_split_types.КрестПересечение){

              if(pts = get_points([bounds.left, by_y[i]], [bounds.right, by_y[i]]))
                get_path().addSegments([[pts.p1.x, pts.p1.y-w2y], [pts.p2.x, pts.p2.y-w2y], [pts.p2.x, pts.p2.y+w2y], [pts.p1.x, pts.p1.y+w2y]]);

            }else{
              by_x.sort(function (a,b) { return a-b; });
              for(j = 0; j < by_x.length; j++){

                if(j == 0){
                  if(hit && (pts = get_points([bounds.left, by_y[i]], [by_x[j], by_y[i]])))
                    get_path().addSegments([[pts.p1.x, pts.p1.y-w2y], [pts.p2.x-w2y, pts.p2.y-w2y], [pts.p2.x-w2y, pts.p2.y+w2y], [pts.p1.x, pts.p1.y+w2y]]);

                }else{
                  if(pts = get_points([by_x[j-1], by_y[i]], [by_x[j], by_y[i]]))
                    get_path().addSegments([[pts.p1.x+w2y, pts.p1.y-w2y], [pts.p2.x-w2y, pts.p2.y-w2y], [pts.p2.x-w2y, pts.p2.y+w2y], [pts.p1.x+w2y, pts.p1.y+w2y]]);

                }

                if(j == by_x.length -1){
                  if(hit && (pts = get_points([by_x[j], by_y[i]], [bounds.right, by_y[i]])))
                    get_path().addSegments([[pts.p1.x+w2y, pts.p1.y-w2y], [pts.p2.x, pts.p2.y-w2y], [pts.p2.x, pts.p2.y+w2y], [pts.p1.x+w2y, pts.p1.y+w2y]]);

                }

              }
            }
          }
        }

        if(stepy){
          if(tool.profile.align_by_y == $p.enm.positions.Центр){

            base = bounds.top + bounds.height / 2;
            if(county % 2){
              by_y.push(base);
            }
            for(i = 1; i < county; i++){

              if(county % 2)
                pos = base + stepy * i;
              else
                pos = base + stepy / 2 + (i > 1 ? stepy * (i - 1) : 0);

              if(pos + w2y + consts.sticking_l < bounds.bottom)
                by_y.push(pos);

              if(county % 2)
                pos = base - stepy * i;
              else
                pos = base - stepy / 2 - (i > 1 ? stepy * (i - 1) : 0);

              if(pos - w2y - consts.sticking_l > bounds.top)
                by_y.push(pos);
            }

          }else if(tool.profile.align_by_y == $p.enm.positions.Верх){

            if(hit){
              for(i = 1; i <= county; i++){
                pos = bounds.top + stepy * i;
                if(pos + w2y + consts.sticking_l < bounds.bottom)
                  by_y.push(pos);
              }
            }else{
              for(i = 0; i < county; i++){
                pos = bounds.top + stepy * i;
                if(pos - w2y - consts.sticking_l < bounds.bottom)
                  by_y.push(pos);
              }
            }

          }else if(tool.profile.align_by_y == $p.enm.positions.Низ){

            if(hit){
              for(i = 1; i <= county; i++){
                pos = bounds.bottom - stepy * i;
                if(pos - w2y - consts.sticking_l > bounds.top)
                  by_y.push(bounds.bottom - stepy * i);
              }
            }else{
              for(i = 0; i < county; i++){
                pos = bounds.bottom - stepy * i;
                if(pos + w2y + consts.sticking_l > bounds.top)
                  by_y.push(bounds.bottom - stepy * i);
              }
            }
          }
        }

        if(stepx){
          if(tool.profile.align_by_x == $p.enm.positions.Центр){

            base = bounds.left + bounds.width / 2;
            if(countx % 2){
              by_x.push(base);
            }
            for(i = 1; i < countx; i++){

              if(countx % 2)
                pos = base + stepx * i;
              else
                pos = base + stepx / 2 + (i > 1 ? stepx * (i - 1) : 0);

              if(pos + w2x + consts.sticking_l < bounds.right)
                by_x.push(pos);

              if(countx % 2)
                pos = base - stepx * i;
              else
                pos = base - stepx / 2 - (i > 1 ? stepx * (i - 1) : 0);

              if(pos - w2x - consts.sticking_l > bounds.left)
                by_x.push(pos);
            }

          }else if(tool.profile.align_by_x == $p.enm.positions.Лев){

            if(hit){
              for(i = 1; i <= countx; i++){
                pos = bounds.left + stepx * i;
                if(pos + w2x + consts.sticking_l < bounds.right)
                  by_x.push(pos);
              }
            }else{
              for(i = 0; i < countx; i++){
                pos = bounds.left + stepx * i;
                if(pos - w2x - consts.sticking_l < bounds.right)
                  by_x.push(pos);
              }
            }


          }else if(tool.profile.align_by_x == $p.enm.positions.Прав){

            if(hit){
              for(i = 1; i <= countx; i++){
                pos = bounds.right - stepx * i;
                if(pos - w2x - consts.sticking_l > bounds.left)
                  by_x.push(pos);
              }
            }else{
              for(i = 0; i < countx; i++){
                pos = bounds.right - stepx * i;
                if(pos + w2x + consts.sticking_l > bounds.left)
                  by_x.push(pos);
              }
            }
          }
        }

        base = 0;
        if(tool.profile.split == $p.enm.lay_split_types.ДелениеВертикальных){
          do_y();
          do_x();
        }else{
          do_x();
          do_y();
        }

      }
    })

  }

  hitTest(event) {

    this.hitItem = null;

    if (event.point)
      this.hitItem = paper.project.hitTest(event.point, { fill: true, class: paper.Path });

    if (this.hitItem && this.hitItem.item.parent instanceof Filling){
      paper.canvas_cursor('cursor-lay-impost');
      this.hitItem = this.hitItem.item.parent;

    } else {
      paper.canvas_cursor('cursor-arrow-lay');
      this.hitItem = null;
    }

    return true;
  }

  detache_wnd(){

    if(this.wnd){
      this.wnd.elmnts._btns.forEach(function (btn) {
        if(btn.bar && btn.bar.unload)
          btn.bar.unload();
      });
    }

    ToolElement.prototype.detache_wnd.call(this)

  }

}



class ToolPan extends ToolElement {

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'pan'},
      distanceThreshold: 8,
      mouseStartPos: new paper.Point(),
      mode: 'pan',
      zoomFactor: 1.1
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-hand');
      },

      deactivate: function() {
      },

      mousedown: function(event) {
        this.mouseStartPos = event.point.subtract(paper.view.center);
        this.mode = '';
        if (event.modifiers.control || event.modifiers.option) {
          this.mode = 'zoom';
        } else {
          paper.canvas_cursor('cursor-hand-grab');
          this.mode = 'pan';
        }
      },

      mouseup: function(event) {
        if (this.mode == 'zoom') {
          var zoomCenter = event.point.subtract(paper.view.center);
          var moveFactor = this.zoomFactor - 1.0;
          if (event.modifiers.control) {
            paper.view.zoom *= this.zoomFactor;
            paper.view.center = paper.view.center.add(zoomCenter.multiply(moveFactor / this.zoomFactor));
          } else if (event.modifiers.option) {
            paper.view.zoom /= this.zoomFactor;
            paper.view.center = paper.view.center.subtract(zoomCenter.multiply(moveFactor));
          }
        } else if (this.mode == 'zoom-rect') {
          var start = paper.view.center.add(this.mouseStartPos);
          var end = event.point;
          paper.view.center = start.add(end).multiply(0.5);
          var dx = paper.view.bounds.width / Math.abs(end.x - start.x);
          var dy = paper.view.bounds.height / Math.abs(end.y - start.y);
          paper.view.zoom = Math.min(dx, dy) * paper.view.zoom;
        }
        this.hitTest(event);
        this.mode = '';
      },

      mousedrag: function(event) {
        if (this.mode == 'zoom') {
          this.mode = 'zoom-rect';
        } else if (this.mode == 'zoom-rect') {
          paper.drag_rect(paper.view.center.add(this.mouseStartPos), event.point);
        } else if (this.mode == 'pan') {
          var pt = event.point.subtract(paper.view.center);
          var delta = this.mouseStartPos.subtract(pt);
          paper.view.scrollBy(delta);
          this.mouseStartPos = pt;
        }
      },

      mousemove: function(event) {
        this.hitTest(event);
      },

      keydown: function(event) {
        this.hitTest(event);
      },

      keyup: function(event) {
        this.hitTest(event);
      }
    })

  }

  testHot(type, event, mode) {
    var spacePressed = event && event.modifiers.space;
    if (mode != 'tool-zoompan' && !spacePressed)
      return false;
    return this.hitTest(event);
  }

  hitTest(event) {

    if (event.modifiers.control) {
      paper.canvas_cursor('cursor-zoom-in');
    } else if (event.modifiers.option) {
      paper.canvas_cursor('cursor-zoom-out');
    } else {
      paper.canvas_cursor('cursor-hand');
    }

    return true;
  }

}


class PenControls {

  constructor(tool) {

    const t = this;
    const _cont = this._cont = document.createElement('div');

    this._tool = tool;
    this.mousemove = this.mousemove.bind(this);
    this.create_click = this.create_click.bind(this);

    function input_change() {

      switch(this.name) {

        case 'x':
        case 'y':
          setTimeout(() => {
            tool.emit("mousemove", {
              point: t.point,
              modifiers: {}
            });
          });
          break;

        case 'l':
        case 'a':

          if(!tool.path){
            return false;
          }

          const p = new paper.Point();
          p.length = parseFloat(t._l.value || 0);
          p.angle = parseFloat(t._a.value || 0);
          p.y = -p.y;

          t.mousemove({point: tool.point1.add(p)}, true);

          input_change.call({name: "x"});
          break;
      }
    }

    paper._wrapper.appendChild(_cont);
    _cont.className = "pen_cont";

    paper.project.view.on('mousemove', this.mousemove);

    _cont.innerHTML = "<table><tr><td>x:</td><td><input type='number' name='x' /></td><td>y:</td><td><input type='number' name='y' /></td></tr>" +
      "<tr><td>l:</td><td><input type='number' name='l' /></td><td>α:</td><td><input type='number' name='a' /></td></tr>" +
      "<tr><td colspan='4'><input type='button' name='click' value='Создать точку' /></td></tr></table>";

    this._x = _cont.querySelector("[name=x]");
    this._y = _cont.querySelector("[name=y]");
    this._l = _cont.querySelector("[name=l]");
    this._a = _cont.querySelector("[name=a]");

    this._x.onchange = input_change;
    this._y.onchange = input_change;
    this._l.onchange = input_change;
    this._a.onchange = input_change;

    _cont.querySelector("[name=click]").onclick = this.create_click;


  }

  get point(){
    const bounds = paper.project.bounds,
      x = parseFloat(this._x.value || 0) + (bounds ? bounds.x : 0),
      y = (bounds ? (bounds.height + bounds.y) : 0) - parseFloat(this._y.value || 0);
    return new paper.Point([x, y]);
  }

  blur(){
    var focused = document.activeElement;
    if(focused == this._x)
      this._x.blur();
    else if(focused == this._y)
      this._y.blur();
    else if(focused == this._l)
      this._l.blur();
    else if(focused == this._a)
      this._a.blur();
  }

  mousemove(event, ignore_pos) {

    const bounds = paper.project.bounds;
    const pos = ignore_pos || paper.project.view.projectToView(event.point);

    if (!ignore_pos) {
      this._cont.style.top = pos.y + 16 + "px";
      this._cont.style.left = pos.x - 20 + "px";

    }

    if (bounds) {
      this._x.value = (event.point.x - bounds.x).toFixed(0);
      this._y.value = (bounds.height + bounds.y - event.point.y).toFixed(0);

      if (!ignore_pos) {

        if (this._tool.path) {
          this._l.value = this._tool.point1.getDistance(this.point).round(1);
          const p = this.point.subtract(this._tool.point1);
          p.y = -p.y;
          let angle = p.angle;
          if (angle < 0){
            angle += 360;
          }
          this._a.value = angle.round(1);
        }
        else {
          this._l.value = 0;
          this._a.value = 0;
        }
      }
    }
  }

  create_click() {
    setTimeout(() => {
      this._tool.emit("mousedown", {
        modifiers: {}
      });
      setTimeout(() => {
        this._tool.emit("mouseup", {
          point: this.point,
          modifiers: {}
        });
      });
    });
  }

  unload() {
    paper.project.view.off('mousemove', this.mousemove);
    paper._wrapper.removeChild(this._cont);
    this._cont = null;
  }

}


class ToolPen extends ToolElement {

  constructor() {

    super()

    const tool = Object.assign(this, {
      options: {
        name: 'pen',
        wnd: {
          caption: "Новый сегмент профиля",
          width: 320,
          height: 240,
          bind_generatrix: true,
          bind_node: false,
          inset: "",
          clr: ""
        }
      },
      point1: new paper.Point(),
      last_profile: null,
      mode: null,
      hitItem: null,
      originalContent: null,
      start_binded: false
    })

    let on_layer_activated,
      on_scheme_changed,
      sys;

    function tool_wnd(){

      sys = paper.project._dp.sys;

      tool.profile = $p.dp.builder_pen.create();

      $p.wsql.restore_options("editor", tool.options);
      ["elm_type","inset","bind_generatrix","bind_node"].forEach(function (prop) {
        if(prop == "bind_generatrix" || prop == "bind_node" || tool.options.wnd[prop])
          tool.profile[prop] = tool.options.wnd[prop];
      });

      if((tool.profile.elm_type.empty() || tool.profile.elm_type == $p.enm.elm_types.Рама) &&
          paper.project.activeLayer instanceof Contour && paper.project.activeLayer.profiles.length) {
        tool.profile.elm_type = $p.enm.elm_types.Импост;
      }
      else if((tool.profile.elm_type.empty() || tool.profile.elm_type == $p.enm.elm_types.Импост) &&
          paper.project.activeLayer instanceof Contour && !paper.project.activeLayer.profiles.length) {
        tool.profile.elm_type = $p.enm.elm_types.Рама;
      }

      $p.dp.builder_pen.handle_event(tool.profile, "value_change", {
        field: "elm_type"
      });

      tool.profile.clr = paper.project.clr;

      tool.profile._metadata.fields.inset.choice_links = [{
        name: ["selection",	"ref"],
        path: [
          function(o, f){
            if($p.utils.is_data_obj(o)){
              return tool.profile.rama_impost.indexOf(o) != -1;

            }else{
              var refs = "";
              tool.profile.rama_impost.forEach(function (o) {
                if(refs)
                  refs += ", ";
                refs += "'" + o.ref + "'";
              });
              return "_t_.ref in (" + refs + ")";
            }
          }]
      }];

      $p.cat.clrs.selection_exclude_service(tool.profile._metadata.fields.clr, sys);

      tool.wnd = $p.iface.dat_blank(paper._dxw, tool.options.wnd);
      tool._grid = tool.wnd.attachHeadFields({
        obj: tool.profile
      });

      const wnd_options = tool.wnd.wnd_options;
      tool.wnd.wnd_options = function (opt) {
        wnd_options.call(tool.wnd, opt);
        opt.bind_generatrix = tool.profile.bind_generatrix;
        opt.bind_node = tool.profile.bind_node;
      }

    }


    tool.on({

      activate: function() {

        this.on_activate('cursor-pen-freehand');

        this._controls = new PenControls(this);

        tool_wnd();

        if(!on_layer_activated)
          on_layer_activated = $p.eve.attachEvent("layer_activated", function (contour, virt) {

            if(!virt && contour.project == paper.project && !paper.project.data._loading && !paper.project.data._snapshot){
              tool.decorate_layers();
            }
          });

        if(!on_scheme_changed)
          on_scheme_changed = $p.eve.attachEvent("scheme_changed", function (scheme) {
            if(scheme == paper.project && sys != scheme._dp.sys){

              delete tool.profile._metadata.fields.inset.choice_links;
              tool.detache_wnd();
              tool_wnd();

            }
          });

        tool.decorate_layers();

      },

      deactivate: function() {
        paper.clear_selection_bounds();

        if(on_layer_activated){
          $p.eve.detachEvent(on_layer_activated);
          on_layer_activated = null;
        }

        if(on_scheme_changed){
          $p.eve.detachEvent(on_scheme_changed);
          on_scheme_changed = null;
        }

        tool.decorate_layers(true);

        delete tool.profile._metadata.fields.inset.choice_links;

        tool.detache_wnd();

        if(this.path){
          this.path.removeSegments();
          this.path.remove();
        }
        this.path = null;
        this.last_profile = null;
        this.mode = null;

        tool._controls.unload();

      },

      mousedown: function(event) {

        paper.project.deselectAll();

        if(event.event && event.event.which && event.event.which > 1){
          return this.keydown({key: 'escape'});
        }

        tool.last_profile = null;

        if(tool.profile.elm_type == $p.enm.elm_types.Добор || tool.profile.elm_type == $p.enm.elm_types.Соединитель){

          if(this.addl_hit){

          }

        }else{

          if(this.mode == 'continue'){
            this.mode = 'create';
            this.start_binded = false;

          }
        }
      },

      mouseup: function(event) {

        paper.canvas_cursor('cursor-pen-freehand');

        if(event.event && event.event.which && event.event.which > 1){
          return this.keydown({key: 'escape'});
        }

        this.check_layer();

        let whas_select;

        if(this.addl_hit && this.addl_hit.glass && this.profile.elm_type == $p.enm.elm_types.Добор && !this.profile.inset.empty()){

          new ProfileAddl({
            generatrix: this.addl_hit.generatrix,
            proto: this.profile,
            parent: this.addl_hit.profile,
            side: this.addl_hit.side
          });
        }
        else if(this.mode == 'create' && this.path) {

          if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

            paper.project.activeLayer.glasses(false, true).some(function (glass) {

              if(glass.contains(this.path.firstSegment.point) && glass.contains(this.path.lastSegment.point)){
                new Onlay({
                  generatrix: this.path,
                  proto: this.profile,
                  parent: glass
                });
                this.path = null;
                return true;
              }

            }.bind(this));

          }
          else{
            this.last_profile = new Profile({generatrix: this.path, proto: this.profile});
          }

          this.path = null;

          if(this.profile.elm_type == $p.enm.elm_types.Рама){
            setTimeout(() => {
              if(this.last_profile){
                this._controls.mousemove({point: this.last_profile.e}, true);
                this.last_profile = null;
                this._controls.create_click();
              }
            }, 50);
          }
        }
        else if (this.hitItem && this.hitItem.item && (event.modifiers.shift || event.modifiers.control || event.modifiers.option)) {

          let item = this.hitItem.item.parent;
          if (event.modifiers.space && item.nearest && item.nearest()) {
            item = item.nearest();
          }

          if (event.modifiers.shift) {
            item.selected = !item.selected;
          } else {
            paper.project.deselectAll();
            item.selected = true;
          }

          if(item instanceof ProfileItem && item.isInserted()){
            item.attache_wnd(paper._acc.elm.cells("a"));
            whas_select = true;
            tool._controls.blur();

          }else if(item instanceof Filling && item.visible){
            item.attache_wnd(paper._acc.elm.cells("a"));
            whas_select = true;
            tool._controls.blur();
          }

          if(item.selected && item.layer){
            item.layer.activate(true);
          }

        }

        if(!whas_select && !this.mode && !this.addl_hit) {

          this.mode = 'continue';
          this.point1 = tool._controls.point;

          if (!this.path){
            this.path = new paper.Path({
              strokeColor: 'black',
              segments: [this.point1]
            });
            this.currentSegment = this.path.segments[0];
            this.originalHandleIn = this.currentSegment.handleIn.clone();
            this.originalHandleOut = this.currentSegment.handleOut.clone();
            this.currentSegment.selected = true;
          }
          this.start_binded = false;
          return;

        }

        if(this.path) {
          this.path.remove();
          this.path = null;
        }
        this.mode = null;

      },

      mousemove: function(event) {

        this.hitTest(event);

        if(this.addl_hit && this.addl_hit.glass){

          if (!this.path){
            this.path = new paper.Path({
              strokeColor: 'black',
              fillColor: 'white',
              strokeScaling: false,
              guide: true
            });
          }

          this.path.removeSegments();

          var profiles = this.addl_hit.glass.profiles,
            prev = this.addl_hit.rib==0 ? profiles[profiles.length-1] : profiles[this.addl_hit.rib-1],
            curr = profiles[this.addl_hit.rib],
            next = this.addl_hit.rib==profiles.length-1 ? profiles[0] : profiles[this.addl_hit.rib+1];

          var path_prev = prev.outer ? prev.profile.rays.outer : prev.profile.rays.inner,
            path_curr = curr.outer ? curr.profile.rays.outer : curr.profile.rays.inner,
            path_next = next.outer ? next.profile.rays.outer : next.profile.rays.inner;

          var p1 = path_curr.intersect_point(path_prev, curr.b),
            p2 = path_curr.intersect_point(path_next, curr.e),
            sub_path = path_curr.get_subpath(p1, p2);

          this.path.addSegments(sub_path.segments);

          sub_path = sub_path.equidistant(-(this.profile.inset.nom().width || 20));
          sub_path.reverse();
          this.path.addSegments(sub_path.segments);
          sub_path.removeSegments();
          sub_path.remove();
          this.path.closePath();

          if(!this.addl_hit.generatrix){
            this.addl_hit.generatrix = new paper.Path({insert: false});
          }
          p1 = prev.profile.generatrix.getNearestPoint(p1);
          p2 = next.profile.generatrix.getNearestPoint(p2);
          this.addl_hit.generatrix.removeSegments();
          this.addl_hit.generatrix.addSegments(path_curr.get_subpath(p1, p2).segments);


        }else if(this.path){

          if(this.mode){

            var delta = event.point.subtract(this.point1),
              dragIn = false,
              dragOut = false,
              invert = false,
              handlePos;

            if (delta.length < consts.sticking)
              return;

            if (this.mode == 'create') {
              dragOut = true;
              if (this.currentSegment.index > 0)
                dragIn = true;
            } else  if (this.mode == 'close') {
              dragIn = true;
              invert = true;
            } else  if (this.mode == 'continue') {
              dragOut = true;
            } else if (this.mode == 'adjust') {
              dragOut = true;
            } else  if (this.mode == 'join') {
              dragIn = true;
              invert = true;
            } else  if (this.mode == 'convert') {
              dragIn = true;
              dragOut = true;
            }

            if (dragIn || dragOut) {
              var i, res, element, bind = this.profile.bind_node ? "node_" : "";

              if(this.profile.bind_generatrix)
                bind += "generatrix";

              if (invert)
                delta = delta.negate();

              if (dragIn && dragOut) {
                handlePos = this.originalHandleOut.add(delta);
                if(!event.modifiers.shift) {
                  handlePos = handlePos.snap_to_angle();
                }
                this.currentSegment.handleOut = handlePos;
                this.currentSegment.handleIn = handlePos.negate();

              } else if (dragOut) {

                if(!event.modifiers.shift) {
                  delta = delta.snap_to_angle();
                }

                if(this.path.segments.length > 1)
                  this.path.lastSegment.point = this.point1.add(delta);
                else
                  this.path.add(this.point1.add(delta));

                if(!this.start_binded){

                  if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

                    res = Onlay.prototype.bind_node(this.path.firstSegment.point, paper.project.activeLayer.glasses(false, true));
                    if(res.binded)
                      tool.path.firstSegment.point = tool.point1 = res.point;

                  }else{

                    res = {distance: Infinity};
                    for(i in paper.project.activeLayer.children){

                      element = paper.project.activeLayer.children[i];
                      if (element instanceof Profile){

                        if(element.children.some(function (addl) {
                            if(addl instanceof ProfileAddl && paper.project.check_distance(addl, null, res, tool.path.firstSegment.point, bind) === false){
                              tool.path.firstSegment.point = tool.point1 = res.point;
                              return true;
                            }
                          })){
                          break;

                        }else if (paper.project.check_distance(element, null, res, this.path.firstSegment.point, bind) === false ){
                          tool.path.firstSegment.point = tool.point1 = res.point;
                          break;
                        }
                      }
                    }
                    this.start_binded = true;
                  }
                }

                if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

                  res = Onlay.prototype.bind_node(this.path.lastSegment.point, paper.project.activeLayer.glasses(false, true));
                  if(res.binded)
                    this.path.lastSegment.point = res.point;

                }else{

                  res = {distance: Infinity};
                  for(i = 0; i < paper.project.activeLayer.children.length; i++){

                    element = paper.project.activeLayer.children[i];
                    if (element instanceof Profile){

                      if(element.children.some(function (addl) {
                          if(addl instanceof ProfileAddl && paper.project.check_distance(addl, null, res, tool.path.lastSegment.point, bind) === false){
                            tool.path.lastSegment.point = res.point;
                            return true;
                          }
                        })){
                        break;

                      }else if (paper.project.check_distance(element, null, res, this.path.lastSegment.point, bind) === false ){
                        this.path.lastSegment.point = res.point;
                        break;

                      }
                    }
                  }
                }

              } else {
                handlePos = this.originalHandleIn.add(delta);
                if(!event.modifiers.shift) {
                  handlePos = handlePos.snap_to_angle();
                }
                this.currentSegment.handleIn = handlePos;
                this.currentSegment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
              }
              this.path.selected = true;
            }

          }else{
            this.path.removeSegments();
            this.path.remove();
            this.path = null;
          }

          if(event.className != "ToolEvent"){
            paper.project.register_update();
          }
        }

      },

      keydown: this.keydown

    })

  }

  hitTest(event) {

    var hitSize = 16;

    this.addl_hit = null;
    this.hitItem = null;

    if(this.profile.elm_type == $p.enm.elm_types.Добор || this.profile.elm_type == $p.enm.elm_types.Соединитель){


      if (event.point)
        this.hitItem = paper.project.hitTest(event.point, { stroke:true, curves:true, tolerance: hitSize });

      if (this.hitItem) {

        if(this.hitItem.item.layer == paper.project.activeLayer &&  this.hitItem.item.parent instanceof ProfileItem && !(this.hitItem.item.parent instanceof Onlay)){

          var hit = {
            point: this.hitItem.point,
            profile: this.hitItem.item.parent
          };

          if(hit.profile.rays.inner.getNearestPoint(event.point).getDistance(event.point, true) <
            hit.profile.rays.outer.getNearestPoint(event.point).getDistance(event.point, true))
            hit.side = "inner";
          else
            hit.side = "outer";

          hit.profile.layer.glasses(false, true).some(function (glass) {

            for(var i=0; i<glass.profiles.length; i++){
              var rib = glass.profiles[i];
              if(rib.profile == hit.profile && rib.sub_path && rib.sub_path.getNearestPoint(hit.point).is_nearest(hit.point, true)){

                if(hit.side == "outer" && rib.outer || hit.side == "inner" && !rib.outer){
                  hit.rib = i;
                  hit.glass = glass;
                  return true;
                }
              }
            }
          });

          if(hit.glass){
            this.addl_hit = hit;
            paper.canvas_cursor('cursor-pen-adjust');
          }

        }else if(this.hitItem.item.parent instanceof Filling){


        }else{
          paper.canvas_cursor('cursor-pen-freehand');
        }

      } else {

        this.hitItem = paper.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
        paper.canvas_cursor('cursor-pen-freehand');
      }

    }else{
      hitSize = 6;

      if (event.point)
        this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });

      if(!this.hitItem)
        this.hitItem = paper.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });

      if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
        && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
        paper.canvas_cursor('cursor-pen-adjust');

      } else {
        paper.canvas_cursor('cursor-pen-freehand');
      }
    }


    return true;
  }

  keydown(event) {

    if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

      if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
        return;

      paper.project.selectedItems.forEach((path) => {
        if(path.parent instanceof ProfileItem){
          path = path.parent;
          path.removeChildren();
          path.remove();
        }
      });

      this.mode = null;
      this.path = null;

      event.stop();
      return false;

    }else if(event.key == 'escape'){

      if(this.path){
        this.path.remove();
        this.path = null;
      }
      this.mode = null;
      this._controls.blur();
    }
  }

  decorate_layers(reset){

    const active = paper.project.activeLayer;

    paper.project.getItems({class: Contour}).forEach((l) => {
      l.opacity = (l == active || reset) ? 1 : 0.5;
    })

  }

}




class RulerWnd {

  constructor(options, tool) {

    if(!options){
      options = {
        name: 'sizes',
        wnd: {
          caption: "Размеры и сдвиг",
          height: 200,
          allow_close: true,
          modal: true
        }
      }
    }

    $p.wsql.restore_options("editor", options);
    if(options.mode > 2){
      options.mode = 2;
    }
    options.wnd.on_close = this.on_close.bind(this);

    this.tool = tool;
    const wnd = this.wnd = $p.iface.dat_blank(paper._dxw, options.wnd);

    this.on_keydown = this.on_keydown.bind(this);
    this.on_button_click = this.on_button_click.bind(this);
    this.wnd_keydown = $p.eve.attachEvent("keydown", this.on_keydown);

    const div = document.createElement("table");
    div.innerHTML='<tr><td ></td><td align="center"></td><td></td></tr>' +
        '<tr><td></td><td><input type="text" style="width: 70px;  text-align: center;" readonly value="0"></td><td></td></tr>' +
        '<tr><td></td><td align="center"></td><td></td></tr>';
    div.style.width = "130px";
    div.style.margin = "auto";
    div.style.borderSpacing = 0;

    this.table = div.firstChild.childNodes;

    $p.iface.add_button(this.table[0].childNodes[1], null,
      {name: "top", css: 'tb_align_top', tooltip: $p.msg.align_set_top}).onclick = this.on_button_click;
    $p.iface.add_button(this.table[1].childNodes[0], null,
      {name: "left", css: 'tb_align_left', tooltip: $p.msg.align_set_left}).onclick = this.on_button_click;
    $p.iface.add_button(this.table[1].childNodes[2], null,
      {name: "right", css: 'tb_align_right', tooltip: $p.msg.align_set_right}).onclick = this.on_button_click;
    $p.iface.add_button(this.table[2].childNodes[1], null,
      {name: "bottom", css: 'tb_align_bottom', tooltip: $p.msg.align_set_bottom}).onclick = this.on_button_click;

    wnd.attachObject(div);

    if(tool instanceof ToolRuler){

      div.style.marginTop = "22px";

      wnd.tb_mode = new $p.iface.OTooolBar({
        wrapper: wnd.cell,
        width: '100%',
        height: '28px',
        class_name: "",
        name: 'tb_mode',
        buttons: [
          {name: '0', img: 'ruler_elm.png', tooltip: $p.msg.ruler_elm, float: 'left'},
          {name: '1', img: 'ruler_node.png', tooltip: $p.msg.ruler_node, float: 'left'},
          {name: '2', img: 'ruler_arrow.png', tooltip: $p.msg.ruler_new_line, float: 'left'},

          {name: 'sep_0', text: '', float: 'left'},
          {name: 'base', img: 'ruler_base.png', tooltip: $p.msg.ruler_base, float: 'left'},
          {name: 'inner', img: 'ruler_inner.png', tooltip: $p.msg.ruler_inner, float: 'left'},
          {name: 'outer', img: 'ruler_outer.png', tooltip: $p.msg.ruler_outer, float: 'left'}
        ],
        image_path: "dist/imgs/",
        onclick: (name) => {

          if(['0','1','2'].indexOf(name) != -1){

            ['0','1','2'].forEach((btn) => {
              if(btn != name){
                wnd.tb_mode.buttons[btn].classList.remove("muted");
              }
            });
            wnd.tb_mode.buttons[name].classList.add("muted");
            tool.mode = name;
          }
          else{
            ['base','inner','outer'].forEach((btn) => {
              if(btn != name){
                wnd.tb_mode.buttons[btn].classList.remove("muted");
              }
            });
            wnd.tb_mode.buttons[name].classList.add("muted");
            tool.base_line = name;
          }

          return false;
        }
      });

      wnd.tb_mode.buttons[tool.mode].classList.add("muted");
      wnd.tb_mode.buttons[tool.base_line].classList.add("muted");
      wnd.tb_mode.cell.style.backgroundColor = "#f5f5f5";
    }

    this.input = this.table[1].childNodes[1];
    this.input.grid = {
      editStop: (v) => {
        $p.eve.callEvent("sizes_wnd", [{
          wnd: wnd,
          name: "size_change",
          size: this.size,
          tool: tool
        }]);
      },
      getPosition: (v) => {
        let {offsetLeft, offsetTop} = v;
        while ( v = v.offsetParent ){
          offsetLeft += v.offsetLeft;
          offsetTop  += v.offsetTop;
        }
        return [offsetLeft + 7, offsetTop + 9];
      }
    };
    this.input.firstChild.onfocus = function (e) {
      wnd.elmnts.calck = new eXcell_calck(this);
      wnd.elmnts.calck.edit();
    };

    setTimeout(function () {
      this.input && this.input.firstChild.focus();
    }, 100);

  }

  on_button_click(ev) {

    const {wnd, tool, size} = this;

    if(!paper.project.selectedItems.some((path) => {
        if(path.parent instanceof DimensionLineCustom){

          switch(ev.currentTarget.name) {

            case "left":
            case "bottom":
              path.parent.offset -= 20;
              break;

            case "top":
            case "right":
              path.parent.offset += 20;
              break;

          }

          return true;
        }
      })){

      $p.eve.callEvent("sizes_wnd", [{
        wnd: wnd,
        name: ev.currentTarget.name,
        size: size,
        tool: tool
      }]);
    }
  }

  on_keydown(ev) {

    const {wnd} = this;

    if(wnd){
      switch(ev.keyCode) {
        case 27:        
          wnd.close();
          break;
        case 37:        
          this.on_button_click({
            currentTarget: {name: "left"}
          });
          break;
        case 38:        
          this.on_button_click({
            currentTarget: {name: "top"}
          });
          break;
        case 39:        
          this.on_button_click({
            currentTarget: {name: "right"}
          });
          break;
        case 40:        
          this.on_button_click({
            currentTarget: {name: "bottom"}
          });
          break;

        case 109:       
        case 46:        
        case 8:         
          if(ev.target && ["textarea", "input"].indexOf(ev.target.tagName.toLowerCase())!=-1){
            return;
          }

          paper.project.selectedItems.some((path) => {
            if(path.parent instanceof DimensionLineCustom){
              path.parent.remove();
              return true;
            }
          });

          return $p.iface.cancel_bubble(ev);

          break;
      }
      return $p.iface.cancel_bubble(ev);
    }

  }

  on_close() {

    if(this.wnd && this.wnd.elmnts.calck && this.wnd.elmnts.calck.obj && this.wnd.elmnts.calck.obj.removeSelf){
      this.wnd.elmnts.calck.obj.removeSelf();
    }

    $p.eve.detachEvent(this.wnd_keydown);

    $p.eve.callEvent("sizes_wnd", [{
      wnd: this.wnd,
      name: "close",
      size: this.size,
      tool: this.tool
    }]);

    delete this.wnd;
    delete this.tool;

    return true;

  }

  close() {
    if(this.wnd){
      this.wnd.close();
    }
  }

  wnd_options(options) {
    if(this.wnd){
      this.wnd.wnd_options(options);
    }
  }

  get size() {
    return parseFloat(this.input.firstChild.value) || 0;
  }
  set size(v) {
    this.input.firstChild.value = parseFloat(v).round(1);
  }
}


class ToolRuler extends ToolElement {

  constructor() {


    super()

    Object.assign(this, {
      options: {
        name: 'ruler',
        mode: 0,
        base_line: 0,
        wnd: {
          caption: "Размеры и сдвиг",
          height: 200
        }
      },
      mouseStartPos: new paper.Point(),
      hitItem: null,
      hitPoint: null,
      changed: false,
      minDistance: 10,
      selected: {
        a: [],
        b: []
      }
    })

    this.on({

      activate: function() {

        this.selected.a.length = 0;
        this.selected.b.length = 0;

        this.on_activate('cursor-arrow-ruler-light');

        paper.project.deselectAll();
        this.wnd = new RulerWnd(this.options, this);
      },

      deactivate: function() {

        this.remove_path();

        this.detache_wnd();

      },

      mousedown: function(event) {

        if (this.hitItem) {

          if (this.mode == 0) {

            this.add_hit_item(event);

            if (this.selected.a.length && this.selected.b.length) {
              if (this.selected.a[0].orientation == this.selected.b[0].orientation) {
                if (this.selected.a[0].orientation == $p.enm.orientations.Вертикальная) {
                  this.wnd.size = Math.abs(this.selected.a[0].b.x - this.selected.b[0].b.x);

                } else if (this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная) {
                  this.wnd.size = Math.abs(this.selected.a[0].b.y - this.selected.b[0].b.y);

                } else {

                }
              }

            }
            else if (this.wnd.size != 0) {
              this.wnd.size = 0;
            }

          }
          else if (this.mode == 1) {

            this.add_hit_point(event);

          }
          else {

            if (this.hitPoint) {

              if (this.mode == 2) {

                this.selected.a.push(this.hitPoint);

                if (!this.path) {
                  this.path = new paper.Path({
                    parent: this.hitPoint.profile.layer.l_dimensions,
                    segments: [this.hitPoint.point, event.point]
                  });
                  this.path.strokeColor = 'black';
                }

                this.mode = 3;

              }
              else {

                this.remove_path();

                this.selected.b.push(this.hitPoint);

                new DimensionLineCustom({
                  elm1: this.selected.a[0].profile,
                  elm2: this.hitPoint.profile,
                  p1: this.selected.a[0].point_name,
                  p2: this.hitPoint.point_name,
                  parent: this.hitPoint.profile.layer.l_dimensions
                });

                this.mode = 2;

                this.hitPoint.profile.project.register_change(true);

              }
            }
          }

        }
        else {
          this.reset_selected();
        }

      },

      mouseup: function(event) {


      },

      mousedrag: function(event) {

      },

      mousemove: function(event) {
        this.hitTest(event);

        if(this.mode == 3 && this.path){

          if(this.path.segments.length == 4)
            this.path.removeSegments(1, 3, true);

          if(!this.path_text)
            this.path_text = new paper.PointText({
              justification: 'center',
              fillColor: 'black',
              fontSize: 72});

          this.path.lastSegment.point = event.point;
          var length = this.path.length;
          if(length){
            var normal = this.path.getNormalAt(0).multiply(120);
            this.path.insertSegments(1, [this.path.firstSegment.point.add(normal), this.path.lastSegment.point.add(normal)]);
            this.path.firstSegment.selected = true;
            this.path.lastSegment.selected = true;

            this.path_text.content = length.toFixed(0);
            this.path_text.point = this.path.curves[1].getPointAt(.5, true);

          }else
            this.path_text.visible = false;
        }

      },

      keydown: function(event) {

        if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

          if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
            return;

          paper.project.selectedItems.some(function (path) {
            if(path.parent instanceof DimensionLineCustom){
              path.parent.remove();
              return true;
            }
          });

          event.stop();
          return false;

        }
      }

    })

    $p.eve.attachEvent("sizes_wnd", this._sizes_wnd.bind(this))

  }

  hitTest(event) {

    this.hitItem = null;
    this.hitPoint = null;

    if (event.point){

      this.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: 10 });

      var hit = paper.project.hitPoints(event.point, 20);
      if (hit && hit.item.parent instanceof ProfileItem){
        this.hitItem = hit;
      }
    }

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem) {

      if(this.mode){
        var elm = this.hitItem.item.parent,
          corn = elm.corns(event.point);

        if(corn.dist < consts.sticking){
          paper.canvas_cursor('cursor-arrow-white-point');
          this.hitPoint = corn;
          elm.select_corn(event.point);
        }
        else{
          paper.canvas_cursor('cursor-arrow-ruler');
        }
      }

    } else {
      if(this.mode){
        paper.canvas_cursor('cursor-text-select');
      }
      else{
        paper.canvas_cursor('cursor-arrow-ruler-light');
      }
      this.hitItem = null;
    }

    return true;
  }

  remove_path() {

    if (this.path){
      this.path.removeSegments();
      this.path.remove();
      this.path = null;
    }

    if (this.path_text){
      this.path_text.remove();
      this.path_text = null;
    }
  }

  reset_selected() {

    this.remove_path();
    paper.project.deselectAll();
    this.selected.a.length = 0;
    this.selected.b.length = 0;
    if(this.mode > 2){
      this.mode = 2;
    }
    if(this.wnd.size){
      this.wnd.size = 0;
    }
  }

  add_hit_point() {

  }

  add_hit_item(event) {

    const item = this.hitItem.item.parent;

    if (paper.Key.isDown('1') || paper.Key.isDown('a')) {

      if(this.selected.a.indexOf(item) == -1){
        this.selected.a.push(item);
      }

      if(this.selected.b.indexOf(item) != -1){
        this.selected.b.splice(this.selected.b.indexOf(item), 1);
      }

    }
    else if (paper.Key.isDown('2') || paper.Key.isDown('b') ||
      event.modifiers.shift || (this.selected.a.length && !this.selected.b.length)) {

      if(this.selected.b.indexOf(item) == -1){
        this.selected.b.push(item);
      }

      if(this.selected.a.indexOf(item) != -1){
        this.selected.a.splice(this.selected.a.indexOf(item), 1);
      }

    }
    else {
      paper.project.deselectAll();
      this.selected.a.length = 0;
      this.selected.b.length = 0;
      this.selected.a.push(item);
    }

    switch(this.base_line){

      case 'inner':
        item.path.selected = true;
        break;

      case 'outer':
        item.path.selected = true;
        break;

      default:
        item.generatrix.selected = true;
        break;
    }

  }

  get mode(){
    return this.options.mode || 0;
  }
  set mode(v){
    paper.project.deselectAll();
    this.options.mode = parseInt(v);
  }

  get base_line(){
    return this.options.base_line || 'base';
  }
  set base_line(v){
    this.options.base_line = v;
  }

  _move_points(event, xy){

    var pos1 = this.selected.a.reduce(function(sum, curr) {
          return sum + curr.b[xy] + curr.e[xy];
        }, 0) / (this.selected.a.length * 2),
      pos2 = this.selected.b.reduce(function(sum, curr) {
          return sum + curr.b[xy] + curr.e[xy];
        }, 0) / (this.selected.b.length * 2),
      delta = Math.abs(pos2 - pos1),
      to_move;

    if(xy == "x"){
      if(event.name == "right")
        delta = new paper.Point(event.size - delta, 0);
      else
        delta = new paper.Point(delta - event.size, 0);

    }else{
      if(event.name == "bottom")
        delta = new paper.Point(0, event.size - delta);
      else
        delta = new paper.Point(0, delta - event.size);
    }

    if(delta.length){

      paper.project.deselectAll();

      if(event.name == "right" || event.name == "bottom"){
        to_move = pos1 < pos2 ? this.selected.b : this.selected.a;

      }else{
        to_move = pos1 < pos2 ? this.selected.a : this.selected.b;
      }

      to_move.forEach(function (p) {
        p.generatrix.segments.forEach(function (segm) {
          segm.selected = true;
        })
      });

      paper.project.move_points(delta);
      setTimeout(() => {
        paper.project.deselectAll();
        this.selected.a.forEach(function (p) {
          p.path.selected = true;
        });
        this.selected.b.forEach(function (p) {
          p.path.selected = true;
        });
        paper.project.register_update();
      }, 200);
    }

  }

  _sizes_wnd(event){

    if(this.wnd && event.wnd == this.wnd.wnd){

      if(!this.selected.a.length || !this.selected.b.length){
        return;
      }

      switch(event.name) {

        case 'left':
        case 'right':
          if(this.selected.a[0].orientation == $p.enm.orientations.Вертикальная)
            this._move_points(event, "x");
          break;

        case 'top':
        case 'bottom':
          if(this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная)
            this._move_points(event, "y");
          break;
      }
    }

  }

}




class ToolSelectNode extends ToolElement {

  constructor() {

    super()

    Object.assign(this, {
      options: {
        name: 'select_node',
        wnd: {
          caption: "Свойства элемента",
          height: 380
        }
      },
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      originalHandleIn: null,
      originalHandleOut: null,
      changed: false,
      minDistance: 10
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-arrow-white');
      },

      deactivate: function() {
        paper.clear_selection_bounds();
        if(this.profile){
          this.profile.detache_wnd();
          delete this.profile;
        }
      },

      mousedown: function(event) {

        this.mode = null;
        this.changed = false;

        if(event.event && event.event.which && event.event.which > 1){
        }

        if (this.hitItem && !event.modifiers.alt) {

          if(this.hitItem.item instanceof paper.PointText) {
            return
          }


          let item = this.hitItem.item.parent;
          if (event.modifiers.space && item.nearest && item.nearest()) {
            item = item.nearest();
          }

          if (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke') {

            if (event.modifiers.shift) {
              item.selected = !item.selected;
            } else {
              paper.project.deselectAll();
              item.selected = true;
            }
            if (item.selected) {
              this.mode = consts.move_shapes;
              paper.project.deselect_all_points();
              this.mouseStartPos = event.point.clone();
              this.originalContent = paper.capture_selection_state();

              if(item.layer)
                $p.eve.callEvent("layer_activated", [item.layer]);
            }

          }
          else if (this.hitItem.type == 'segment') {
            if (event.modifiers.shift) {
              this.hitItem.segment.selected = !this.hitItem.segment.selected;
            } else {
              if (!this.hitItem.segment.selected){
                paper.project.deselect_all_points();
                paper.project.deselectAll();
              }
              this.hitItem.segment.selected = true;
            }
            if (this.hitItem.segment.selected) {
              this.mode = consts.move_points;
              this.mouseStartPos = event.point.clone();
              this.originalContent = paper.capture_selection_state();
            }
          }
          else if (this.hitItem.type == 'handle-in' || this.hitItem.type == 'handle-out') {
            this.mode = consts.move_handle;
            this.mouseStartPos = event.point.clone();
            this.originalHandleIn = this.hitItem.segment.handleIn.clone();
            this.originalHandleOut = this.hitItem.segment.handleOut.clone();

          }

          if(item instanceof ProfileItem || item instanceof Filling){
            item.attache_wnd(this._scope._acc.elm.cells("a"));
            this.profile = item;
          }

          paper.clear_selection_bounds();

        } else {
          this.mouseStartPos = event.point.clone();
          this.mode = 'box-select';

          if(!event.modifiers.shift && this.profile){
            this.profile.detache_wnd();
            delete this.profile;
          }

        }
      },

      mouseup: function(event) {

        if (this.mode == consts.move_shapes) {
          if (this.changed) {
            paper.clear_selection_bounds();
          }

        } else if (this.mode == consts.move_points) {
          if (this.changed) {
            paper.clear_selection_bounds();
          }

        } else if (this.mode == consts.move_handle) {
          if (this.changed) {
            paper.clear_selection_bounds();
          }
        } else if (this.mode == 'box-select') {

          var box = new paper.Rectangle(this.mouseStartPos, event.point);

          if (!event.modifiers.shift){
            paper.project.deselectAll();
          }

          if (event.modifiers.control) {

            const profiles = [];
            paper.paths_intersecting_rect(box).forEach((path) => {
              if(path.parent instanceof ProfileItem){
                if(profiles.indexOf(path.parent) == -1){
                  profiles.push(path.parent);
                  path.parent.selected = !path.parent.selected;
                }
              }
              else{
                path.selected = !path.selected;
              }
            })

          }
          else {

            const selectedSegments = paper.segments_in_rect(box);
            if (selectedSegments.length > 0) {
              for (let i = 0; i < selectedSegments.length; i++) {
                selectedSegments[i].selected = !selectedSegments[i].selected;
              }
            }
            else {
              const profiles = [];
              paper.paths_intersecting_rect(box).forEach((path) => {
                if(path.parent instanceof ProfileItem){
                  if(profiles.indexOf(path.parent) == -1){
                    profiles.push(path.parent);
                    path.parent.selected = !path.parent.selected;
                  }
                }
                else{
                  path.selected = !path.selected;
                }
              })
            }
          }
        }

        paper.clear_selection_bounds();

        if (this.hitItem) {
          if (this.hitItem.item.selected || (this.hitItem.item.parent && this.hitItem.item.parent.selected)) {
            paper.canvas_cursor('cursor-arrow-small');
          }
          else {
            paper.canvas_cursor('cursor-arrow-white-shape');
          }
        }
      },

      mousedrag: function(event) {

        this.changed = true;

        if (this.mode == consts.move_shapes) {
          paper.canvas_cursor('cursor-arrow-small');

          let delta = event.point.subtract(this.mouseStartPos);
          if (!event.modifiers.shift){
            delta = delta.snap_to_angle(Math.PI*2/4);
          }
          paper.restore_selection_state(this.originalContent);
          paper.project.move_points(delta, true);
          paper.clear_selection_bounds();
        }
        else if (this.mode == consts.move_points) {
          paper.canvas_cursor('cursor-arrow-small');

          let delta = event.point.subtract(this.mouseStartPos);
          if(!event.modifiers.shift) {
            delta = delta.snap_to_angle(Math.PI*2/4);
          }
          paper.restore_selection_state(this.originalContent);
          paper.project.move_points(delta);
          paper.purge_selection();
        }
        else if (this.mode == consts.move_handle) {

          const delta = event.point.subtract(this.mouseStartPos);
          const noti = {
            type: consts.move_handle,
            profiles: [this.hitItem.item.parent],
            points: []
          };

          if (this.hitItem.type == 'handle-out') {
            let handlePos = this.originalHandleOut.add(delta);

            this.hitItem.segment.handleOut = handlePos;
            this.hitItem.segment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
          }
          else {
            let handlePos = this.originalHandleIn.add(delta);

            this.hitItem.segment.handleIn = handlePos;
            this.hitItem.segment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
          }

          noti.profiles[0].rays.clear();
          noti.profiles[0].layer.notify(noti);

          paper.purge_selection();
        }
        else if (this.mode == 'box-select') {
          paper.drag_rect(this.mouseStartPos, event.point);
        }
      },

      mousemove: function(event) {
        this.hitTest(event);
      },

      keydown: function(event) {
        var selected, j, path, segment, index, point, handle;

        if (event.key == '+' || event.key == 'insert') {

          selected = paper.project.selectedItems;

          if (event.modifiers.space) {

            for (let i = 0; i < selected.length; i++) {
              path = selected[i];

              if(path.parent instanceof Profile){

                var cnn_point = path.parent.cnn_point("e");
                if(cnn_point && cnn_point.profile)
                  cnn_point.profile.rays.clear(true);
                path.parent.rays.clear(true);

                point = path.getPointAt(path.length * 0.5);
                var newpath = path.split(path.length * 0.5);
                path.lastSegment.point = path.lastSegment.point.add(paper.Point.random());
                newpath.firstSegment.point = path.lastSegment.point;
                new Profile({generatrix: newpath, proto: path.parent});
              }
            }

          }
          else{

            for (let i = 0; i < selected.length; i++) {
              path = selected[i];
              let do_select = false;
              if(path.parent instanceof ProfileItem){
                for (let j = 0; j < path.segments.length; j++) {
                  segment = path.segments[j];
                  if (segment.selected){
                    do_select = true;
                    break;
                  }
                }
                if(!do_select){
                  j = 0;
                  segment = path.segments[j];
                  do_select = true;
                }
              }
              if(do_select){
                index = (j < (path.segments.length - 1) ? j + 1 : j);
                point = segment.curve.getPointAt(0.5, true);
                handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
                path.insert(index, new paper.Segment(point, handle.negate(), handle));
              }
            }
          }

          event.stop();
          return false;


        } 
        else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

          if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
            return;

          paper.project.selectedItems.some((path) => {

            let do_select = false;

            if(path.parent instanceof DimensionLineCustom){
              path.parent.remove();
              return true;

            }else if(path.parent instanceof ProfileItem){
              for (let j = 0; j < path.segments.length; j++) {
                segment = path.segments[j];
                do_select = do_select || segment.selected;
                if (segment.selected && segment != path.firstSegment && segment != path.lastSegment ){
                  path.removeSegment(j);

                  path.parent.x1 = path.parent.x1;
                  break;
                }
              }
              if(!do_select){
                path = path.parent;
                path.removeChildren();
                path.remove();
              }
            }
          });

          event.stop();
          return false;

        }
        else if (event.key == 'left') {
          paper.project.move_points(new paper.Point(-10, 0));
        }
        else if (event.key == 'right') {
          paper.project.move_points(new paper.Point(10, 0));
        }
        else if (event.key == 'up') {
          paper.project.move_points(new paper.Point(0, -10));
        }
        else if (event.key == 'down') {
          paper.project.move_points(new paper.Point(0, 10));
        }
      }
    });

  }

  testHot(type, event, mode) {
    if (mode == 'tool-direct-select'){
      return this.hitTest(event);
    }
  }

  hitTest(event) {

    const hitSize = 6;
    this.hitItem = null;

    if (event.point) {

      this.hitItem = paper.project.hitTest(event.point, {selected: true, fill: true, tolerance: hitSize});

      if (!this.hitItem){
        this.hitItem = paper.project.hitTest(event.point, {fill: true, visible: true, tolerance: hitSize});
      }

      let hit = paper.project.hitTest(event.point, {selected: true, handles: true, tolerance: hitSize});
      if (hit){
        this.hitItem = hit;
      }

      hit = paper.project.hitPoints(event.point, 20);

      if (hit) {
        if (hit.item.parent instanceof ProfileItem) {
          if (hit.item.parent.generatrix === hit.item){
            this.hitItem = hit;
          }
        }
        else{
          this.hitItem = hit;
        }
      }
    }

    if (this.hitItem) {
      if (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke') {

        if (this.hitItem.item instanceof paper.PointText) {
          if(this.hitItem.item.parent instanceof DimensionLineCustom){
            this.hitItem = null;
            paper.canvas_cursor('cursor-arrow-white');
          }
          else{
            paper.canvas_cursor('cursor-text');     
          }
        }
        else if (this.hitItem.item.selected) {
          paper.canvas_cursor('cursor-arrow-small');
        }
        else {
          paper.canvas_cursor('cursor-arrow-white-shape');
        }
      }
      else if (this.hitItem.type == 'segment' || this.hitItem.type == 'handle-in' || this.hitItem.type == 'handle-out') {
        if (this.hitItem.segment.selected) {
          paper.canvas_cursor('cursor-arrow-small-point');
        }
        else {
          paper.canvas_cursor('cursor-arrow-white-point');
        }
      }
    }
    else {
      paper.canvas_cursor('cursor-arrow-white');
    }

    return true;
  }

}


class ToolText extends ToolElement {

  constructor() {

    super()

    Object.assign(this, {
      options: {
        name: 'text',
        wnd: {
          caption: "Произвольный текст",
          width: 290,
          height: 290
        }
      },
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-text-select');
      },

      deactivate: function() {
        paper.hide_selection_bounds();
        this.detache_wnd();
      },

      mousedown: function(event) {
        this.text = null;
        this.changed = false;

        paper.project.deselectAll();
        this.mouseStartPos = event.point.clone();

        if (this.hitItem) {

          if(this.hitItem.item instanceof paper.PointText){
            this.text = this.hitItem.item;
            this.text.selected = true;

          }else {
            this.text = new FreeText({
              parent: this.hitItem.item.layer.l_text,
              point: this.mouseStartPos,
              content: '...',
              selected: true
            });
          }

          this.textStartPos = this.text.point;

          if(!this.wnd || !this.wnd.elmnts){
            $p.wsql.restore_options("editor", this.options);
            this.wnd = $p.iface.dat_blank(paper._dxw, this.options.wnd);
            this._grid = this.wnd.attachHeadFields({
              obj: this.text
            });
          }else{
            this._grid.attach({obj: this.text})
          }

        }else
          this.detache_wnd();

      },

      mouseup: function(event) {

        if (this.mode && this.changed) {
        }

        paper.canvas_cursor('cursor-arrow-lay');

      },

      mousedrag: function(event) {

        if (this.text) {
          var delta = event.point.subtract(this.mouseStartPos);
          if (event.modifiers.shift)
            delta = delta.snap_to_angle();

          this.text.move_points(this.textStartPos.add(delta));

        }

      },

      mousemove: function(event) {
        this.hitTest(event);
      },

      keydown: function(event) {
        var selected, i, text;
        if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

          if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
            return;

          selected = paper.project.selectedItems;
          for (i = 0; i < selected.length; i++) {
            text = selected[i];
            if(text instanceof FreeText){
              text.text = "";
              setTimeout(function () {
                paper.view.update();
              }, 100);
            }
          }

          event.preventDefault();
          return false;
        }
      }
    })

  }

  hitTest(event) {
    var hitSize = 6;

    this.hitItem = paper.project.hitTest(event.point, { class: paper.TextItem, bounds: true, fill: true, stroke: true, tolerance: hitSize });
    if(!this.hitItem)
      this.hitItem = paper.project.hitTest(event.point, { fill: true, stroke: false, tolerance: hitSize });

    if (this.hitItem){
      if(this.hitItem.item instanceof paper.PointText)
        paper.canvas_cursor('cursor-text');     
      else
        paper.canvas_cursor('cursor-text-add'); 
    } else
      paper.canvas_cursor('cursor-text-select');  

    return true;
  }

}


$p.injected_data._mixin({"tip_editor_right.html":"<div class=\"clipper editor_accordion\">\r\n\r\n    <div class=\"scroller\">\r\n        <div class=\"container\">\r\n\r\n            <!-- РАЗДЕЛ 1 - дерево слоёв -->\r\n            <div class=\"header\">\r\n                <div class=\"header__title\" name=\"header_layers\"></div>\r\n            </div>\r\n            <div name=\"content_layers\" style=\"min-height: 200px;\"></div>\r\n\r\n            <!-- РАЗДЕЛ 2 - реквизиты элемента -->\r\n            <div class=\"header\">\r\n                <div class=\"header__title\" name=\"header_elm\"></div>\r\n            </div>\r\n            <div name=\"content_elm\" style=\"min-height: 260px;\"></div>\r\n\r\n            <!-- РАЗДЕЛ 3 - реквизиты створки -->\r\n            <div class=\"header\">\r\n                <div class=\"header__title\" name=\"header_stv\">\r\n                    Створка\r\n                    <!--span name=\"title\"></span-->\r\n                </div>\r\n            </div>\r\n            <div name=\"content_stv\" style=\"min-height: 200px;\"></div>\r\n\r\n            <!-- РАЗДЕЛ 4 - реквизиты изделия -->\r\n            <div class=\"header\">\r\n                <div class=\"header__title\" name=\"header_props\">\r\n                    <span name=\"title\">Изделие</span>\r\n                </div>\r\n            </div>\r\n            <div name=\"content_props\" style=\"min-height: 330px;\"></div>\r\n\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"scroller__track\">\r\n        <div class=\"scroller__bar\" style=\"height: 26px; top: 0px;\"></div>\r\n    </div>\r\n\r\n</div>","tip_select_node.html":"<div class=\"otooltip\">\r\n    <p class=\"otooltip\">Инструмент <b>Элемент и узел</b> позволяет:</p>\r\n    <ul class=\"otooltip\">\r\n        <li>Выделить элемент<br />для изменения его свойств или перемещения</li>\r\n        <li>Выделить отдельные узлы и рычаги узлов<br />для изменения геометрии</li>\r\n        <li>Добавить новый узел (изгиб)<br />(кнопка {+} на цифровой клавиатуре)</li>\r\n        <li>Удалить выделенный узел (изгиб)<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n        <li>Добавить новый элемент, делением текущего<br />(кнопка {+} при нажатой кнопке {пробел})</li>\r\n        <li>Удалить выделенный элемент<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n    </ul>\r\n    <hr />\r\n    <a title=\"Видеоролик, иллюстрирующий работу инструмента\" href=\"https://www.youtube.com/embed/UcBGQGqwUro?list=PLiVLBB_TTj5njgxk5E_EjwxzCGM4XyKlQ\" target=\"_blank\">\r\n        <i class=\"fa fa-video-camera fa-lg\"></i> Обучающее видео</a>\r\n    <a title=\"Справка по инструменту в WIKI\" href=\"http://www.oknosoft.ru/upzp/apidocs/classes/OTooolBar.html\" target=\"_blank\" style=\"margin-left: 9px;\">\r\n        <i class='fa fa-question-circle fa-lg'></i> Справка в wiki</a>\r\n</div>"});
return Editor;
}));
