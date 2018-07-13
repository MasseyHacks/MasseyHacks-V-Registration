$(document).ready(function () {
    var bgresize = function () {

        var windowz = $(window);

        if ($(window).width() <= 1230) {
            $("#login-box").addClass("col-10");
            $("#login-box").removeClass("col-3");

            $("#login-box").removeClass("fadeInLeft");
            $("#login-box").addClass("fadeInUp");


            $("#global-spacer").height($("#cover").height() / 2 - $("#login-box").height() / 2);

        } else {
            $("#login-box").removeClass("col-10");
            $("#login-box").addClass("col-3");

            $("#login-box").removeClass("fadeInUp");
            $("#login-box").addClass("fadeInLeft")

            $("#global-spacer").height(0);
        }

    };

    $("#login").click(function() {
        var email = $("#emailLogin").val();
        var password = $("#passwordLogin").val();

        $.ajax({
            type: "POST",
            url:'/auth/login',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({
                email: email,
                password: password
            }),
            success: function (data) {

                console.log(data);


                swal("Success!", "Welcome to HUBG!", "success");

            },
            error: function(data) {
                swal("Fail!", "Welcome to HUBG!", "success");
            }
        })
    });

    $('.overlay').attr("hidden", false);

    bgresize();
    $(window).resize(bgresize);
    $(window).on("orientationchange", bgresize);
});