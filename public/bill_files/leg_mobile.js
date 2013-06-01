/* ====================
 * Mobile display code
 *      - Legislature-wide management of showing mobile view
 * Requires: 
 *      - jQuery library
 *      - leg_core library
 * ==================== */

handleMobile();

//purpose: identifies whether mobile view is needed & applies the style
function handleMobile() {
    var mobileSize = 480;                                               //set cut-off for screen size of devices considered "mobile" handhelds; excludes tablets
    var mobileCookie = $.cookie('usemobile');                           //get current cookie value

    if (jQuery(window).width() > mobileSize) {
        if (mobileCookie === 'yes') {                                   //cookie flag, so show mobile view on full screen
            jQuery('body').addClass('leg_UseMobile');
        }
    }
    else {
        if ((mobileCookie != 'no') || (mobileCookie == null)) {         //no cookie or set to no, so show mobile view on handheld mobile device
            jQuery('body').addClass('leg_UseMobile');
        }
    }
}