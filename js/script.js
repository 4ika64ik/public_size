console.log("adasd")




//=== MONSTERWEB
var __MWcx = {};
__MWcx.FORMS = false;

//--- PARAMETERS
__MWcx.glob_spin = $('<div id="wg_preload_wrap" class="wg_hidden"><span class="spinner-icon" id="wg_preload_spinner"></span></div>');

//--- __MWcx.glob_spin 
__MWcx.handlers = function() {
    $('body')
        .on('click.btn_result', '.js-btn_result', function(e) {
            e.preventDefault();
            var btn = $(this);
            var form = btn.closest('form')[0];
            __MWcx.glob_spin.removeClass('wg_hidden');
            //--- ajax
            var fd = new FormData(form);
            $.ajax({
                url: __MWcx.base_url + '/result.php',
                data: fd,
                processData: false,
                contentType: false,
                enctype: 'multipart/form-data',
                type: 'POST',
                cache: false,
                success: function(json) {
                    try {
                        var retjson = $.parseJSON(json);
                        if ('error' in retjson) {
                            __MWcx.openModal('error', retjson.error);
                        } else {
                            if ('form_wait_call' in retjson) $("#popap_call").removeClass("active");
                            if ('success_msg' in retjson) __MWcx.openModal('success', retjson.success_msg);
                            if ('redirect' in retjson) window.location.href = retjson.redirect;
                        }
                        //---
                        __MWcx.glob_spin.addClass('wg_hidden');
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        })
        .on('click.add_to_order', '.js-add_to_order', function(e) {
            e.preventDefault();
            var btn = $(this),
                post_data = {};
            var form = btn.parent();
            post_data.new_landing_order_uniq = btn.data('new_landing_order_uniq');
            post_data.desc = form.find('.name').text();
            post_data.old_price = form.find('.price').find('.old').text();
            post_data.new_price = form.find('.price').find('.new').text();
            post_data.good_number = btn.data('good_number');
            __MWcx.glob_spin.removeClass('wg_hidden');
            //--- ajax
            var use_url = __MWcx.MW_URL + '/monsterweb_amo_crm/setHook.php' +
                '?shell_key=' + __MWcx.MW_SHELL_KEY +
                '&hook=hook_moysklad_horoshop_integration.addition_good_to_comment';
            $.ajax({
                type: "POST",
                url: use_url,
                data: post_data,
                cache: false,
                success: function(json) {
                    try {
                        var retjson = $.parseJSON(json);
                        if ('error' in retjson) {
                            switch (retjson.error) {
                                case 'no_order':
                                    {
                                        __MWcx.openModal('error', __MWcx._lang.LANG_ERR_NO_ORDER);
                                    }
                                    break;
                                default:
                                    __MWcx.openModal('error', __MWcx._lang.LANG_ERR_SERVER_ERROR);
                            }
                        } else {
                            __MWcx.openModal('success', __MWcx._lang.LANG_TH_ADDITION_SUCCESS);
                            btn.prop('disabled', true).addClass('wg_disabled');
                        }
                        //---
                        __MWcx.glob_spin.addClass('wg_hidden');
                    } catch (e) {
                        __MWcx.openModal('error', __MWcx._lang.LANG_ERR_SERVER_ERROR);
                    }
                    __MWcx.glob_spin.addClass('wg_hidden');
                },
                error: function() {
                    __MWcx.openModal('error', __MWcx._lang.LANG_ERR_SERVER_ERROR);
                    __MWcx.glob_spin.addClass('wg_hidden');
                }
            });
        });
}
//--- __MWcx.openModal 
__MWcx.openModal = function(theme, txt) {
    __MWcx.msg_modal.removeClass('msg-theme-success msg-theme-error');
    __MWcx.msg_modal.addClass('msg-theme-' + theme);
    __MWcx.msg_modal.find('.js-modal_text').html(txt);
    __MWcx.msg_modal.addClass('active');

}
//--- __MWcx.getUrlVars 
__MWcx.getUrlVars = function() {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}
//--- __MWcx.prepareForms 
__MWcx.prepareForms = function() {
    __MWcx.FORMS = $('.js-handler_form');
    var gets_params = __MWcx.getUrlVars();
    $.each(gets_params, function(index, value) {
        if (index && value != undefined) {
            var html_str = '<input type="hidden" name="' + index + '" value="' + value + '"></input>';
            __MWcx.__expend_forms(html_str);
        }
    });
    //===
    html_str = '<input type="hidden" name="url_page" value="' + window.location.href + '"></input>';
    __MWcx.__expend_forms(html_str);
    html_str = '<input type="hidden" name="g_user_id" value="' + __MWcx.g_user_id + '"></input>';
    __MWcx.__expend_forms(html_str);
    //===
    console.log('__MWcx.client_ip', __MWcx.client_ip);
    jQuery.ajax({
        type: "GET",
        url: "https://api.2ip.ua/geo.xml?ip=" + __MWcx.client_ip,
        success: function(xml) {
            var city = jQuery(xml).find('city_rus').text();
            if (!city) {
                console.log('error', xml);
                city = ''
            }
            var html_str = '<input type="hidden" name="city" value="' + city + '"></input>';
            __MWcx.__expend_forms(html_str);
        },
        error: function() {
            var html_str = '<input type="hidden" name="city" value="не определен"></input>';
            __MWcx.__expend_forms(html_str);
        }
    });
}
//--- __MWcx.__expend_forms 
__MWcx.__expend_forms = function(html_str) {
    if (__MWcx.FORMS) {
        $.each(__MWcx.FORMS, function() {
            $(this).append(html_str);
        });
    }
}



//================

document.addEventListener("DOMContentLoaded", ready);

function ready() {
    let sliderVideo = null;


    let videos = $(".video_source");
    videos.each(function(e) {
        $(this).attr("src", $(this).data("way"));
    })

    function initSlider() {
        var swiperOne = new Swiper('.top-section .tabs-img-wrap', {
            breakpoints: {
                501: {
                    direction: 'vertical',
                    spaceBetween: 15,
                    slidesPerGroup: 1,
                    slidesPerView: "auto",
                    navigation: {
                        nextEl: '.top-section .arrows .prev',
                        prevEl: '.top-section .arrows .next',
                    }
                },
                300: {
                    direction: 'horizontal',
                    spaceBetween: 7,
                    slidesPerGroup: 1,
                    slidesPerView: "auto",
                    navigation: {
                        nextEl: '.top-section .arrows .prev',
                        prevEl: '.top-section .arrows .next',
                    }
                }
            }
        });


        var swiperOne = new Swiper('.sec-form .slider', {
            breakpoints: {
                501: {
                    direction: 'vertical',
                    spaceBetween: 15,
                    slidesPerGroup: 1,
                    // loop: true,
                    slidesPerView: "auto",
                    navigation: {
                        nextEl: '.sec-form .arrows .prev',
                        prevEl: '.sec-form .arrows .next',
                    }
                },
                300: {
                    direction: 'horizontal',
                    spaceBetween: 15,
                    slidesPerGroup: 1,
                    // loop: true,
                    slidesPerView: "auto",
                    navigation: {
                        nextEl: '.sec-form .arrows .prev',
                        prevEl: '.sec-form .arrows .next',
                    }
                }
            }
        });


        var swiperTwo = new Swiper('.sec-style .style-slider-item', {
            spaceBetween: 15,
            slidesPerView: 1,
            navigation: {
                nextEl: '.sec-style .arrows .prev',
                prevEl: '.sec-style .arrows .next',
            },
            pagination: {
                el: '.sec-style .swiper-pagination',
            }
        });
        sliderVideo = swiperTwo;

        let itemsSlider = document.querySelectorAll(".item-color .color-slider");
        itemsSlider.forEach(function(e, i) {
            var swiper = new Swiper('.item-color .color-slider-' + (i) + '', {
                breakpoints: {
                    501: {
                        direction: 'vertical',
                        spaceBetween: 14,
                        slidesPerGroup: 1,
                        slidesPerView: "auto",
                        navigation: {
                            nextEl: '.item-color .color-slider-' + (i) + ' .arrows .prev',
                            prevEl: '.item-color .color-slider-' + (i) + ' .arrows .next'
                        }
                    },
                    300: {
                        direction: 'horizontal',
                        slidesPerGroup: 1,
                        spaceBetween: 10,
                        slidesPerView: 1,
                        navigation: {
                            nextEl: '.item-color .color-slider-' + (i) + ' .arrows .prev',
                            prevEl: '.item-color .color-slider-' + (i) + ' .arrows .next'
                        },
                        pagination: {
                            el: '.item-color .color-slider-' + (i) + ' .swiper-pagination'
                        }
                    }
                }
            });
        })
    }


    loadImg();


    function update() {
        var Now = new Date(),
            Finish = new Date();
        Finish.setHours(23);
        Finish.setMinutes(59);
        Finish.setSeconds(59);
        if (Now.getHours() === 23 && Now.getMinutes() === 59 && Now.getSeconds === 59) {
            Finish.setDate(Finish.getDate() + 1);
        }
        var sec = Math.floor((Finish.getTime() - Now.getTime()) / 1000);
        var hrs = Math.floor(sec / 3600);
        sec -= hrs * 3600;
        var min = Math.floor(sec / 60);
        sec -= min * 60;
        $(".timer .hours").html(pad(hrs));
        $(".timer .minutes").html(pad(min));
        $(".timer .seconds").html(pad(sec));
        setTimeout(update, 200);
    }

    update();


    if ($(".sec-table .content .tabs div").length > 0) {
        $(".sec-table .content .tabs div").on("click",
            function() {
                let name = this.dataset.tab;
                $(".sec-table .content .content-tabs .block-tab").removeClass("active");
                $(".sec-table .content .content-tabs").find(".block-tab[data-tab='" + name + "']").addClass("active");
            }
        )
        $(".sec-table .content .tabs div")[0].click();
    }

    function fireClick(node) {
        $(node).trigger("click");
    }


    $(".sec-colors .item-color-text .btn-color").on("click",
        function() {
            let posForm = null;
            if (window.innerWidth < 768) {
                posForm = $(".sec-form .form-wrap").offset().top - 10;
            } else {
                posForm = $(".sec-form").offset().top;
            }
            if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                $('html').animate({
                    scrollTop: posForm - 20
                }, 1100);
            } else {
                window.scrollTo(0, posForm - 20)
            }


            let color = $(this).data("color");
            $("body").attr("data-colorpage", color);
            let index = $(this).data("num");
            editColorPage(index);
            fireClick($(".sec-form .slider .swiper-slide")[index].querySelector("img"))
        }
    )
    $(".top-section .btn-color").on("click",
        function() {
            let posForm = $(".sec-colors").offset().top;

            if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                $('html').animate({
                    scrollTop: posForm - 20
                }, 1100);
            } else {
                window.scrollTo(0, posForm - 20)
            }

        }
    )
    $(".to-form.btn-color").on("click",
        function() {
            let posForm = null;

            if (window.innerWidth < 768) {
                posForm = $(".sec-form .form-wrap").offset().top - 10;
            } else {
                posForm = $(".sec-form").offset().top;
            }
            if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                $('html').animate({
                    scrollTop: posForm - 20
                }, 1100);
            } else {
                window.scrollTo(0, posForm - 20)
            }
        }
    )
    if ($(".content.mob .tit-tab").length > 0) {
        $(".content.mob .tit-tab").on("click",
            function() {
                $(this).closest(".block-tab").toggleClass("active");
            }
        )
        $(".content.mob .tit-tab")[0].click();
    }

    $(".top-section .right-sec .swiper-slide img").on("click",
        function() {
            let bigImg = $(this).closest(".right-sec").find(".wrap-img img");
            bigImg.attr("src", $(this).data("way"));
            let color = $(this).data("color");
            $("body").attr("data-colorpage", color);
            let index = $(this).closest(".swiper-slide").index();
            editColorPage(index);
            fireClick($(".sec-form .slider .swiper-slide")[index].querySelector("img"))
        }
    )
    $(".sec-form .slider .swiper-slide img").on("click",
        function() {
            let bigImg = $(this).closest(".form_wrap").find(".wrap-img img");
            bigImg.attr("src", $(this).data("way"));
            let color = $(this).data("color");
            $("body").attr("data-colorpage", color);
            let index = $(this).closest(".swiper-slide").index();
            editColorPage(index);
        }
    )
    $(".sec-colors .swiper-slide img").on("click",
        function() {
            let bigImg = $(this).closest(".item-color-img").find(".wrap-img img");
            bigImg.attr("src", $(this).data("way"));
        }
    )
    $(".table-size").on("click",
        function() {
            if (window.innerWidth < 768) {
                $(".popap-table.table").addClass("active");
            }
        }
    )
    $(".popup__toggle").on("click",
        function() {
            $("#popap_call").addClass("active");
        }
    )
    $(".close-popap.table").on("click",
        function() {
            $(".popap-table.table").removeClass("active");
        }
    )
    $(".close-popap.form").on("click",
        function() {
            $(this).closest('.popap-table').removeClass("active");
            // $(".popap-table.form").removeClass("active");
        }
    )


    if ($(".sec-form .field").length > 0) {
        $(".sec-form .field")[0].onchange = function() {
            fireClick($(".sec-form .slider .swiper-slide")[this.value].querySelector("img"))
            fireClick($(".top-section .right-sec .swiper-slide")[this.value].querySelector("img"))
            // edit slider VIDEO
            sliderVideo.destroy();
            var swiperTwo = new Swiper('.sec-style .style-slider-item', {
                spaceBetween: 15,
                slidesPerView: 1,
                initialSlide: this.value,
                navigation: {
                    nextEl: '.sec-style .arrows .prev',
                    prevEl: '.sec-style .arrows .next',
                },
                pagination: {
                    el: '.sec-style .swiper-pagination',
                }
            });
            sliderVideo = swiperTwo;
        }
    }


    function editColorPage(i) {
        let color = $("body").data("colorpage");

        if (i >= 0) {
            // edit slider VIDEO
            sliderVideo.destroy();
            var swiperTwo = new Swiper('.sec-style .style-slider-item', {
                spaceBetween: 15,
                slidesPerView: 1,
                initialSlide: i,
                navigation: {
                    nextEl: '.sec-style .arrows .prev',
                    prevEl: '.sec-style .arrows .next',
                },
                pagination: {
                    el: '.sec-style .swiper-pagination',
                }
            });
            sliderVideo = swiperTwo;
            $(".sec-form label.color select").val(i)
        }
    }

    function loadImg() {

        let imgs = $("img.url-load");
        imgs.each(function(e) {
            $(this).attr("src", $(this).data("way"));
        })
        initSlider();
        initReviews();
    }

    function initReviews() {

        let imgs = $("img.review-load");
        imgs.each(function(e) {
            $(this).attr("src", $(this).data("way"));
        })

        var swiperReviews = new Swiper('.reviews .reviews-list', {
            spaceBetween: 15,
            loop: true,

            slidesPerView: 1,
            loop: true,
            navigation: {
                nextEl: '.reviews .reviews-list_wrap .arrows .prev',
                prevEl: '.reviews .reviews-list_wrap .arrows .next',
            }
        });
    }




    function pad(s) {
        s = ("00" + s).substr(-2);
        return "<span>" + s[0] + "</span><span>" + s[1] + "</span>";
    }


    var url_string = window.location.href
    var url = new URL(url_string);
    var utm = url.searchParams.get("utm_term");
    if (utm) {
        editColorPage(utm);
        fireClick($(".sec-form .slider .swiper-slide")[utm].querySelector("img"))
        fireClick($(".top-section .right-sec .swiper-slide")[utm].querySelector("img"))
    }

    if ($(".inp-phone").length > 0) {
        $(".inp-phone").mask('+38 (999) 99-99-999').on('click', function() {
            $(this).get(0).setSelectionRange(5, 5);
        });
    }

    //=== MONSTERWEB
    __MWcx.msg_modal = $('#msg_modal');
    __MWcx.prepareForms();
    $('body').append(__MWcx.glob_spin);
    __MWcx.handlers();
}