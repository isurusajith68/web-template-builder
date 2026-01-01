(function ($) {
    "use strict";

    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    new WOW().init();
    
    
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            }
        }
    });

    const initDateValidation = function () {
        const checkin = document.getElementById("checkin");
        const checkout = document.getElementById("checkout");

        if (!checkin || !checkout) {
            return;
        }

        const pad = function (value) {
            return String(value).padStart(2, "0");
        };
        const now = new Date();
        const today = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());

        checkin.min = today;
        checkout.min = today;

        const addDays = function (dateString, daysToAdd) {
            if (!dateString) {
                return "";
            }
            const parts = dateString.split("-");
            if (parts.length !== 3) {
                return "";
            }
            const year = Number(parts[0]);
            const month = Number(parts[1]) - 1;
            const day = Number(parts[2]);
            const date = new Date(year, month, day);
            if (Number.isNaN(date.getTime())) {
                return "";
            }
            date.setDate(date.getDate() + daysToAdd);
            return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
        };

        const syncCheckoutMin = function () {
            const checkinValue = checkin.value;
            const minCheckout = checkinValue ? addDays(checkinValue, 1) : today;
            checkout.min = minCheckout;

            if (checkinValue && (!checkout.value || checkout.value < minCheckout)) {
                checkout.value = minCheckout;
            }
        };

        checkin.addEventListener("change", syncCheckoutMin);
        syncCheckoutMin();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initDateValidation);
    } else {
        initDateValidation();
    }
    
})(jQuery);

