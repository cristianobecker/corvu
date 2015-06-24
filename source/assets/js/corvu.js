/**
 * corvu.js
 *
 * corvu.js is the core of the cor.vu's website using CSS3 transforms 
 * and transitions in modern browsers and with fallbacks to IE8 and Android 2.3.
 *
 *
 * Copyright 2013 Cristiano Becker (@cristianobecker)
 *
 * ------------------------------------------------
 *  author:  Cristiano Becker
 *  version: 0.0.1
 */


/*global window, document, jQuery, Modernizr */
/*jslint regexp: true */

(function ($, M, doc, win) {


    "use strict";


    // ---


    function corvu() {

        var mobile = corvu.mobile;

        M.addTest("android23", function () {
            return mobile && mobile.android && (/^2\.[0-3][\d\.]*$/).test(corvu.mobile.version);
        });

        M.addTest("msie", function () {
            return (/msie/gi).test(win.navigator.userAgent);
        });

        if (mobile) {
            if (mobile.chrome) {
                // chrome
                if (mobile.apple) {
                    corvu.onload(function () {
                        win.scrollTo(0, 1);
                    });
                }
            }

            if (mobile.iphone && mobile.safari) {
                // iphone safari
                $("#wrapper").css({
                    height: (win.innerHeight !== 268 ? win.innerHeight : 208) + 60
                });
                corvu.onload(function () {
                    win.scrollTo(0, 1);
                });
            }
        }

        $(win).on("load", function () {
            if (M.android23) {
                M.load([{
                    load: "assets/js/plugins/jquery.transform2d.js",
                    complete: function () {
                        win.transitionLoaded = true;

                        corvu.onload.dispatch();
                        corvu.navigation.start();
                    }
                }]);
            } else {
                corvu.onload.dispatch();
                corvu.navigation.start();
            }
        });


        return corvu;

    }

    win.corvu = corvu;


    // ---


    corvu.onload = (function () {

        var callbacks = [];

        function load(func) {
            callbacks.push(func);

            return corvu;
        }

        load.dispatch = function () {
            $("body").removeClass("loading");

            var i, t;
            for (i = 0, t = callbacks.length; i < t; i += 1) {
                callbacks[i].call(win);
            }
        };

        return load;

    }());


    // ---


    corvu.analytics = (function () {


        var ga = "analytics";

        function analit(code, title) {
            win.GoogleAnalyticsObject = ga;

            win[ga] = function () {
                window[ga].q.push(arguments);
            };
            win[ga].q = [];
            win[ga].l = +new Date();

            win[ga]("create", code, title);

            M.load("//www.google-analytics.com/analytics.js");


            return corvu;
        }

        analit.pageview = function (link, title) {
            win[ga]("send", "pageview", {
                "page": link,
                "title": title
            });
        };


        return analit;


    }());


    // ---


    corvu.navigation = (function () {


        var $html = $("html"),
            $win = $(win),
            $elements = $(),
            $links = null,
            $content = null,
            transf = M.prefixed("transform"),
            traorg = M.prefixed("transformOrigin"),
            options = null,
            interval = null,
            currentid = -1;


        function nav(opt) {
            options = opt;

            $links = $(options.menu);
            $content = $(options.content).corvu_content();

            var view, image, data, $el, e;
            view = nav.view(true);

            for (e in options.elements) {
                if (options.elements.hasOwnProperty(e) && corvu.positions.hasOwnProperty(e)) {
                    $el = $(options.elements[e]);
                    $elements = $elements.add($el);
                    data = $el.data();

                    if (M.svg && data.svg) {
                        image = data.svg;
                    } else {
                        image = (view === "mobile" || view === "wide") && data.mobile
                            ? data.mobile
                            : data.image;
                    }

                    $el.corvu_elements({
                        image: options.assets + image,
                        positions: corvu.positions[e],
                        stage: $content
                    });
                }
            }

            nav.ajust(view, $win.height());


            return corvu;
        }

        nav.ajust = function (view, height) {
            if (M.csstransforms) {
                var minimum = 690,
                    coef = height / minimum,
                    newheight = minimum / height * height;
                if (height < minimum && view === "maximum") {
                    $content
                        .css(transf, "scale(" + coef + ")")
                        .css(traorg, "50% 0")
                        .css("height", newheight);
                } else {
                    $content
                        .css(transf, "")
                        .css("height", "");
                }
            }
        };

        nav.start = function () {
            var $doc = $(doc),
                $tip = $("#home-tip");

            nav.view();
            nav.change(win.location.hash);

            if (M.csstransforms) {
                if (currentid === 0) {
                    $tip.corvu_move({ opacity: 0 }, "0.5s", $tip.width() > 200 ? "3s" : "10s", "ease-in", true);
                } else {
                    $tip.css("display", "none");
                }
            }

            $win
                .on("hashchange", function () {
                    nav.change(win.location.hash);
                })
                .on("resize", function () {
                    win.clearTimeout(interval);

                    if (!$html.hasClass("resize")) {
                        $html.addClass("resize");
                    }

                    interval = win.setTimeout(function () {
                        nav.ajust(nav.view(true), $win.height());
                        $elements.corvu_elements("update", {
                            section: nav.current,
                            view: nav.view()
                        });
                    }, 200);
                });

            $doc
                .on("keydown", function (e) {
                    if (e.which === 9 || (e.which >= 32 && e.which <= 34) || (e.which >= 37 && e.which <= 40)) {
                        e.preventDefault();
                    }
                })
                .on("keyup", function (e) {
                    if (e.which === 9 || (e.which >= 32 && e.which <= 34) || (e.which >= 37 && e.which <= 40)) {
                        switch (e.which) {
                        case 33: // pg up
                        case 37: // left
                        case 38: // up
                            nav.prev();
                            break;
                        case 9:  // tab
                        case 32: // space
                        case 34: // pg down
                        case 39: // right
                        case 40: // down
                            nav.next();
                            break;
                        }

                        e.preventDefault();
                    }
                });

            if (M.touch) {
                $doc.on("touchstart", function (e) {
                    var touch = e.originalEvent.touches,
                        start = {};

                    if (touch.length === 1) {
                        start.x = touch[0].clientX;
                        start.y = touch[0].clientY;

                        $doc
                            .on("touchmove", function (e1) {
                                var touchmove = e1.originalEvent.touches[0],
                                    diff = {
                                        x: touchmove.clientX - start.x,
                                        y: touchmove.clientY - start.y
                                    };

                                if (Math.abs(diff.y) <= 10) {
                                    if (Math.abs(diff.x) >= 10) {
                                        if (diff.x > 0) {
                                            nav.prev();
                                        } else {
                                            nav.next();
                                        }

                                        $doc
                                            .off("touchmove")
                                            .off("touchend");

                                        e1.preventDefault();
                                    }
                                } else {
                                    $doc
                                        .off("touchmove")
                                        .off("touchend");
                                }
                            })
                            .one("touchend", function () {
                                $doc.off("touchmove");
                            });
                    }
                });
            }
        };

        nav.view = (function () {

            var lastview = null,
                testmethod = M.mq,
                views = {
                    maximum: "only screen and (min-width: 1280px)",
                    desktop: "only screen and (min-width: 1024px)",
                    tablet: "only screen and (min-width: 768px)",
                    wide: "only screen and (min-width: 480px)"
                };

            if (win.respond && !win.mediaQueriesSupported) {
                testmethod = function (query) {
                    return +(/\d+/).exec(query) <= $html.width();
                };
            }

            return function (cache) {
                if (!(cache && lastview)) {
                    var ret = "mobile",
                        s;

                    for (s in views) {
                        if (views.hasOwnProperty(s) && testmethod(views[s])) {
                            ret = s;
                            break;
                        }
                    }

                    lastview = ret;
                }

                return lastview;
            };

        }());

        nav.change = function (section) {
            var regex = (/^#?(.+)$/).exec(section),
                $menu = null,
                old = null;

            section = regex ? regex[1] : $links.eq(0).attr("href").substring(1);

            if (nav.current !== section) {
                $menu = $links.filter("[href='#" + section + "']");

                if ($menu.length > 0) {
                    old = nav.current;

                    $html
                        .removeClass("is-" + nav.current)
                        .addClass("is-" + section);

                    $links.filter(".active-menu").removeClass("active-menu");
                    $menu.addClass("active-menu");

                    nav.current = section;
                    currentid = $menu.parent().index();

                    $elements.corvu_elements("update", { section: nav.current, view: nav.view(true) });
                    $content.corvu_content("update", { current: section, old: old });


                    corvu.analytics.pageview("/#" + section, $menu.attr("title"));
                }
            }
        };

        nav.go = function (section) {
            win.location.hash = section;
        };

        nav.prev = function () {
            var i = currentid - 1,
                m = $links.eq(i).attr("href");

            if (currentid > 0) {
                nav.go(m);
            }
        };

        nav.next = function () {
            var i = (currentid + 1) % $links.length,
                m = $links.eq(i).attr("href");

            nav.go(m);
        };


        return nav;


    }());


    // ---


    corvu.mobile = (function () {

        var obj = null,
            ua = window.navigator.userAgent,
            ios = (/(iphone|ipad|ipod).+os\s+([\d\_]+)/gi).exec(ua),
            android = (/android\s+([\d\.]+)/gi).exec(ua);

        if (!!ios || !!android) {
            obj = {};
            obj[!!ios ? ios[1].toLowerCase() : "android"] = true;
            if (!!ios) {
                obj.apple = true;
                obj.version = ios[2].replace((/\_/g), ".");
                obj[(/crios/gi).test(ua) ? "chrome" : "safari"] = true;
            }
            if (obj.android) {
                obj.version = android[1];
                if ((/chrome/gi).test(ua)) {
                    obj.chrome = true;
                }
            }
        }

        return obj;

    }());


    // ---


    corvu.positions = (function () {
        var sections = [
                "home",
                "apparatus",
                "expertise-1",
                "expertise-2",
                "expertise-3",
                "contact"
            ],
            defaults = {
                logo: {
                    mobile: [-150, 15, 0.5],// √
                    wide: [-150, 15, 0.5],// √
                    tablet: [-250, 40, 0.28],// √
                    desktop: [40, 40, 0.35]// √
                },
                fthcrow: {
                    mobile: [120, 100, 0.25, 0],// √
                    wide: [120, 100, 0.25, 0],
                    tablet: ["130%", 200, 0.5, 0],// √
                    desktop: ["110%", 150, 0.5, 0]// √
                },
                fthbig: {
                    mobile: [-100, 400, 0.5, 0],// √
                    wide: [-100, 400, 0.5, 0],
                    tablet: [-150, 1000, 1.5, 0],// √
                    desktop: [-50, 820, 1.5, 0]// √
                },
                fthsmall: {
                    mobile: [-200, 200, 0.5, 0],// √
                    wide: [-200, 200, 2, 0],
                    tablet: [-500, 500, 2, 0],// √
                    desktop: [-200, 200, 2, 0]// √
                }
            },
            positions = {
                crow: {
                    "home": {
                        mobile: [90, -70, 0.55, 1],// √
                        wide: [90, -70, 0.55, 1],// √
                        tablet: [120, -150, 0.5, 1],// √
                        desktop: [360, -150, 0.5, 1]// √
                    },
                    "apparatus": {
                        mobile: [20, -220, 1, 1],// √
                        wide: [20, -220, 1, 1],
                        tablet: [25, -400, 1, 1],// √
                        desktop: [200, -500, 1, 1]// √
                    },
                    "expertise-1": {
                        mobile: [-400, -150, 1, 1],// √
                        wide: [-400, -150, 1, 1],
                        tablet: [-700, -350, 1, 1],// 
                        desktop: [-650, -300, 1, 1]// √
                    },
                    "expertise-2": {
                        mobile: [25, -250, 1, 1],// √
                        wide: [25, -250, 1, 1],
                        tablet: [35, -450, 1, 1],// √
                        desktop: [150, -550, 1, 1]// √
                    },
                    "expertise-3": {
                        mobile: [-80, -460, 1, 1],// √
                        wide: [-80, -460, 1, 1],
                        tablet: [-270, -950, 1, 1],// √
                        desktop: [-55, -1000, 1, 1]// √
                    },
                    "contact": {
                        mobile: ["60%", "50%", 0.43, 0],// √
                        wide: ["60%", "50%", 0.5, 0],// √
                        tablet: ["60%", "50%", 0.55, 0],// √
                        desktop: ["60%", "50%", 0.5, 0]// √
                    }
                },
                logo: {
                    "home": {
                        mobile: [10, 10, 0.35],// √
                        wide: [10, 10, 0.35],// √
                        tablet: [10, 40, 0.28],// √
                        desktop: [40, 40, 0.35]// √
                    },
                    "expertise-1": {
                        mobile: [-150, 15, 0.35],// √
                        wide: [-150, 15, 0.35],// √
                        tablet: [-250, 40, 0.28],// √
                        desktop: [150, 40, 0.35]// √
                    },
                    "contact": {
                        mobile: ["50%", 50, 0.6],// √
                        wide: ["50%", 40, 0.6],// √
                        tablet: ["50%", 80, 0.6],// √
                        desktop: ["50%", 60, 0.6],// √
                        maximum: ["50%", 100, 0.6]// √
                    }
                },
                fthcrow: {
                    "home": {
                        mobile: [270, 20, 0.5, 1],// √
                        wide: [270, 20, 0.5, 1],
                        tablet: ["90%", 280, 1, 1],// √
                        desktop: ["90%", 280, 1, 1]// √
                    }
                },
                fthbig: {
                    "apparatus": {
                        mobile: [-70, 350, 0.5, 1],// √
                        wide: [-70, 350, 0.5, 1],
                        tablet: [-200, 750, 1, 1],// √
                        desktop: [-50, 630, 1, 1]// √
                    },
                    "expertise-2": {
                        mobile: [-40, 310, 0.5, 1],// √
                        wide: [-40, 310, 0.5, 1],
                        tablet: [-150, 700, 0.8, 1],// √
                        desktop: [-40, 580, 0.8, 1]// √
                    },
                    "expertise-3": {
                        mobile: [240, 80, 0.5, 1],// √
                        wide: [840, 80, 1, 1],
                        tablet: [570, 180, 1, 1],// √
                        desktop: [840, 80, 1, 1]// √ 
                    }
                },
                fthsmall: {
                    "apparatus": {
                        mobile: [-90, 230, 0.5, 1],// √
                        wide: [-90, 230, 0.5, 1],
                        tablet: [-130, 500, 1, 1],// √
                        desktop: [50, 400, 1, 1]// √
                    },
                    "expertise-2": {
                        mobile: [-50, 320, 0.5, 1],// √
                        wide: [-50, 320, 0.5, 1],
                        tablet: [-100, 650, 0.8, 1],// √
                        desktop: [0, 520, 0.8, 1]// √
                    },
                    "expertise-3": {
                        mobile: [-35, 280, 0.5, 1],// √
                        wide: [-35, 280, 0.5, 1],
                        tablet: [100, 850, 1, 1],// √
                        desktop: [100, 620, 1, 1],// √
                        maximum: [100, 550, 1, 1]// √
                    }
                }
            },
            s1,
            s2,
            i,
            t;

        for (s1 in positions) {
            if (positions.hasOwnProperty(s1)) {
                for (i = 0, t = sections.length; i < t; i += 1) {
                    if (!positions[s1].hasOwnProperty(sections[i])) {
                        positions[s1][sections[i]] = defaults[s1];
                    }
                }

                for (s2 in positions[s1]) {
                    if (positions[s1].hasOwnProperty(s2) && !positions[s1][s2].maximum) {
                        positions[s1][s2].maximum = positions[s1][s2].desktop;
                    }
                }
            }
        }

        return positions;
    }());


}(jQuery, Modernizr, document, window));