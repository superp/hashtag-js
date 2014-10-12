var Hashtag, HashtagParser;

jQuery.fn.extend({
  hashtag: function(options) {
    return jQuery(this).each(function(input_field) {
      var hashtag;
      hashtag = jQuery(this).data("hashtag");
      if (hashtag == null) {
        hashtag = new Hashtag(this, options);
      }
      return hashtag;
    });
  }
});

Hashtag = (function() {
  function Hashtag(dom_element, options) {
    var defaults;
    this.dom_element = dom_element;
    if (options == null) {
      options = {};
    }
    defaults = {
      wrapper: "ht-wrapper",
      callback: null
    };
    this.options = jQuery.extend(defaults, options);
    this._setup();
    this._events();
  }

  Hashtag.prototype._setup = function() {
    this.hashtag = jQuery(this.dom_element);
    this.hashtag.addClass(this.options.wrapper);
    return this.hashtag.data("hashtag", this);
  };

  Hashtag.prototype._events = function() {
    var self;
    self = this;
    return this.hashtag.click((function(_this) {
      return function(event) {
        console.log("click");
        if (jQuery.isFunction(_this.options.callback)) {
          return _this.options.callback.apply(_this, [_this]);
        }
      };
    })(this));
  };

  return Hashtag;

})();

HashtagParser = (function() {
  function HashtagParser(api_key, options) {
    this.api_key = api_key;
    if (options == null) {
      options = {};
    }
    this._setup();
    this._default_query();
  }

  HashtagParser.prototype._setup = function() {
    console.log("HashtagParser _setup");
    return jQuery("p").each(function(index, item) {
      var _html;
      _html = jQuery(item).html().replace(/(\#\w+)/ig, "<a href=\"javascript:void(0)\" class=\"ht-init\">$1<\/a>");
      return jQuery(item).html(_html);
    });
  };

  HashtagParser.prototype._default_query = function() {
    return console.log("HashtagParser _default_query");
  };

  return HashtagParser;

})();

window.Hashtag = Hashtag;

window.HashtagParser = HashtagParser;

jQuery(document).ready(function() {
  return __ht.parser = new HashtagParser(__ht.api_key);
});