# st-stream

### [Demo][demo]

**Present aggregated content as a single blended and paginated stream.**
This jQuery plugin is designed for use in conjunction with the [Storyteller platform][storyteller], but could prove useful anywhere content is paginated by one of these methods:

 - **Numbered pages:** Pages are computed based on available content and accessed sequentially. Examples: [Flickr][flickr], [Vimeo][vimeo]

 - **Index/Offset:** Increments content by the index of the first content item in each “page” of content.<br />Examples: [YouTube][youtube], [SoundCloud][soundcloud], [Facebook][facebook], [Tumblr][tumblr]

 - **Cursoring:** Increasingly typical of timeline-oriented social APIs, this method paginates using ranges of IDs rather than pre-computing “pages” of results. Examples: [Facebook][facebook], [Twitter][twitter], [Instagram][instagram]

 - **Token-based:** Associates each page of content with a unique token, provided in each response for use in the next request. Examples: [Google+][google+]


URL Mapping
--------------------------------------------------------------------------------

Rather than implementing logic to support the above methods individually, st-stream relies upon the presence of pre-generated pagination URLs and parameters in each response. A simple URI template based on on [RFC6570][rfc6570] is used to extract necessary parameter values from these URLs and pass them along to a relative URL responsible for requesting and rendering additional content.

#### Example

Given this URI template:

```
/content?twitter={twitter;max_id}&youtube={youtube;start-index}
```

The following values would be extracted from the pagination URLs below:

 - **max_id:** 252620416600928260 https://api.twitter.com/1.1/search/tweets.json?q=the+killers&count=15&max_id=252620416600928260

 - **start-index:** 11
https://gdata.youtube.com/feeds/api/videos?q=the+killers&max-results=5&start-index=11&orderby=published&v=2


Usage
--------------------------------------------------------------------------------

**[jQuery 1.5][jquery] or higher is required.**


### Instantiation

The plugin requires markup consisting of an element containing a stream of recently posted content. This content is automatically blended in reverse chronological order if a `data-datetime` attribute is provided for each content item. These attributes must be set to a date string supported by JavaScript’s `Date.parse` method.

Pagination requires a `<data>` element for each service, defining a URL where the next page of results may be fetched, correlating to the URI template like so: `{service;parameter-name}`:

``` html
<div class="stream" data-uri-template="/content?twitter={twitter;max_id}/youtube={youtube;start-index}">
    <article data-datetime="2012-10-01T04:06:33.108Z">
        ···
    </article>
    <data class="nextPage" data-service="youtube" value="https://gdata.youtube.com/feeds/api/videos?q=the+killers&start-index=11&max-results=5&orderby=published&v=2"></data>
</div>
```

Note that newly loaded pages of content won’t be blended in order to maintain the current scroll position when the content is inserted into the DOM. If strict chronological order is required, call the [blend method](#blend) on the [load event](#load).

### Manual Pagination

New content can be loaded on any desired event by calling the plugin’s [nextPage method](#nextpage).

#### Example

``` js
$('.next').click(function() {
    $('.stream').stStream('nextPage');
});

$('.stream').stStream().on({
    next: function() {
        $('.next').attr('disabled', true);
    },
    load: function() {
        $('.next').removeAttr('disabled');
    }
});
```

### Scrolling Pagination

The plugin can also automatically load the next page of content when the user scrolls to the end of the stream. This UX pattern is commonly referred to as [“endless pagination”][pagination]. The scrolling threshold can be optionally adjusted in pixels to jumpstart the asynchronous request for likely completion before the user has reached the end.

#### Example

``` js
$('.stream').stStream({ trigger: 'scrolling' });
```


Options
--------------------------------------------------------------------------------

Options may be set by passing them in a configuration object when calling the plugin or by setting `data` attributes on the instantiated element. Both methods are interchangeable, but note that the configuration object takes priority.

### nextPageTrigger `string`

|**Default: manual**|Requires the [nextPage method](#nextpage) method to be called on a desired event|
|scrolling|Enables scrolling pagination|

### selector `string`

Selects matching children of the element on which the plugin has been instantiated. Selected elements are blended if they have a valid `data-datetime` attribute. **Default:** `article`

### scrollingThreshold `integer`

Adjusts the scrolling threshold (in pixels) that triggers the next page load when reached. **Default:** `-200` offset from the end of the container element

### uri-template `string`

Defines a relative URL where additional content may be loaded with placeholders for each pagination parameter. Any number of parameters may be defined as path segments or in the query string. **Default:** none


Events
--------------------------------------------------------------------------------

The following events may prove useful for:

 - Binding interactions with a UI control to trigger a new page load
 - Offering feedback to users when new content is loading
 - Adjusting scroll position after new content has been loaded

### `blendStart`

Triggered before blended content is inserted into the DOM.

### `blend`

Triggered after blended content has been inserted into the DOM.

### `loadStart`

Triggered before new content is requested asynchronously.

### `load`

Triggered after new content has been successfully returned, blended, and inserted into the DOM.


Methods
--------------------------------------------------------------------------------

### `blend(data)`

A jQuery object may be optionally passed to this method to be blended but skipping insertion into the DOM.

### `nextPage`

Triggers the population of the relative pagination URL from related `<data>` elements in the content. An asynchronous request loads and appends it’s response to the stream.


License
--------------------------------------------------------------------------------

**This plugin is available under the MIT License (Expat).**
Copyright © 2012 Story Arc Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[storyteller]: http://storytellerhq.com
[demo]: http://264-st-stream.sites.storytellerhq.com/the+killers

[jquery]: http://jquery.com/download
[inview]: https://github.com/protonet/jquery.inview
[appear]: http://code.google.com/p/jquery-appear

[rfc6570]: http://tools.ietf.org/html/rfc6570
[pagination]: http://codinghorror.com/blog/2012/03/the-end-of-pagination.html

[facebook]: http://developers.facebook.com/docs/reference/api/pagination
[flickr]: http://www.flickr.com/services/api/flickr.photos.getRecent.html
[google+]: https://developers.google.com/+/api/#pagination
[instagram]: http://instagram.com/developer/endpoints#pagination
[soundcloud]: http://developers.soundcloud.com/docs#pagination
[tumblr]: http://www.tumblr.com/docs/en/api/v2#posts
[twitter]: https://dev.twitter.com/docs/working-with-timelines
[youtube]: https://developers.google.com/youtube/2.0/reference#Paging_through_Results
[vimeo]: http://developer.vimeo.com/apis/advanced/methods/vimeo.videos.getAll
