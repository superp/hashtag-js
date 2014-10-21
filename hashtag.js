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
    var defaults;
    this.api_key = api_key;
    if (options == null) {
      options = {};
    }
    defaults = {
      wrapper: "body",
      regex: /\[(\#\w+)\]/ig,
      hashtagClass: "ht-init"
    };
    this.options = jQuery.extend(defaults, options);
    this._setup();
  }

  HashtagParser.prototype._setup = function() {
    this.parent = jQuery(this.options.wrapper);
    this._tagReplace(this.parent.get(0));
    this._defaultQuery();
    return jQuery(this.options.hashtagClass).hashtag();
  };

  HashtagParser.prototype._tagReplace = function(node) {
    var i, skip;
    skip = 0;
    if (node.nodeType === 3) {
      if (this.options.regex.test(node.data)) {
        node.data.replace(this.options.regex, (function(_this) {
          return function(all) {
            var anode, args, hashtag, newTextNode, offset;
            args = [].slice.call(arguments);
            offset = args[args.length - 2];
            hashtag = args[args.length - 3];
            newTextNode = node.splitText(offset);
            newTextNode.data = newTextNode.data.substr(all.length);
            anode = document.createElement("a");
            anode.title = hashtag;
            anode.textContent = hashtag;
            anode.className = _this.options.hashtagClass;
            anode.href = "javascript:void(0);";
            node.parentNode.insertBefore(anode, node.nextSibling);
            return node = newTextNode;
          };
        })(this));
        skip = 1;
      }
    } else if (node.nodeType === 1 && node.childNodes && !/(script|style|iframe|canvas)/i.test(node.tagName) && node.tagName !== "A") {
      i = 0;
      while (i < node.childNodes.length) {
        i += this._tagReplace(node.childNodes[i]);
        ++i;
      }
    }
    return skip;
  };

  HashtagParser.prototype._defaultQuery = function() {
    return console.log("HashtagParser _default_query");
  };

  return HashtagParser;

})();

window.Hashtag = Hashtag;

window.HashtagParser = HashtagParser;

jQuery(document).ready(function() {
  return __ht.parser = new HashtagParser(__ht.api_key);
});