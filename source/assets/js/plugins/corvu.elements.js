/**
 * corvu.elements.js
 *
 * corvu.elements.js is a jQuery plugin to manipulate the animated 
 * elements of cor.vu's website
 *
 *
 * Copyright 2013 Cristiano Becker (@cristianobecker)
 *
 * ------------------------------------------------
 *  author:  Cristiano Becker
 *  version: 0.0.1
 */


/*global jQuery */
/*jslint regexp: true */

(function ($) {


    "use strict";


    // ---


    function Elements($element, parameters) {
        this.element = $element;
        this.parameters = parameters;

        this.init();
    }

    Elements.prototype.init = function () {
        var elem = this.element,
            image = this.parameters.image,
            text = elem.text() || "The Crow";

        elem
            .empty()
            .append("<img src='" + image + "' alt='" + text + "'>");
    };

    Elements.prototype.getPixel = function (values, size) {
        var elem = this.element,
            stage = this.parameters.stage,
            pixel = [],
            perc,
            total,
            dimen,
            diff,
            i;

        for (i = 0; i < 2; i += 1) {
            if (typeof values[i] === "number") {
                pixel[i] = values[i];
            } else {
                perc = parseFloat(values[i]) / 100;
                total = stage[i === 0 ? "width" : "height"]();
                dimen = elem.data("fallback-ie")
                    ? elem.data("original-" + (i === 0 ? "width" : "height"))
                    : elem[i === 0 ? "width" : "height"]();
                diff = dimen * size / 2;

                pixel[i] = total * perc - diff;
            }
        }

        return pixel;
    };

    Elements.prototype.getScale = function () {
        var tranf = this.element.css("transform"),
            reg = (/matrix\((-?\d*\.?\d+)\,.+/).exec(tranf);

        return reg ? +reg[1] : 1;
    };

    Elements.prototype.update = function (options) {
        var element = this.element,
            values = this.parameters.positions[options.section][options.view],
            animation = {};

        if (values) {
            animation.size = values[2] || this.getScale();
            animation.position = this.getPixel(values, animation.size);
            animation.opacity = values[3];

            element.corvu_move(animation, "1s", "0s", "ease-in-out");
        }
    };


    // ---


    $.fn.corvu_elements = function (parameters, args) {
        return this.each(function () {
            var $this = $(this),
                inst = $this.data("elements");
            if (!inst) {
                $this.data("elements", new Elements($this, parameters));
            } else if (inst[parameters]) {
                inst[parameters](args);
            }
        });
    };


}(jQuery));