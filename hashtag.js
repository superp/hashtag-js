var Hashtag, HashtagParser, nojQuery, script;

nojQuery = false;

if (!window.jQuery) {
  script = document.createElement('script');
  script.type = "text/javascript";
  script.src = "http://code.jquery.com/jquery-1.10.2.js";
  document.getElementsByTagName('head')[0].appendChild(script);
  nojQuery = true;
}

Hashtag = (function() {
  function Hashtag(dom_element, options) {
    var defaults;
    this.dom_element = dom_element;
    if (options == null) {
      options = {};
    }
    defaults = {
      wrapper: "ht-wrapper",
      iframeUrl: "http://www.hashtago.com/widgets/",
      callback: null
    };
    this.options = jQuery.extend(defaults, options);
    this._setup();
    this._events();
  }

  Hashtag.prototype._setup = function() {
    this.hashtag = jQuery(this.dom_element);
    this.uid = this.hashtag.attr("title").replace(/\#/g, "");
    this.frameName = "hashtag-frame-" + this.uid;
    this.hashtag.addClass(this.options.wrapper);
    return this.hashtag.data("hashtag", this);
  };

  Hashtag.prototype._events = function() {
    this.hashtag.click((function(_this) {
      return function(event) {
        var container, element, iframe, loading, overlay, skin, wrap;
        element = jQuery(event.target);
        iframe = _this._buildIframe(element);
        container = _this._buildContainer();
        container.append(iframe);
        overlay = jQuery("<div/>").addClass("hashtag-overlay");
        wrap = jQuery("<div/>").addClass("hashtag-wrap");
        skin = jQuery("<div/>").addClass("hashtag-skin");
        loading = jQuery("<div/>").attr("id", "hashtag-loading").append("<div></div>");
        overlay.append(wrap.append(skin.append(container))).append(loading);
        jQuery('body').append(overlay);
        jQuery('body').css("position", "fixed");
        jQuery("#" + _this.frameName).load(function() {
          return jQuery('#hashtag-loading').hide();
        });
        if (jQuery.isFunction(_this.options.callback)) {
          return _this.options.callback.apply(_this, [_this]);
        }
      };
    })(this));
    return jQuery(window).resize((function(_this) {
      return function() {
        var container;
        container = jQuery("#hashtag-container");
        if (container.length > 0) {
          return container.css("height", _this._contentHeight() + "px");
        }
      };
    })(this));
  };

  Hashtag.prototype._contentHeight = function() {
    return jQuery(window).height() - 40;
  };

  Hashtag.prototype._buildIframe = function(element) {
    var iframe;
    iframe = jQuery('<iframe frameborder="0" vspace="0" hspace="0" scrolling="auto" />');
    iframe.attr("id", this.frameName).attr("name", this.frameName).addClass("hashtag-iframe");
    iframe.attr("src", HashtagParser.buildUrl(this.options.iframeUrl + this.uid, {
      key: __ht.api_key
    }));
    return iframe;
  };

  Hashtag.prototype._buildContainer = function() {
    var close, container, title;
    container = jQuery("<div/>");
    container.attr("id", "hashtag-container");
    container.css("height", this._contentHeight() + "px");
    close = jQuery("<a href='javascript:void(0)' onclick='jQuery(\".hashtag-overlay\").remove();jQuery(\"body\").css(\"position\", \"static\")'></a>").addClass("hashtag-close");
    title = jQuery("<div/>").addClass("hashtag-title").text(this.hashtag.attr("title"));
    return container.append(close).append(title);
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
      hashtagClass: "ht-init",
      collectionUrl: "http://www.hashtago.com/widgets",
      cssUrl: "css/hashtag.css"
    };
    this.options = jQuery.extend(defaults, options);
    this._setup();
  }

  HashtagParser.prototype._setup = function() {
    this.parent = jQuery(this.options.wrapper);
    this._tagReplace(this.parent.get(0));
    this._defaultQuery();
    this._loadStyles();
    return jQuery("." + this.options.hashtagClass).hashtag();
  };

  HashtagParser.prototype._defaultQuery = function() {
    var imgNode, values;
    values = jQuery("." + this.options.hashtagClass).map(function() {
      return this.title;
    }).get().join(",").replace(/\#/g, "");
    imgNode = document.createElement("img");
    imgNode.src = HashtagParser.buildUrl(this.options.collectionUrl, {
      tags: values,
      key: this.api_key
    });
    imgNode.style.position = "absolute";
    imgNode.style.left = "-9999px";
    return jQuery('body').append(imgNode);
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

  HashtagParser.prototype._loadStyles = function() {
    var head, link;
    if (!document.getElementById("hashtag-css")) {
      head = document.getElementsByTagName('head')[0];
      link = document.createElement('link');
      link.id = "hashtag-css";
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = this.options.cssUrl;
      link.media = 'all';
      return head.appendChild(link);
    }
  };

  HashtagParser.buildUrl = function(url, parameters) {
    var key, qs, value;
    qs = "";
    for (key in parameters) {
      value = parameters[key];
      qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }
    if (qs.length > 0) {
      qs = qs.substring(0, qs.length - 1);
      url = url + "?" + qs;
    }
    return url;
  };

  return HashtagParser;

})();

window.Hashtag = Hashtag;

window.HashtagParser = HashtagParser;

window.onload = function() {
  if (nojQuery) {
    jQuery.noConflict();
  }
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
  return __ht.parser = new HashtagParser(__ht.api_key);
};