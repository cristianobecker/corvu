/**
 * corvu.move.js
 *
 * corvu.move.js is a jQuery plugin to animate elements using 
 * css3transforms and css3transitions if supported
 *
 *
 * Copyright 2013 Cristiano Becker (@cristianobecker)
 *
 * ------------------------------------------------
 *  author:  Cristiano Becker
 *  version: 0.0.1
 */


/*global jQuery, Modernizr, window */


(function ($, M, win) {


    "use strict";


    // ---


    var use3d = M.csstransforms3d,
        properties = {
            transition: M.prefixed("transition"),
            transitionDelay: M.prefixed("transitionDelay"),
            transitionDuration: M.prefixed("transitionDuration"),
            transitionTimingFunction: M.prefixed("transitionTimingFunction"),
            transform: M.prefixed("transform"),
            transformOrigin: M.prefixed("transformOrigin"),
            perspective: M.prefixed("perspective"),
            backface: M.prefixed("backfaceVisibility")
        },
        transform = {
            translate: (use3d ? "translate3d([A]px,[B]px,0)" : "translate([A]px,[B]px)"),
            scale: (use3d ? "scale3d([A],[A],1)" : "scale([A])")
        };


    function getCSS3(animation) {
        var ret = {},
            css = "",
            change = false,
            trans = [];

        if (animation.hasOwnProperty("position") && animation.position.length === 2) {
            css = transform.translate;
            css = css.replace(/\[A\]/g, animation.position[0]);
            css = css.replace(/\[B\]/g, animation.position[1]);
            trans.push(css);
        }

        if (animation.hasOwnProperty("size") && typeof animation.size === "number") {
            css = transform.scale;
            css = css.replace(/\[A\]/g, animation.size);
            trans.push(css);
        }

        if (animation.hasOwnProperty("opacity") && typeof animation.opacity === "number") {
            ret.opacity = animation.opacity;
            change = true;
        }

        if (trans.length > 0) {
            ret[properties.transform] = trans.join(" ");
            change = true;
        }

        return change ? ret : null;
    }

    function getCSS2(animation, elem) {
        var ret = {},
            change = false;

        if (animation.hasOwnProperty("position") && animation.position.length === 2) {
            ret.top = animation.position[1];
            ret.left = animation.position[0];
            change = true;
        }

        if (animation.hasOwnProperty("size")) {
            ret.width = animation.size * elem.data("original-width");
            ret.height = animation.size * elem.data("original-height");
            change = true;
        }

        if (animation.hasOwnProperty("opacity")) {
            ret.opacity = animation.opacity;
            change = true;
        }

        return change ? ret : null;
    }

    function config(elem, css3trans) {
        if (!elem.data("configured")) {
            if (css3trans) {
                elem.css(properties.transition, "all 0s ease-in 0s");
            }

            if (M.csstransforms) {
                elem.css(properties.transformOrigin, "left top");
            } else {
                var child = elem.find("img");

                if (child.length > 0) {
                    elem.css({ width: child.width(), height: child.height() });
                    child.css({ width: "100%", height: "100%" });
                }

                elem
                    .data("fallback-ie", true)
                    .data("original-width", elem.width())
                    .data("original-height", elem.height());
            }

            elem.data("configured", true);
        }
    }

    function move(element, animation, duration, delay, easing, ignoreFirst) {
        if (M.csstransitions && !M.android23) {
            element
                .css(properties.transitionDuration, duration)
                .css(properties.transitionDelay, delay)
                .css(properties.transitionTimingFunction, easing);

            config(element, !ignoreFirst);

            element.css(getCSS3(animation));
        } else {
            duration = parseFloat(duration) * 1000;
            delay = parseFloat(delay) * 1000;

            var animobj = null;

            if (M.csstransforms) {
                animobj = getCSS3(animation);
                config(element, false);
            } else {
                config(element, false);
                animobj = getCSS2(animation, element);
            }

            if (animobj) {
                if (win.transitionLoaded) {
                    animobj.transform = animobj[properties.transform];

                    element
                        .delay(delay)
                        .animate(animobj, { duration: duration });
                } else {
                    element.css(animobj);
                }
            }
        }
    }


    // ---


    $.fn.corvu_move = function (animation, duration, delay, easing, ignoreFirst, callback) {
        return this.each(function () {
            var $this = $(this),
                time;

            if ($this.length > 0) {
                animation = animation || {};
                duration = duration || "1s";
                delay = delay || "0s";
                easing = easing || "ease-in";



                if (win.requestAnimationFrame) {
                    win.requestAnimationFrame(function () {
                        move($this, animation, duration, delay, easing, ignoreFirst);
                    });
                } else {
                    move($this, animation, duration, delay, easing, ignoreFirst);
                }

                if (callback) {
                    time = (parseFloat(delay) + parseFloat(duration)) * 1000;
                    win.setTimeout(function () {
                        callback.call($this);
                    }, time + 100);
                }
            }
        });
    };


}(jQuery, Modernizr, window));