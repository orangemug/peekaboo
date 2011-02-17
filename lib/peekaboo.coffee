class PeekabooItem
  constructor: (elem) ->
    # Elements
    @elem   = elem
    @handle = @elem.find('.handle')

    @elem.css
      'position': "relative"

    # Wrap in a div so in '_setupCoords' we have a non-moving point of reference
    @elem.wrap('<div />')
    @container = @elem.parent()
    @container.css
      'overflow': 'hidden'
      'margin': '0'
      'padding': '0'
      #'clear': 'both'

    # State either open or closed
    @status    = 'open'

    # Duration of the sliding animation
    @animDuration = 400

    @_setupCoords()
    @_bindInitialEvents()


  # Need to calculate these each time incase we move the containing div
  _setupCoords: () ->
    # Offsets
    @offsetPos = @container.offset().top
    @centerHandleOffset = @elem.height() - @handle.height()/2

    # The stop points
    @closedPos  = -(@elem.height() - @handle.height())
    @openPos    = 0
    @halfwayPos = @openPos + (-@closedPos - -@openPos)/2 + @handle.height()/2


  _bindInitialEvents: () ->
    @handle.bind 'mousedown', (e) => @_dragStart(e)
    @handle.bind 'touchstart', (e) => @_dragStart(e)

  _bindHandleEvents: () ->
    $(document).bind 'mousemove', (e) => @_dragMove(e)
    $(document).bind 'mouseup',   (e) => @_dragEnd(e)

    @handle.bind 'touchmove', (e) => @_dragMove(e)
    @handle.bind 'touchend',  (e) => @_dragEnd(e)

  _clearHandleEvents: () ->
    $(document).unbind 'mousemove'
    $(document).unbind 'mouseup'

    @handle.unbind 'touchmove'
    @handle.unbind 'touchend'


  _checkBounds: (pos) ->
    if pos > @openPos
      #console.log "NOT IN BOUNDS A #{pos} > #{@openPos}"
      pos = @openPos
    else if pos < @closedPos
      #console.log "NOT IN BOUNDS B #{pos} < #{@closedPos}"
      pos = @closedPos
    pos


  _toLocalCoord: (pos) ->
    return (pos - @offsetPos)

  _pos: (e) ->
    pos = e.pageY || e.originalEvent.touches[0].pageY
    @_toLocalCoord(pos)


  _dragStart: (e) ->
    @_setupCoords()

    @startPos      = @_pos(e)
    @totalMovement = 0

    @_bindHandleEvents()

    e.preventDefault()
    e.stopPropagation()


  _dragMove: (e) ->
    e.preventDefault()
    e.stopPropagation()
    return if !@startPos

    @currentPos    = @_pos(e)
    @totalMovement += (@currentPos - @startPos)

    @_move(@currentPos - @centerHandleOffset, true)


  _dragEnd: (e) ->
    @_clearHandleEvents()

    if @totalMovement < 3 && @totalMovement > -3
      @toggle()
    else
      if @currentPos > @halfwayPos
        @open()
      else
        @close()

    @startPos = null

    e.preventDefault()
    e.stopPropagation()


  # Get prefix for transformations if one is available
  _get_transform_prefix: (element) ->
    prefixes =
      'transform':       ''
      'WebkitTransform': 'webkit-'
    #'MozTransform':    'moz-' # TODO: Fix this

    for prop,prefix of prefixes
      if typeof element.style[prop] != 'undefined'
        return prefix
    return null

  _move: (pos, animOff, callback) ->
    pos = @_checkBounds(pos)

    duration = @animDuration
    if animOff
      duration = 0

    # See if we can use the new css3 bits to speed it up a little.
    if prefix = @_get_transform_prefix(@elem[0])
      clearTimeout @timeout
      
      @elem.css "#{prefix}transition-property", "all"
      @elem.css "#{prefix}transition-duration", "#{duration}ms"
      @elem.css "#{prefix}transform", "translate3d(0,#{pos}px,0)"
      
      # Turn off the transition once its complete.
      @timeout = setTimeout () =>
        @elem.css "#{prefix}transition-property", "none"
        callback() if callback
      ,(duration+100)
    else
      console.warn "JQUERY"
      @elem.animate({
        'top': pos
      }, duration)


  configure: (opts) ->
    for n,v of opts
      switch n
        when "animation_speed"
          @animDuration = parseInt(v)
        when "initial_state"
          if v == "open"
            @open()
          else
            @close()
        when "open_hook"
          @openHooks.push v
        when "close_hook"
          @openHooks.push v


  open: (animOff) ->
    @_setupCoords()
        
    # Set the container to the correct height
    @container.css "height", @elem.height()
        
    @status = 'open'
    @_move @openPos, animOff


  close: (animOff) ->
    @_setupCoords()
    @status = 'close'
    @_move @closedPos, animOff, () =>
      # Set the container to the correct height
      @container.css "height", @handle.height()

  toggle: (animOff) ->
    if @status == 'open'
      @close(animOff)
    else
      @open(animOff)



class Peekaboo
  constructor: () ->
    @peekabooItems = []

  add: (item) ->
    @peekabooItems.push item

  panel: (elem) ->
    for item in @peekabooItems
      if item.elem[0] == $(elem)[0]
        return item

  check: () ->
    $('.peekaboo').each (idx,elem) =>
      elem = $(elem)
      @add new PeekabooItem(elem)
    return

# Initialize on startup
$('document').ready () =>
  window.peekaboo = new Peekaboo
  window.peekaboo.check()

