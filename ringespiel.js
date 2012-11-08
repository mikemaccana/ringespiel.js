/* 
jRingespiel - jQuery plugin to create a carousel-style widget.
*/

 define(["jquery", "lib/jquery.event.move", "lib/jquery.event.swipe"], function($) {
  $.fn.jCarouselLite = function(o) {
    o = $.extend({
      btnPrev: null,
      btnNext: null,
      btnGo: null,
      mouseWheel: false,
      auto: null,

      speed: 200,
      easing: null,

      vertical: false,
      circular: true,
      visible: 3,
      start: 0,
      scroll: 1,

      beforeStart: null,
      afterEnd: null
    }, o || {});

    // Returns the element collection. Chainable.
    return this.each(function(index, element) {               

      var running = false, 
        animCss=o.vertical?"top":"left", 
        sizeCss=o.vertical?"height":"width";
      var div = $(element), 
        $carouselList = $("ul", div), 
        $carouselItems = $("li", $carouselList), 
        carouselItemCount = $carouselItems.size(), 
        v = o.visible;

      if(o.circular && (carouselItemCount > v)) {
        carouselList.prepend($carouselItems.slice(carouselItemCount-v).clone())
          .append($carouselItems.slice(0,v).clone());
        o.start += v;
      }

      var li = $("li", $carouselList), itemLength = li.size(), curr = o.start;
      div.css("visibility", "visible");

      li.css({overflow: "hidden", "float" : o.vertical ? "none" : "left"});
      $carouselList.css({margin: "0", padding: "0", position: "relative", "list-style-type": "none", "z-index": "1"});
      div.css({overflow: "hidden", position: "relative", "z-index": "2", left: "0px"});

      var liSize = o.vertical ? height(li) : width(li);   // Full li size(incl margin)-Used for animation
      var ulSize = liSize * itemLength;           // size of full ul(total length, not just for the visible items)
      var divSize = liSize * v;               // size of entire div(total length for just the visible items)

      $carouselList.css(sizeCss, ulSize+"px").css(animCss, -(curr*liSize));

      div.css(sizeCss, divSize+"px");           // Width of the DIV. length of visible images

      if(o.btnPrev)
        $(o.btnPrev).click(function() {
          return go(curr-o.scroll);
        });

      div.on('swiperight', function(event) {
        return go(curr-o.scroll);
      });

      div.on('swipeleft', function(event) {
        return go(curr+o.scroll);
      });

      if(o.btnNext)
        $(o.btnNext).click(function() {
          return go(curr+o.scroll);
        });

      if(o.btnGo)
        $.each(o.btnGo, function(i, val) {
          $(val).click(function() {
            return go(o.circular ? o.visible+i : i);
          });
        });

      if(o.mouseWheel && div.mousewheel)
        div.mousewheel(function(e, d) {
          return d>0 ? go(curr-o.scroll) : go(curr+o.scroll);
        });

      if(o.auto)
        setInterval(function() {
          go(curr+o.scroll);
        }, o.auto+o.speed);

      function vis() {
        return li.slice(curr).slice(0,v);
      }

      function enableDisableButtons() {
        $(o.btnPrev + "," + o.btnNext).removeClass("disabled");

        if(curr <= 0 && o.btnPrev){
          $(o.btnPrev).addClass("disabled");
        }
        if(curr + o.scroll >= itemLength && o.btnNext){
          $(o.btnNext).addClass("disabled");
        }
      }

      function go(to) {
        if(!running) {

          if(o.beforeStart)
            o.beforeStart.call(this, vis());

          if(o.circular) {      // If circular we are in first or last, then goto the other end
            if(to<=o.start-v-1) {       // If first, then goto last
              $carouselList.css(animCss, -((itemLength-(v*2))*liSize)+"px");
              // If "scroll" > 1, then the "to" might not be equal to the condition; it can be lesser depending on the number of elements.
              curr = to==o.start-v-1 ? itemLength-(v*2)-1 : itemLength-(v*2)-o.scroll;
            } else if(to>=itemLength-v+1) { // If last, then goto first
              carouselList.css(animCss, -( (v) * liSize ) + "px" );
              // If "scroll" > 1, then the "to" might not be equal to the condition; it can be greater depending on the number of elements.
              curr = to==itemLength-v+1 ? v+1 : v+o.scroll;
            } else curr = to;
          } else {
            // If non-circular and to points to first or last, we just return.
            if (to <= -v || to >= itemLength) {
              return false;
            } else if (to > curr) {
              curr = Math.min(to, (itemLength - v));
            } else if (to < curr) {
              curr = Math.max(to, 0);
            } else {
              return false;
            }
          } // If neither overrides it, the curr will still be "to" and we can proceed.

          running = true;

          $carouselList.animate(
            animCss == "left" ? { left: -(curr*liSize) } : { top: -(curr*liSize) } , o.speed, o.easing,
            function() {
              if(o.afterEnd)
                o.afterEnd.call(this, vis());
              running = false;
            }
          );
          // Disable buttons when the carousel reaches the last/first, and enable when not
          if(!o.circular) {
            enableDisableButtons();
          }

        }
        return false;
      }

      enableDisableButtons();
    });
  };

  function css(el, prop) {
    return parseInt($.css(el[0], prop), 10) || 0;
  }
  function width(el) {
    return  el[0].offsetWidth + css(el, 'marginLeft') + css(el, 'marginRight');
  }
  function height(el) {
    return el[0].offsetHeight + css(el, 'marginTop') + css(el, 'marginBottom');
  }

 });

