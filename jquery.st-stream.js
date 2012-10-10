(function( $ ){

	/// Storyteller Stream Plug-in 0.0.2
	/// Copyright © 2012 Story Arc Corporation · storytellerhq.com

	var loadingInProgress = false,
        scrollingDisabled = false,
		scrollingThreshold,

		methods = {

		initialize: function( options ){
			var options = options || {};

			return this.each( function(){
				var $this = $( this );

				scrollingThreshold = $this.height() + $this.scrollTop();

				$this.data( 'pagination', options.pagination || $this.data('pagination') ) || 'manual';
				$this.data( 'selector', options.selector || $this.data('selector') || 'article' );
				$this.data( 'uri-template', options.uriTemplate || $this.data('uri-template') );

				if(!$this.data( 'uri-template' ) && window.console && console.error ){
					console.error('Please provide a URI Template in order to continue.');
					return false;
				}

				if( $this.data( 'pagination') === 'scrolling' ) $this.stStream('scrollToInfinity');

				$this.stStream('blend');

				// Bind passed events
				if( options.events ){
					for( var event in options.events ){
						if( options.events.hasOwnProperty( event ) ){
							var method = options.events[event];
							$this.on( event, method );
						}
					}
				}

			});

		},
		blend: function( data ){

			return this.each( function(){
				var $this = $(this);
				var	$data = data || $this;

				var	$content = $data.children( $this.data('selector') ).sort( function( a, b ) {
						if( $(a).data('datetime') )
							return Date.parse( $(b).data('datetime') ) - Date.parse( $(a).data('datetime') );
					}),
					$nextUrls = $data.children('.nextPage, .totalPages');

				var $blended = $.merge($content, $nextUrls);

				$this.trigger( 'blendStart', $this );

				if( data ){
					return $blended;
				}
				else if ($blended.length > 0) {
					$this.empty().append($blended);
    				$this.trigger( 'blend', $this );
				}
				else if (window.console && console.error) {
					console.error('Sorry, no content was found. Please try another selector.');
				}

			});

		},
		nextPage: function(){

            var pagesRemaining = true;

			$(this).each( function(){
				var $this = $(this),
					scrollPosition,
					nextUrls = {},
					values = [];

				$this.find('data.nextPage').each(function(){
					nextUrls[ $(this).data('service') ] = $(this).stStream( 'parseQuery', $(this).attr('value') );
					$(this).remove();
				});

				$this.find('data.totalPages').each(function(){
					var currentPage = $(this).data('current-page') ? parseInt( $(this).data('current-page') ) : 1,
						perPage = parseInt( $(this).data('per-page') );
					var nextPage = $(this).stStream('calculateNextPage', currentPage, $(this).attr('value'), perPage);

					if (nextPage) {
						nextUrls[ $(this).data('service') ] = { 'page': nextPage };
					} else {
						nextUrls[ $(this).data('service') ] = { 'page': '-' };
					}

					$(this).remove();
				});

                if (nextUrls.length === 0) {
                    pagesRemaining = false;
                } else {
                    var	nextUrl = $this.data('uri-template').replace( /[^{]+(?=\})/g, function(segment){
                        var service = segment.split(';').shift(),
                            param = segment.split(';').pop();

                        return nextUrls[service][param] || '';
                    }).replace( /[\{\}]/g, '');

                    $this.trigger( 'loadStart', $this );
                    $this.removeClass('loaded').addClass('loading');

                    loadingInProgress = true;

                    $.ajax({
                        url: nextUrl,
                        dataType: 'html'
                    }).success(function() {
                        scrollPosition = $(window).scrollTop();
                    }).done(function( results ){
                        $this.append( $(results).contents() ).removeClass('loading').addClass('loaded');
                        $this.trigger( 'load', $this );
                        if ($this.find( 'data.nextPage' ).length === 0) $this.trigger( 'lastPage' );

                        $(window).scrollTop(scrollPosition);

                        scrollingThreshold = $this.height() + $this.scrollTop();
                        loadingInProgress = false;
                    });

                    if (pagesRemaining === false) {
                        $(this).trigger( 'lastPage' );
                        return false;
                    } else {
                        return $(this);
                    }

                }

			});

		},
		parseQuery: function( uri ){
			/// Method adapted from: https://gist.github.com/2588921
			/// Itself a variation of: http://remysharp.com/2008/06/24/query-string-to-object-via-regex

			var query = {}, i = uri.indexOf('?');

			if( i != -1 )
				uri.substr(i+1).replace(/\+/g, ' ').replace( /([^&;=]+)=?([^&;]*)/g, function(m, k, v){
					query[ decodeURIComponent(k) ] = decodeURIComponent(v);
				});

			return query;
		},
		calculateNextPage: function( current, total, perPage ){
			if ((total / perPage) > current) {
				return current + 1;
			} else {
				return false;
			}
		},
		scrollToInfinity: function() {

			return this.each( function(){
				var $this = $(this),
					viewportHeight = $(window).height();

				$(window).resize(function() {
					viewportHeight = $(window).height();
				});

				$(window).scroll(function(data){
					if( scrollingThreshold - 200 < ($(window).scrollTop() + viewportHeight) && loadingInProgress === false )
						$this.stStream('nextPage');
				});

			});

		},
		toggleScrolling: function(){
			/// Method adapted from: http://stackoverflow.com/a/4770179/979684

			function disable(event) {
				event.preventDefault();
			}

			if( scrollingDisabled === false ) {
				if (window.addEventListener) window.addEventListener('DOMMouseScroll', disable, false);
				if (window.attachEvent)	window.attachEvent('DOMMouseScroll', disable);

				scrollingDisabled = true;
			} else {
				if (window.removeEventListener) window.removeEventListener('DOMMouseScroll', disable, false);
				if (window.detachEvent)	window.detachEvent('DOMMouseScroll', disable);

				scrollingDisabled = false;
			}

			$(window).keydown(event, function() {
				var keys = [37, 38, 39, 40]; // left: 37, up: 38, right: 39, down: 40, spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36 */
				if (scrollingDisabled === true && $.inArray(event.keyCode, keys) ) event.preventDefault();
			});

		}

	};

	$.fn.stStream = function( method ){
		if( methods[method] ){
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if( typeof method === 'object' || ! method ){
			return methods.initialize.apply( this, arguments );
		}
	};

})( jQuery );