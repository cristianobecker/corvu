/**
 * corvu.content.js
 *
 * corvu.content.js is a jQuery plugin to manipulate the content
 * of cor.vu's website
 *
 *
 * Copyright 2013 Cristiano Becker (@cristianobecker)
 *
 * ------------------------------------------------
 *  author:  Cristiano Becker
 *  version: 0.0.1
 */


/*global window, document, jQuery */


(function ($) {


    "use strict";


    // ---


    function normalize(str) {
        if (str) {
            var rgx = /^([a-z\-]+)(\-(\d+))?$/.exec(str),
                obj = {};

            if (rgx && rgx[1]) {
                obj.main = rgx[1];
                obj.segment = rgx[3] || 1;
            }

            return obj;
        }

        return {};
    }


    // ---


    function Content($element) {
        this.element = $element;
        this.init();
    }

    Content.prototype.init = function () {
        var element = this.element,
            sections = element.find(".section-item,.section-content");

        sections.each(function () {
            var $this = $(this);
            $this
                .css({ display: "block" })
                .corvu_move({ opacity: 0 });
        });
    };

    Content.prototype.update = function (options) {
        var element = this.element,
            after = normalize(options.current),
            before = normalize(options.old),
            current = element.find("#section-" + after.main),
            previous = element.find("#section-" + before.main),
            speed = previous.length > 0 ? 0.5 : 0;


        if (before.main !== after.main) {
            previous
                .removeClass("active-section")
                .corvu_move({ opacity: 0 }, speed + "s", (speed / 3) + "s")
                .find(".active-content")
                    .removeClass("active-content")
                    .corvu_move({ opacity: 0 }, (speed / 2) + "s", "0s");
        }


        current
            .addClass("active-section")
            .corvu_move({ opacity: 1 }, speed + "s", (speed * 2) + "s")
            .find(".section-content")
                .filter(".active-content")
                    .removeClass("active-content")
                    .corvu_move({ opacity: 0 }, (speed / 2) + "s", "0s")
                    .end()
                .eq(after.segment - 1)
                    .addClass("active-content")
                    .corvu_move({ opacity: 1 }, speed + "s", (speed * 2) + "s");
    };


    // ---


    $.fn.corvu_content = function (method, args) {
        return this.each(function () {
            var $this = $(this),
                inst = $this.data("content");
            if (!inst) {
                $this.data("content", new Content($this));
            } else if (inst[method]) {
                inst[method](args);
            }
        });
    };


}(jQuery));