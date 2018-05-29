$(document).ready(function () {

    $('.js-navbar-link').on('click',function (e) {
        e.preventDefault();

        var target = this.hash;
        var $target = $(target);

        $('html, body').stop().animate({
            'scrollTop': $target.offset().top - $("#mainnav").height()
        }, 500, 'swing', function () {

        });
    });

    $(".hamburger").on("click",function(){
        toggleOverlay();
    });

    $('a.overlayLink').click(function () {
        toggleOverlay();
    });

    $('#registerButtonA').click(function () {
        clearRegister();
        $('#registerModal').modal('show');
    });

    $('#registerButtonB').click(function () {
        clearRegister();
        $('#registerModal').modal('show');
    });

    function clearRegister() {
        $("#usernameRegister").val("");
        $("#emailRegister").val("");
        $("#password1Register").val("");
        $("#password2sRegister").val("");

        $("#registerError").html("");
        $("#registerError").hide();
    }

    $('#submitRegister').click(function () {
       var username = $("#usernameRegister").val();
       var email = $("#emailRegister").val();
       var password1 = $("#password1Register").val();
       var password2 = $("#password2Register").val();

        $("#registerError").html("");
        $("#registerError").hide();

       if (password1 != password2) {
           $("#registerError").show();
           $("#registerError").html("Idiot! Your passwords don't match!");
       } else {

           $.ajax({
               type: "POST",
               url:'/auth/register', //'http://localhost:3005/auth/register',
               contentType: "application/json; charset=utf-8",
               dataType: "json",
               data: JSON.stringify({
                   email: email,
                   username: username,
                   password: password1
               }),
               success: function (data) {

                   console.log(data);

                   if (data['error'] != null) {
                       $("#registerError").show();
                       $("#registerError").html(data['error']);
                   } else {
                       $('#registerModal').modal('hide')
                       swal("Success!", "Welcome to HUBG!", "success");
                       console.log("lol gg");
                   }
               }
           })

       }

    });

    var bgresize = function () {

        if ($(window).width() <= 767) {

            $("#navham").removeClass("hidden");
            $("#navleft").hide();

        } else {

            $("#navham").addClass("hidden");
            $("#navleft").show();
        }
    }

    bgresize();
    $(window).resize(bgresize);
    $(window).on("orientationchange", bgresize);

});

function toggleOverlay() {
    $("#navham").toggleClass("is-active");
    if($("#navham").hasClass("is-active")){
        $(".overlay").css({visibility: "visible"});
        $("html").css({"overflow-y": "hidden"});
    } else{
        $(".overlay").css({visibility: "hidden"});
        $("html").css({"overflow-y": "visible"});
    }
}