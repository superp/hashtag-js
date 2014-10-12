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
    this._setup()
    this._default_query()

  _setup: ->
    console.log "HashtagParser _setup"

    # Only for WordPress
    jQuery("p").each (index, item) ->
      _html = jQuery(item).html().replace(/(\#\w+)/ig, "<a href=\"javascript:void(0)\" class=\"ht-init\">$1<\/a>")
      jQuery(item).html(_html)

  _default_query: ->
    console.log "HashtagParser _default_query"

    # TODO send query with all hashtags


window.Hashtag = Hashtag
window.HashtagParser = HashtagParser

jQuery(document).ready ->
  __ht.parser = new HashtagParser(__ht.api_key)