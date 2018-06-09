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

    $('#loginButtonA').click(function () {
        swal("Nothing to see here", "Did you really think we had time to add login here? XDD<br>Why don't you download our client instead?", "error");
    });

    $('#loginButtonB').click(function () {
        swal("Nothing to see here", "Did you really think we had time to add login? XDD<br>Why don't you download our client instead?", "error");
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

    /*
    particlesJS('particles-js',

        {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": false,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    },
                    "image": {
                        "src": "img/github.svg",
                        "width": 100,
                        "height": 100
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 0,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 0.5,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": false,
                        "mode": "repulse"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 400,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true,
            "config_demo": {
                "hide_card": false,
                "background_color": "#b61924",
                "background_image": "",
                "background_position": "50% 50%",
                "background_repeat": "no-repeat",
                "background_size": "cover"
            }
        }
    );*/

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