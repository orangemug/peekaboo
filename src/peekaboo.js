(function() {
  var Peekaboo, PeekabooItem;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  PeekabooItem = (function() {
    function PeekabooItem(elem) {
      this.elem = elem;
      this.handle = this.elem.find('.handle');
      this.elem.css({
        'position': "relative"
      });
      this.elem.wrap('<div />');
      this.container = this.elem.parent();
      this.container.css({
        'overflow': 'hidden',
        'margin': '0',
        'padding': '0'
      });
      this.status = 'open';
      this.animDuration = 400;
      this._setupCoords();
      this._bindInitialEvents();
    }
    PeekabooItem.prototype._setupCoords = function() {
      this.offsetPos = this.container.offset().top;
      this.centerHandleOffset = this.elem.height() - this.handle.height() / 2;
      this.closedPos = -(this.elem.height() - this.handle.height());
      this.openPos = 0;
      return this.halfwayPos = this.openPos + (-this.closedPos - -this.openPos) / 2 + this.handle.height() / 2;
    };
    PeekabooItem.prototype._bindInitialEvents = function() {
      this.handle.bind('mousedown', __bind(function(e) {
        return this._dragStart(e);
      }, this));
      return this.handle.bind('touchstart', __bind(function(e) {
        return this._dragStart(e);
      }, this));
    };
    PeekabooItem.prototype._bindHandleEvents = function() {
      $(document).bind('mousemove', __bind(function(e) {
        return this._dragMove(e);
      }, this));
      $(document).bind('mouseup', __bind(function(e) {
        return this._dragEnd(e);
      }, this));
      this.handle.bind('touchmove', __bind(function(e) {
        return this._dragMove(e);
      }, this));
      return this.handle.bind('touchend', __bind(function(e) {
        return this._dragEnd(e);
      }, this));
    };
    PeekabooItem.prototype._clearHandleEvents = function() {
      $(document).unbind('mousemove');
      $(document).unbind('mouseup');
      this.handle.unbind('touchmove');
      return this.handle.unbind('touchend');
    };
    PeekabooItem.prototype._checkBounds = function(pos) {
      if (pos > this.openPos) {
        pos = this.openPos;
      } else if (pos < this.closedPos) {
        pos = this.closedPos;
      }
      return pos;
    };
    PeekabooItem.prototype._toLocalCoord = function(pos) {
      return pos - this.offsetPos;
    };
    PeekabooItem.prototype._pos = function(e) {
      var pos;
      pos = e.pageY || e.originalEvent.touches[0].pageY;
      return this._toLocalCoord(pos);
    };
    PeekabooItem.prototype._dragStart = function(e) {
      this._setupCoords();
      this.startPos = this._pos(e);
      this.totalMovement = 0;
      this._bindHandleEvents();
      e.preventDefault();
      return e.stopPropagation();
    };
    PeekabooItem.prototype._dragMove = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!this.startPos) {
        return;
      }
      this.currentPos = this._pos(e);
      this.totalMovement += this.currentPos - this.startPos;
      return this._move(this.currentPos - this.centerHandleOffset, true);
    };
    PeekabooItem.prototype._dragEnd = function(e) {
      this._clearHandleEvents();
      if (this.totalMovement < 3 && this.totalMovement > -3) {
        this.toggle();
      } else {
        if (this.currentPos > this.halfwayPos) {
          this.open();
        } else {
          this.close();
        }
      }
      this.startPos = null;
      e.preventDefault();
      return e.stopPropagation();
    };
    PeekabooItem.prototype._get_transform_prefix = function(element) {
      var prefix, prefixes, prop;
      prefixes = {
        'transform': '',
        'WebkitTransform': 'webkit-'
      };
      for (prop in prefixes) {
        prefix = prefixes[prop];
        if (typeof element.style[prop] !== 'undefined') {
          return prefix;
        }
      }
      return null;
    };
    PeekabooItem.prototype._move = function(pos, animOff, callback) {
      var duration, prefix;
      pos = this._checkBounds(pos);
      duration = this.animDuration;
      if (animOff) {
        duration = 0;
      }
      if (prefix = this._get_transform_prefix(this.elem[0])) {
        clearTimeout(this.timeout);
        this.elem.css("" + prefix + "transition-property", "all");
        this.elem.css("" + prefix + "transition-duration", "" + duration + "ms");
        this.elem.css("" + prefix + "transform", "translate3d(0," + pos + "px,0)");
        return this.timeout = setTimeout(__bind(function() {
          this.elem.css("" + prefix + "transition-property", "none");
          if (callback) {
            return callback();
          }
        }, this), duration + 100);
      } else {
        console.warn("JQUERY");
        return this.elem.animate({
          'top': pos
        }, duration);
      }
    };
    PeekabooItem.prototype.configure = function(opts) {
      var n, v, _results;
      _results = [];
      for (n in opts) {
        v = opts[n];
        _results.push((function() {
          switch (n) {
            case "animation_speed":
              return this.animDuration = parseInt(v);
            case "initial_state":
              if (v === "open") {
                return this.open();
              } else {
                return this.close();
              }
              break;
            case "open_hook":
              return this.openHooks.push(v);
            case "close_hook":
              return this.openHooks.push(v);
          }
        }).call(this));
      }
      return _results;
    };
    PeekabooItem.prototype.open = function(animOff) {
      this._setupCoords();
      this.container.css("height", this.elem.height());
      this.status = 'open';
      return this._move(this.openPos, animOff);
    };
    PeekabooItem.prototype.close = function(animOff) {
      this._setupCoords();
      this.status = 'close';
      return this._move(this.closedPos, animOff, __bind(function() {
        return this.container.css("height", this.handle.height());
      }, this));
    };
    PeekabooItem.prototype.toggle = function(animOff) {
      if (this.status === 'open') {
        return this.close(animOff);
      } else {
        return this.open(animOff);
      }
    };
    return PeekabooItem;
  })();
  Peekaboo = (function() {
    function Peekaboo() {
      this.peekabooItems = [];
    }
    Peekaboo.prototype.add = function(item) {
      return this.peekabooItems.push(item);
    };
    Peekaboo.prototype.panel = function(elem) {
      var item, _i, _len, _ref;
      _ref = this.peekabooItems;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.elem[0] === $(elem)[0]) {
          return item;
        }
      }
    };
    Peekaboo.prototype.check = function() {
      $('.peekaboo').each(__bind(function(idx, elem) {
        elem = $(elem);
        return this.add(new PeekabooItem(elem));
      }, this));
    };
    return Peekaboo;
  })();
  $('document').ready(__bind(function() {
    window.peekaboo = new Peekaboo;
    return window.peekaboo.check();
  }, this));
}).call(this);
