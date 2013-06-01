/* ====================
 * hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+
 * <http://cherne.net/brian/resources/jquery.hoverIntent.html>
 * 
 * @param  f  onMouseOver function || An object with configuration options
 * @param  g  onMouseOut function  || Nothing (use configuration options object)
 * @author    Brian Cherne brian(at)cherne(dot)net
 * ==================== */
(function ($) { $.fn.hoverIntent = function (f, g) { var cfg = { sensitivity: 7, interval: 100, timeout: 0 }; cfg = $.extend(cfg, g ? { over: f, out: g} : f); var cX, cY, pX, pY; var track = function (ev) { cX = ev.pageX; cY = ev.pageY }; var compare = function (ev, ob) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity) { $(ob).unbind("mousemove", track); ob.hoverIntent_s = 1; return cfg.over.apply(ob, [ev]) } else { pX = cX; pY = cY; ob.hoverIntent_t = setTimeout(function () { compare(ev, ob) }, cfg.interval) } }; var delay = function (ev, ob) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); ob.hoverIntent_s = 0; return cfg.out.apply(ob, [ev]) }; var handleHover = function (e) { var ev = jQuery.extend({}, e); var ob = this; if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t) } if (e.type == "mouseenter") { pX = ev.pageX; pY = ev.pageY; $(ob).bind("mousemove", track); if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout(function () { compare(ev, ob) }, cfg.interval) } } else { $(ob).unbind("mousemove", track); if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout(function () { delay(ev, ob) }, cfg.timeout) } } }; return this.bind('mouseenter', handleHover).bind('mouseleave', handleHover) } })(jQuery);

/* ====================
* jQuery Cookie Plugin
* https://github.com/carhartl/jquery-cookie
*
* Copyright 2011, Klaus Hartl
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://www.opensource.org/licenses/mit-license.php
* http://www.opensource.org/licenses/GPL-2.0
* ==================== */
(function ($) {
    $.cookie = function (key, value, options) {

        // key and at least value given, set cookie...
        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
            options = $.extend({}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var decode = options.raw ? function (s) { return s; } : decodeURIComponent;

        var pairs = document.cookie.split('; ');
        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
            if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
        }
        return null;
    };
})(jQuery);


/* ====================
 * Navigation event management handler code
 *      - Legislature-wide hover and mobile devices management
 *      - runs after DOM is constructed (in jQuery ready() function)
 *
 * ***To add possibly: /webos|blackberry|Windows|PhoneZuneWP7/ support
 * ==================== */
jQuery(document).ready(function () {
    var mobileSize = 480;                                           //set cut-off for screen size of small mobile handheld devices           
    var tapStatus = 0;                                              //flag for handling taps & gestures on touch screen devices (1 = tap, 0 = gesture or no tap)

    //----------------- setup large screens and tablets

    if (jQuery(window).width() > mobileSize) {
        var deviceAgent = navigator.userAgent.toLowerCase();                //identify the user agent
        var isMatch = (deviceAgent.match(/(ipad|android)/) != null);        //setup flag for match against device agent checks

        //check cookie to show mobile despite large screen
        if ($.cookie('usemobile') === 'yes') {                              //cookie flag, so show mobile view on full screen
            manageMobileView();
        }
        else {                                                              //no cookie or set to no, so show full view            
            if (!isMatch) {                                                 //setup for non-tablet - only add hoverintent to large screens, for mouse user interface
                var config = {              //setup hoverIntent - config var determines timing/conditions for showing core navitgation drop-down into banner
                    sensitivity: 4,         // = (number) sensitivity threshold (must be 1 or higher); if the mouse travels fewer than this number of pixels between polling intervals, then the "over" function will be called  
                    interval: 60,           // = (number) milliseconds for onMouseOver polling interval; wait time between reading & comparing mouse coordinates    
                    over: hoverOver,        // = (function) to call in onMouseOver event callback (REQUIRED)    
                    timeout: 50,            // = (number) milliseconds of delay before onMouseOut event fires
                    out: hoverOut           // = (function) to call in onMouseOut event callback (REQUIRED)    
                };

                //add hoverIntent event manager to each <li> for top-level leg navigation, and office navigation
                jQuery('.leg_LegNav ul li').hoverIntent(config);
                jQuery('.leg_OfficeNav ul li').hoverIntent(config);
            }
            else {                                                          //setup for tablet (ipad & android)                
                manageFullView();
            }
        }
    }   //end large screen & tablet setup


    //----------------- setup handheld MOBILE nav

    if (jQuery(window).width() <= mobileSize) {
        var mobileCookie = $.cookie('usemobile');

        //show mobile unless cookie flagged it otherwise
        if ((mobileCookie != 'no') || (mobileCookie == null)) {             //no cookie or set to no, so show mobile view
            manageMobileView();
        }
        else {                                                              //cookie flag, so show full screen view
            manageFullView();
        }
    }


    //----------------- setup search text boxes

    //set flag for removing default input box text
    jQuery('.leg_DefaultText').attr('isCleared', 'false');

    //setup text removal from search text boxes
    jQuery('.leg_DefaultText').focus(function () {
        var isCleared = (jQuery(this).attr('isCleared') == 'true');

        if (!isCleared) {
            jQuery(this).attr('value', '');
            jQuery(this).attr('isCleared', 'true');
            jQuery(this).css('font-style', 'normal');
        }
    });


    //----------------- setup cookie & handle switching between mobile/full display

    jQuery('.leg_ViewFull').click(function (event) {
        $.cookie('usemobile', 'no', { expires: 365, path: '/' });

        var href = $(location).attr('href');
        if (href.indexOf('#') > 0) {
            href = href.substring(0, href.indexOf('#'));                    //strip internal link
        }
        window.location.href = href;
    });

    jQuery('.leg_IconMobile').click(function (event) {
        $.cookie('usemobile', 'yes', { expires: 365, path: '/' });

        var href = $(location).attr('href');
        if (href.indexOf('#') > 0) {
            href = href.substring(0, href.indexOf('#'));                    //strip internal link
        }
        window.location.href = href;
    });


    //================= Function definitions ================= 

    //purpose: setup event management for mobile view navigation
    //comments: uses CLICK event instead of hover
    function manageMobileView() {
        //----- Legislative nav

        //toggle top-level
        jQuery('#leg_mobile_LegNavHeader h2').click(function (event) {
            toggleNavHeader('leg_mobile_LegNavHeader', 'leg_LegNav');
            event.preventDefault();                             //don't follow a link
        });

        //toggle core links
        jQuery('.leg_LegNavTop').click(function (event) {
            var returnStatus = handleNavCore(this, 'leg_LegNav', true);
            if (returnStatus == true) {
                return;
            }
            else {
                event.preventDefault();                         //don't follow a link
            }
        });

        jQuery('.leg_LegNav .leg_mobile_Accordion').click(function (event) {
            handleNavCore(this, 'leg_LegNav', false);
            event.preventDefault();                             //don't follow a link
        });


        //----- office nav

        //toggle top-level
        jQuery("#leg_mobile_OfficeNavHeader h2").click(function (event) {
            toggleNavHeader('leg_mobile_OfficeNavHeader', 'leg_OfficeNav');
            event.preventDefault();                             //don't follow a link
        });

        //toggle core links
        jQuery('.leg_OfficeNavTop').click(function () {
            var returnStatus = handleNavCore(this, 'leg_OfficeNav', true);
            if (returnStatus == true) {
                return;
            }
            else {
                event.preventDefault();                         //don't follow a link
            }
        });

        jQuery('.leg_OfficeNav .leg_mobile_Accordion').click(function (event) {
            handleNavCore(this, 'leg_OfficeNav', false);
            event.preventDefault();                             //don't follow a link
        });
    }  //end manageMobileView()


    //purpose: setup event management for full screen view navigation
    //comments: uses CLICK event instead of hover
    function manageFullView() {

        //legislative nav
        jQuery('.leg_LegNav ul li').click(function (event) {
            var curClass = jQuery(this).find('a').attr('class').toString();                     //get the classes anchor link under current <li>

            if (curClass.indexOf('_Hover') >= 0) {                                              //hover class already applied, currently showing drop-down from this <li>
                return;                                                                         //no intervention needed; if link clicked, browser will follow
            }
            else {
                //Hide all dropdowns
                hideAllNav()

                //show this drop down                    
                jQuery(this).find('a.leg_LegNavTop').addClass('leg_LegNavTop_Hover');
                jQuery(this).find('.leg_LegNavCore').css('left', '-1px');                       //pull over from offscreen

                event.preventDefault();                                                         //started showing a dropdown, prevent following link within this <li>
            }
        });

        //office nav
        jQuery('.leg_OfficeNav ul li').click(function (event) {
            var curClass = jQuery(this).find('a').attr('class').toString();                     //get the classes anchor link under current <li>

            if (curClass.indexOf('Linkonly') >= 0) {                                            //no dropdown to display
                return;
            }
            else if (curClass.indexOf('_Hover') >= 0) {                                         //hover class already applied, currently showing drop-down from this <li>
                return;                                                                         //no intervention needed; if link clicked, browser will follow
            }
            else {
                //Hide all dropdowns
                hideAllNav()

                //show this drop down                    
                jQuery(this).find('a.leg_OfficeNavTop').addClass('leg_OfficeNavTop_Hover');
                jQuery(this).find('.leg_OfficeNavCore').css('margin-left', '0');                //pull over from offscreen

                event.preventDefault();                                                         //started showing a dropdown, prevent following link within this <li>
            }
        });

        //----- add event listening for removing nav dropdowns

        //setup flag for drop-down removal
        jQuery('.leg_FirstNav, .leg_Masthead, .leg_PageContent, .leg_PageFooter, .leg_PageFooterAddr').bind('touchstart', function () {
            tapStatus = 1;
        });

        //gesture in progress, set flag to not remove drop-downs on gestures
        jQuery('.leg_FirstNav, .leg_Masthead, .leg_PageContent, .leg_PageFooter, .leg_PageFooterAddr').bind('touchmove', function () {
            tapStatus = 0;
        });

        //remove drop-downs if a gesture didn't occur
        jQuery('.leg_FirstNav, .leg_Masthead, .leg_PageContent, .leg_PageFooter, .leg_PageFooterAddr').bind('touchend', function () {
            if (tapStatus > 0) {
                hideAllNav();
                tapStatus = 0;                                  //reset
            }
        });

    }  //end manageFullView()


    //purpose: shows a core drop-down when mouse hovers over a nav
    //  -called through hoverIntent based on mouse movement
    //  -handles both leg nav and office nav in one function, but only one "drop-down" will display through this function call
    function hoverOver() {
        var core;
        var curHeight;

        //----- leg nav
        //shift over core leg nav, from underneath banner (this = current .leg_LegNav ul li)        
        core = jQuery(this).find('.leg_LegNavCore');
        if (core.length > 0) {
            core.css('height', '0');
            core.css('left', '-1px');
            core.animate({
                height: '140px'
            }, 'fast');

            //setup 'index tab' view
            jQuery(this).find('a.leg_LegNavTop').addClass('leg_LegNavTop_Hover');
        }

        //----- office nav
        //shift over core office nav (this = current .leg_OfficeNav ul li)
        core = jQuery(this).find('.leg_OfficeNavCore');
        if (core.length > 0) {
            curHeight = core.height();                              //identify dynamic height
            core.css('height', '0');
            core.css('margin-left', '0');
            core.animate({
                height: curHeight
            }, 'fast');

            //setup 'index tab' view
            jQuery(this).find('a.leg_OfficeNavTop').addClass('leg_OfficeNavTop_Hover');
        }
    }


    //purpose: removes a core drop-down when mouse no longer hovers over it
    //  -called through hoverIntent based on mouse movement
    //  -handles both leg nav and office nav in one function
    function hoverOut() {
        //----- leg nav
        //shift core leg nav over to hide it & show banner (this = current .leg_LegNav ul li)
        jQuery(this).find('.leg_LegNavCore').css('left', '-4000px');

        //remove 'index tab' view
        jQuery(this).find('a.leg_LegNavTop').removeClass('leg_LegNavTop_Hover');

        //----- office nav
        //shift core office nav over to hide it (this = current .leg_OfficeNav ul li)
        jQuery(this).find('.leg_OfficeNavCore').css('margin-left', '-4000px');

        //remove 'index tab' view
        jQuery(this).find('a.leg_OfficeNavTop').removeClass('leg_OfficeNavTop_Hover');
    }


    //purpose: removes core drop-downs
    //  -called through click events for tablet devices
    //  -handles both leg nav and office nav in one function
    function hideAllNav() {
        //----- leg nav
        //shift core leg nav over to hide it & show banner
        jQuery(document).find('.leg_LegNavCore').css('left', '-4000px');

        //remove 'index tab' view for leg nav
        jQuery(document).find('a.leg_LegNavTop').removeClass('leg_LegNavTop_Hover');

        //----- office nav
        //shift core office nav over to hide it
        jQuery(document).find('.leg_OfficeNavCore').css('margin-left', '-4000px');

        //remove 'index tab' view for office nav
        jQuery(document).find('a.leg_OfficeNavTop').removeClass('leg_OfficeNavTop_Hover');
    }


    //purpose: handles expand/contract top-level nav links under a NavHeader
    //parameters:
    //  headerID        - ID of nav header element
    //  navClass        - class of nav links 
    function toggleNavHeader(headerID, navClass) {
        var navWrapper = jQuery(document).find('.' + navClass);

        navWrapper.toggle();                    //make nav links visible or hidden
        if (navWrapper.is(':visible')) {        //nav is now shown
            jQuery('#' + headerID).addClass('leg_mobile_NavHeader_Expanded');
        }
        else {                                  //nav is now hidden
            jQuery('#' + headerID).removeClass('leg_mobile_NavHeader_Expanded');

            //close out core/sub-navigation too
            navWrapper.find('.' + navClass + 'Core').toggle(false);
            navWrapper.find('.' + navClass + 'Top').css('text-decoration', 'none');
            navWrapper.find('a').removeClass('leg_mobile_Accordion_Expanded');
        }
    }


    //purpose: hides & closes up sub-navigation of top-level nav  
    //parameters:
    //  headerID        - ID of nav header element to close up
    //  navClass        - class of nav links to hide
    function closeNavHeader(headerID, navClass) {
        jQuery(document).find('#' + headerID).removeClass('leg_mobile_NavHeader_expanded');
        jQuery(document).find('.' + navClass).toggle(false);
        jQuery(document).find('.' + navClass + 'Core').toggle(false);               //close out core/sub-navigation too
    }


    //purpose: handles expand/contract nav core links, or following a link
    //parameters:
    //  toggleElement           - element being clicked for toggle
    //  classStub               - stub nav class name
    //  bFollow                 - flag for whether to follow link (instead of toggle) if nav core already expanded
    function handleNavCore(toggleElement, classStub, bFollow) {
        var navCore = jQuery(toggleElement).parent().find('.' + classStub + 'Core');

        if (navCore.is(':visible')) {                   //core is currently shown
            if (bFollow) {
                return true;
            }
            navCore.toggle(false);                      //make core nav links hidden
            jQuery(toggleElement).parent().find('.' + classStub + 'Top').css('text-decoration', 'none');
            jQuery(toggleElement).parent().find('a.leg_mobile_Accordion').removeClass('leg_mobile_Accordion_Expanded');
        }
        else {                                          //core is currently hidden
            navCore.toggle(true);                       //make core nav links visible
            jQuery(toggleElement).parent().find('a.leg_mobile_Accordion').addClass('leg_mobile_Accordion_Expanded');

            //link can be followed if core is expanded, so show link availability
            jQuery(toggleElement).parent().find('.' + classStub + 'Top').css('text-decoration', 'underline');
        }

        return false;                                   //indicate to not follow a link
    }

});                           /* END document ready navigation event management */
