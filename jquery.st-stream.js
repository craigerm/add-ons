(function( $ ){

	/// Storyteller Stream Plug-in 0.0.2
	/// Copyright © 2012 Story Arc Corporation · storytellerhq.com

	var methods = {

		initialize: function( options ){
			options = options || {};

			return this.each( function(){
				var $this = $( this );

				$this.data( 'selector', options.selector || $this.data('selector') || 'article' );
				$this.data( 'uri-template', options.uriTemplate || $this.data('uri-template') );

				if (!$this.data( 'uri-template' ) && window.console && console.error ){
					console.error('Please provide a URI Template in order to continue.');
					return false;
				}

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
				}
				else if (window.console && console.error) {
					console.error('Sorry, no content was found. Please try another selector.');
				}

				$this.trigger( 'blend', $this );

			});

		},
		nextPage: function(){

			return this.each( function(){
				var $this = $(this),
					nextUrls = [],
					values = [];

				$this.find('data.nextPage').each(function(){
					nextUrls[ $(this).data('segment') ] = $(this).stStream('parseQuery', $(this).attr('value'));
					$(this).remove();
				});

				var	nextUrl = $this.data('uri-template').replace( /[^{]+(?=\})/g, function(segment, param){
					var resource = segment.split(';').shift(),
						param = segment.split(';').pop();

					return nextUrls[resource][param] || '';
				}).replace( /[\{\}]/g, '');

				$this.trigger( 'next', $this );
				$this.removeClass('loaded').addClass('loading');

				$.ajax({
					url: nextUrl,
					dataType: 'html'
				}).done(function( results ){
					$this.append( $(results).contents() ).stStream('blend').removeClass('loading').addClass('loaded');
					$this.trigger( 'load', $this );
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