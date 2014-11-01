jQuery.fn.extend
  hashtag: (options) ->
    jQuery(this).each (input_field) ->
      hashtag = jQuery(this).data("hashtag")
      hashtag ?= new Hashtag(this, options)
      
      return hashtag

class Hashtag
  constructor: (@dom_element, options = {}) ->
    defaults =
      wrapper: "ht-wrapper"
      iframeUrl: "http://www.hashtago.com/widgets/"
      callback: null
      
    @options = jQuery.extend defaults, options
    
    this._setup()
    this._events()

  _setup: ->
    @hashtag = jQuery(@dom_element)
    @uid = @hashtag.attr("title").replace(/\#/g, "")

    @hashtag.addClass(@options.wrapper)
    @hashtag.data "hashtag", this

  _events: ->
    @hashtag.click (event) =>
      element = jQuery(event.target)

      iframe = this._buildIframe(element)
      container = this._buildContainer()
      container.append(iframe)

      overlay = jQuery("<div/>").addClass("hashtag-overlay")
      wrap = jQuery("<div/>").addClass("hashtag-wrap")
      skin = jQuery("<div/>").addClass("hashtag-skin")

      overlay.append(wrap.append(skin.append(container)))

      jQuery('body').append(overlay)

      if jQuery.isFunction(@options.callback)
        @options.callback.apply(this, [this])

    jQuery(window).resize =>
      container = $("#hashtag-container")

      if container.length > 0
        container.css("height", this._contentHeight() + "px")

  _contentHeight: ->
    jQuery(window).height() - 40

  _buildIframe: (element) ->
    frameName = "hashtag-frame-" + @uid

    iframe = jQuery('<iframe frameborder="0" vspace="0" hspace="0" scrolling="auto" />')
    iframe.attr("id", frameName).attr("name", frameName).addClass("hashtag-iframe")
    iframe.attr "src", HashtagParser.buildUrl(@options.iframeUrl + @uid,
      key: __ht.api_key
    )

    iframe

  _buildContainer: () ->
    container = jQuery("<div/>")
    container.attr("id", "hashtag-container")
    container.css("height", this._contentHeight() + "px")


    close = jQuery("<a href='javascript:void(0)' onclick='jQuery(\".hashtag-overlay\").remove()'></a>").addClass("hashtag-close")
    title = jQuery("<div/>").addClass("hashtag-title").text(@hashtag.attr("title"))

    container.append(close).append(title)

class HashtagParser
  constructor: (@api_key, options = {}) ->
    defaults =
      wrapper: "body"
      regex: /\[(\#\w+)\]/ig
      hashtagClass: "ht-init"
      collectionUrl: "http://www.hashtago.com/widgets"
      
    @options = jQuery.extend defaults, options

    this._setup()

  _setup: ->
    @parent = jQuery(@options.wrapper)

    this._tagReplace(@parent.get(0))
    this._defaultQuery()

    jQuery("." + @options.hashtagClass).hashtag()

  _defaultQuery: ->
    values = jQuery("." + @options.hashtagClass).map( ->
      return this.title;
    ).get().join(",").replace(/\#/g, "")

    imgNode = document.createElement("img")
    imgNode.src = HashtagParser.buildUrl @options.collectionUrl,
      tags: values
      key: @api_key
    imgNode.style.position = "absolute"
    imgNode.style.left = "-9999px"

    jQuery('body').append(imgNode)

  _tagReplace: (node) ->
    skip = 0

    if node.nodeType is 3
      if @options.regex.test(node.data)
        node.data.replace(@options.regex, (all) =>
          args = [].slice.call(arguments)
          offset = args[args.length - 2]
          hashtag = args[args.length - 3]
          newTextNode = node.splitText(offset)

          newTextNode.data = newTextNode.data.substr(all.length)

          anode = document.createElement("a")
          anode.title = hashtag
          anode.textContent = hashtag
          anode.className = @options.hashtagClass
          anode.href = "javascript:void(0);"

          node.parentNode.insertBefore anode, node.nextSibling
          node = newTextNode
        )

        skip = 1
    else if node.nodeType is 1 and node.childNodes and not /(script|style|iframe|canvas)/i.test(node.tagName) and node.tagName != "A"
      i = 0

      while i < node.childNodes.length
        i += this._tagReplace(node.childNodes[i])
        ++i

    skip

  @buildUrl: (url, parameters) ->
    qs = ""
    qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&" for key, value of parameters

    if qs.length > 0
      # chop off last "&"
      qs = qs.substring(0, qs.length-1) 
      url = url + "?" + qs
    
    return url


window.Hashtag = Hashtag
window.HashtagParser = HashtagParser

jQuery.noConflict()
jQuery(document).ready ->
  __ht.parser = new HashtagParser(__ht.api_key)