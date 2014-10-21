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
      callback: null
      
    @options = jQuery.extend defaults, options
    
    this._setup()
    this._events()

  _setup: ->
    @hashtag = jQuery(@dom_element)

    @hashtag.addClass(@options.wrapper)
    @hashtag.data "hashtag", this

  _events: ->
    self = this

    @hashtag.click (event) =>
      # TODO build iframe with articles

      console.log "click"

      if jQuery.isFunction(@options.callback)
        @options.callback.apply(this, [this])


class HashtagParser
  constructor: (@api_key, options = {}) ->
    defaults =
      wrapper: "body"
      regex: /\[(\#\w+)\]/ig
      hashtagClass: "ht-init"
      
    @options = jQuery.extend defaults, options

    this._setup()

  _setup: ->
    @parent = jQuery(@options.wrapper)

    this._tagReplace(@parent.get(0))
    this._defaultQuery()

    jQuery(@options.hashtagClass).hashtag()

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

  _defaultQuery: ->
    console.log "HashtagParser _default_query"

    # TODO send query with all hashtags


window.Hashtag = Hashtag
window.HashtagParser = HashtagParser

jQuery(document).ready ->
  __ht.parser = new HashtagParser(__ht.api_key)