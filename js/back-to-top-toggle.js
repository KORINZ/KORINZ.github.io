$(document).ready(function () {
    var isAnimating = false;

    $(window).on('scroll', function () {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });

    // Trigger the scroll event as soon as the page loads
    $(window).trigger('scroll');

    // scroll body to 0px on click
    $('#back-to-top').click(function () {
        if (isAnimating) return false;  // Do nothing if an animation is in progress

        isAnimating = true;  // Set the flag to true to indicate that an animation has started

        $('body,html').animate({
            scrollTop: 0
        }, 400, function () {
            isAnimating = false;  // Reset the flag when the animation finishes
        });

        return false;
    });
});