var Mediator, Menu, Utils, updateBattery;
var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
document.addEventListener('deviceready', function() {
  var accel, blob, left, top, winSize, z;
  blob = new Element('div');
  accel = {
    x: 0,
    y: 0,
    z: 0
  };
  winSize = window.getSize();
  top = (window.getSize().y - 20) / 2;
  left = (window.getSize().x - 20) / 2;
  z = 0;
  blob.setStyles({
    position: 'absolute',
    width: 20,
    height: 20,
    'border-radius': '10px',
    'background-color': 'red',
    'z-index': 99999,
    top: top,
    left: left
  });
  $("acceleration").grab(blob);
  setInterval(function() {
    if ((top -= accel.y * 5) < 0) {
      top = 0;
    }
    if ((top -= accel.y * 5) + 20 > winSize.y) {
      top = winSize.y - 20;
    }
    if ((z += accel.z * 5) < 0) {
      z = 0;
    }
    if ((z += accel.z * 5) > 5000) {
      z = 300;
    }
    if ((left += accel.x * 5) < 0) {
      left = 0;
    }
    if ((left += accel.x * 5) + 20 > winSize.x) {
      left = winSize.x - 20;
    }
    return blob.setStyles({
      top: top,
      left: left
    });
  }, 10);
  navigator.accelerometer.watchAcceleration(function(acc) {
    return accel = acc;
  }, (function() {}), {
    frequency: 100
  });
  return navigator.compass.watchHeading(function(heading) {
    return $("comp").setStyles({
      '-webkit-transform': "rotate(" + (-45 + heading) + "deg)"
    });
  }, (function() {}), {
    frequency: 10
  });
});
updateBattery = function(event) {
  $("bat").set('text', event.level + "%");
  return $("charge").set('text', event.isPlugged ? 'Charging' : 'Not Charging');
};
window.addEventListener('batterycritical', function(event) {
  updateBattery(event);
  if (!event.isPlugged) {
    navigator.notification.vibrate(1000);
    navigator.notification.beep(3);
    return navigator.notification.alert('Battery Critical');
  }
});
window.addEventListener('batterylow', updateBattery);
window.addEventListener('batterystatus', updateBattery);
document.addEventListener('online', function(event) {
  return navigator.notification.beep(1);
});
document.addEventListener('offline', function(event) {
  return navigator.notification.vibrate(1000);
});
window.addEvent('domready', function() {
  new Menu($("wrap"), {
    startPage: 'index'
  });
  return Mediator.addEvent('pageReady', function(page) {});
});
Utils = {
  clamp: function(val, min, max) {
    if (val > max) {
      return max;
    } else if (val < min) {
      return min;
    } else {
      return val;
    }
  },
  clampRange: function(val, min, max) {
    if (val > max) {
      return val % max;
    } else if (val < min) {
      return max + val % max;
    } else {
      return val;
    }
  },
  checkCircle: function(startPos, endPos, guesture, time) {
    var bottomMost, center, i, leftMost, point, r, radius, rightMost, topMost, treshold, _i, _len, _len2;
    if (guesture.length < 10) {
      return false;
    }
    if (time > 2000) {
      return false;
    }
    if (Math.abs(startPos.x - endPos.x) > 55 && Math.abs(startPos.y - endPos.y) > 55) {
      return false;
    }
    topMost = leftMost = rightMost = bottomMost = guesture[0];
    for (_i = 0, _len = guesture.length; _i < _len; _i++) {
      point = guesture[_i];
      if (point.y > bottomMost.y) {
        bottomMost = point;
      }
      if (point.y < topMost.y) {
        topMost = point;
      }
      if (point.x < leftMost.x) {
        leftMost = point;
      }
      if (point.x > rightMost.x) {
        rightMost = point;
      }
    }
    center = {
      x: (rightMost.x + leftMost.x) / 2,
      y: (bottomMost.y + topMost.y) / 2
    };
    radius = (Math.sqrt(Math.pow(rightMost.x - leftMost.x, 2) + Math.pow(bottomMost.y - topMost.y, 2)) / 2) * 0.7;
    for (i = 0, _len2 = guesture.length; i < _len2; i++) {
      point = guesture[i];
      if (i < guesture.length * 0.2 || i > guesture.length - guesture.length * 0.2) {
        treshold = 0.8;
      } else {
        treshold = 0.3;
      }
      r = Math.sqrt(Math.pow(center.x - point.x, 2) + Math.pow(center.y - point.y, 2));
      if (r > radius + (radius * treshold) || r < radius - (radius * treshold)) {
        return false;
      }
    }
    return true;
  }
};
Mediator = new (Mediator = (function() {
  function Mediator() {
    this.events = {};
  }
  Mediator.prototype.removeEvents = function(name) {
    return delete this.events[name];
  };
  Mediator.prototype.addEvent = function(name, f) {
    var _base, _ref;
    if ((_ref = (_base = this.events)[name]) == null) {
      _base[name] = [];
    }
    return this.events[name].push(f);
  };
  Mediator.prototype.fireEvent = function() {
    var args, f, name, _i, _len, _ref, _results;
    name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (this.events[name]) {
      _ref = this.events[name];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        _results.push(f.apply(this, args));
      }
      return _results;
    }
  };
  return Mediator;
})());
Menu = (function() {
  function Menu(element, options) {
    var child, _i, _len, _ref;
    if (options == null) {
      options = {};
    }
    this.options = _.defaults(options, {
      direction: -1,
      startPage: "",
      size: element.getSize()
    });
    this.running = false;
    this.base = element;
    this.base.setStyle('-webkit-transform-origin', '0 0');
    _ref = this.base.getChildren();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (!child.hasClass('no-page')) {
        child.setStyles({
          'position': 'absolute',
          'top': 0,
          'left': 0,
          'bottom': '0',
          'width': '100%',
          'display': 'none',
          'overflow': 'hidden'
        });
      }
    }
    this.page = this.base.getElement("#" + this.options.startPage);
    this.page.setStyle('display', 'block');
    this.base.addEvent('click:relay(*[data-page])', __bind(function(e, el) {
      return this.go(el.get('data-page'));
    }, this));
    window.onorientationchange = __bind(function() {
      switch (window.orientation) {
        case 90:
        case -90:
          return this.base.removeClass('landscape');
        case 0:
        case 180:
          return this.base.addClass('landscape');
      }
    }, this);
    Mediator.addEvent('go', __bind(function(page) {
      return this.go(page);
    }, this));
  }
  Menu.prototype.go = function(id, callback) {
    var page;
    if (callback == null) {
      callback = function() {};
    }
    if (!this.running) {
      this.running = true;
      this.page.setStyle('z-index', 0);
      page = this.base.getElement("#" + id);
      page.setStyles({
        'z-index': 1,
        'display': 'block'
      });
      return Firmin.animate(page, {
        translateX: this.options.direction * this.options.size.x
      }, '0', __bind(function() {
        return Firmin.animate(page, {
          translateX: 0
        }, '0.6s', __bind(function() {
          this.running = false;
          this.page.setStyle('display', 'none');
          this.page = page;
          Mediator.fireEvent('pageReady', id);
          return callback();
        }, this));
      }, this));
    }
  };
  return Menu;
})();