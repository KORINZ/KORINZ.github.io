$(document).ready(function () {
    $('#back-to-top').hide();  // Hide the button when the page loads

    let isAnimating = false;

    $(window).on('scroll', function () {
        // Calculate current scroll percentage
        let scrollPercent = ($(window).scrollTop() / ($(document).height() - $(window).height())) * 100;

        if (scrollPercent >= 80) {  // Show button when scrolled 90% or more
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