(function( $ ){

	/// Storyteller Stream Plug-in 0.0.2
	/// Copyright © 2012 Story Arc Corporation · storytellerhq.com

	var loadingInProgress = false,
		scrollingThreshold,

		methods = {

		initialize: function( options ){
			var options = options || {};

			return this.each( function(){
				var $this = $( this );

				scrollingThreshold = $this.height() + $this.scrollTop();

				$this.data( 'next-page-trigger', options.nextPageTrigger || $this.data('next-page-trigger') ) || 'manual';
				$this.data( 'selector', options.selector || $this.data('selector') || 'article' );
				$this.data( 'uri-template', options.uriTemplate || $this.data('uri-template') );

				if(!$this.data( 'uri-template' ) && window.console && console.error ){
					console.error('Please provide a URI Template in order to continue.');
					return false;
				}

				if( $this.data( 'next-page-trigger') === 'scrolling' ) $this.stStream('scrollToInfinity');

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
					$nextUrls = $data.children('.nextPage');

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

			return this.each( function(){
				var $this = $(this),
					scrollPosition,
					nextUrls = [],
					values = [];

				$this.find('data.nextPage').each(function(){
					nextUrls[ $(this).data('segment') ] = $(this).stStream('parseQuery', $(this).attr('value'));
					$(this).remove();
				});

				var	nextUrl = $this.data('uri-template').replace( /[^{]+(?=\})/g, function(segment, param){
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

					$(window).scrollTop(scrollPosition);

					scrollingThreshold = $this.height() + $this.scrollTop();
					loadingInProgress = false;
				});

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