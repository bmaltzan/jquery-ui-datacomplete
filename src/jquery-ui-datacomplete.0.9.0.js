/*
 * jquery-ui-datacomplete
 * jQuery UI Autocomplete Extension 
 */

(function( $ ) {

var requestIndex = 0;
var itemSelected = 0;

$.widget( "ui.datacomplete", $.ui.autocomplete, {

  options: {
    autoFocus     : true,
    minLength     : 0,
    scrollHeight  : 400,
    extraData     : null,
    columns       : null,
    submitForm    : false,

    select: function(ev, it) {
      var options = $(this).data("datacomplete").options;

      if (options.extraData) {
        for (var i = 0; i < options.extraData.length; i++) {
          var wskey  = options.extraData[i]["ws"];
          var domkey = options.extraData[i]["dom"];
          if (wskey && domkey) {
            domkey = "#" + domkey;

            var ws  = it.item[wskey];
            var dom = $(domkey);

            if (ws && dom) { 
              dom.attr("value", ws);
            }
          }
        }
      }
      itemSelected = true;
    },

                              // form should be submitted as part of close,
                              //   so values will be set and submitted with form.
    close: function() {
      if ( itemSelected ) {
        var options = $(this).data("datacomplete").options;
        if (options.submitForm) {
          var t = $("#" + options.submitForm);
          if (t) {
            t.submit();
          }
        }
      }
    }
  },
                              // this is overridden, instead of just source, 
                              //   so the user can still define urls and use extraParams
  _initSource: function() {
    var self = this,
      array,
      url;
    if ( $.isArray(this.options.source) ) {
      array = this.options.source;
      this.source = function( request, response ) {
        response( $.ui.autocomplete.filter(array, request.term) );
      };
    } else if ( typeof this.options.source === "string" ) {
      url = this.options.source;
      this.source = function( request, response ) {
        if ( self.xhr ) {
          self.xhr.abort();
        }

        if ( this.options.extraParams ) {
          $.each(this.options.extraParams, function(key, param) {
            if ( param == null ) {
              param = document.getElementById(key);
              if ( param && param.length > 0) {
                request[key] = param.value;
              }
            } else {
              request[key] = param;
            }
          });
        }

        self.xhr = $.ajax({
          url: url,
          data: request,
          dataType: "jsonp",
          autocompleteRequest: ++requestIndex,
          success: function( data, status ) {
            if ( this.autocompleteRequest === requestIndex ) {
              response( data );
            }
          },
          error: function() {
            if ( this.autocompleteRequest === requestIndex ) {
              response( [] );
            }
          }
        });
      };
    } else {
      this.source = this.options.source;
    }
  },

  /* When adding divs inside the anchor, need +2 width for Firefox. */
  _resizeMenu: function() {
    var ul = this.menu.element;
    ul.outerWidth( Math.max(
      // Firefox wraps long text (possibly a rounding bug)
      // so we add 1px to avoid the wrapping (#7513)
      ul.width( "" ).outerWidth() + 2,
      this.element.outerWidth()
    ) );
  },

  _renderMenu: function( ul, items ) {
    var self = this;

    if ( this.options.columns && ! items[0].label ) {
      var li = $( "<li></li>" );

      var div = $("<div class='ui-datacomplete-header clearfix'></div>");
      li.append(div);

      for (var i = 0; i < this.options.columns.length; i++) {
        var name = this.options.columns[i];
        for(key in name) {
          var value = name[key];

          var header = $("<div class='dc-header-" + key + "'>" + value +"</div>");
          div.append(header);
        }
      }
      ul.append(li);
    }
    $.each( items, function( index, item ) {
      self._renderItem( ul, item );
    });
  },

  _renderItem: function( ul, item) {
    var li = $( "<li></li>" )
      .data( "item.autocomplete", item );

    var a = $("<a class='clearfix'></a>");
    li.append(a);

    if ( this.options.columns && ! item.label ) {
      for (var i = 0; i < this.options.columns.length; i++) {
        var name = this.options.columns[i];
        for(key in name) {
          var div = $("<div class='dc-" + key + "'>" + item[key] +"</div>");
          a.append(div);
        }
      }
    } else {
			a.append(item.label);
    }

    li.appendTo( ul );
    return li;
  },

                              // item.label is optional now
  _normalize: function( items ) {
    // assume all items have the right format when the first item is complete
    if ( items.length && (this.options.columns || items[0].label) && items[0].value ) {
      return items;
    }
    return $.map( items, function(item) {
      if ( typeof item === "string" ) {
        return {
          label: item,
          value: item
        };
      }
      return $.extend({
        label: item.label || item.value,
        value: item.value || item.label
      }, item );
    });
  },


  testit: function() {
    return "scope test";
  }

});

}( jQuery ));

