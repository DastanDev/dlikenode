function openNav(){document.getElementById("mySidenav").style.width="250px"}function closeNav(){document.getElementById("mySidenav").style.width="0"}function popup(e){var n=(screen.width-700)/2,t="width=700, height=400";return t+=", top="+(screen.height-400)/2+", left="+n,t+=", directories=no",t+=", location=no",t+=", menubar=no",t+=", resizable=no",t+=", scrollbars=no",t+=", status=no",t+=", toolbar=no",newwin=window.open(e,"windowname5",t),window.focus&&newwin.focus(),!1}

$('#logout_btn').click(function(){
	$.ajax({type: 'POST',data: JSON.stringify({}),contentType: 'application/json',url: '/logout',            
        success: function(data) {if (data.error == false);toastr['success']("Logout Success");setTimeout(function(){window.location.href = '/';}, 300);}
    });
})


function getCookie(name) {var cookieArr = document.cookie.split(";");
    for(var i = 0; i < cookieArr.length; i++) {var cookiePair = cookieArr[i].split("=");
        if(name == cookiePair[0].trim()) {return decodeURIComponent(cookiePair[1]);}
    }
    return null;
}
var dlike_user_img = 'https://i.postimg.cc/rwbTkssy/dlike-user-profile.png';
var Username = getCookie("dlike_username");
if(Username !== "") {console.log(Username); var dlike_username  = Username;$("#user_img").attr("src", dlike_user_img).show();$("#logout_btn").show();} else {console.log('not a valid user')}


$('.signin_btn').click(function() {signinNOw();})
function accountKeys() {
    var signup_block  = document.querySelector('.signup_section');
    var key_section = document.querySelector('.key_section');
    jQuery(signup_block).animate({
        opacity: 0,
        top    : -20
    }, 300, function () {
        signup_block.style.display = 'none';
        key_section.style.opacity = 0;
        key_section.style.display = '';
        jQuery(key_section).animate({
            opacity: 1,
            top    : 0
        }, 300);
    });
}

$('.copy_pass').click(function() {
    var copyText = document.getElementById("acct_priv_key");
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand("copy");$('.copy_pass').html('Copied!');
    toastr['success']("Key copied to clipboard.");return false;
})



$('.loginNow_btn').click(function() {loginNOw();});
$('.register_btn').click(function() {registerNow();});

function registerNow() {
    var main_login_block  = document.querySelector('.login_section');
    var signup_block = document.querySelector('.signup_section');
    jQuery(main_login_block).animate({
        opacity: 0,
        top    : -20
    }, 300, function () {
        main_login_block.style.display = 'none';
        signup_block.style.opacity = 0;
        signup_block.style.display = '';
        jQuery(signup_block).animate({
            opacity: 1,
            top    : 0
        }, 300);
    });
}

function loginNOw() {
    var main_login_block  = document.querySelector('.login_section');
    var signup_block = document.querySelector('.signup_section');
    jQuery(signup_block).animate({
        opacity: 0,
        top    : -20
    }, 300, function () {
        signup_block.style.display = 'none';
        main_login_block.style.opacity = 0;
        main_login_block.style.display = '';
        jQuery(main_login_block).animate({
            opacity: 1,
            top    : 0
        }, 300);
    });
}

function signinNOw() {
    var keys_block  = document.querySelector('.key_section');
    var login_block = document.querySelector('.login_section');
    jQuery(keys_block).animate({
        opacity: 0,
        top    : -20
    }, 300, function () {
        keys_block.style.display = 'none';
        login_block.style.opacity = 0;
        login_block.style.display = '';
        jQuery(login_block).animate({
            opacity: 1,
            top    : 0
        }, 300);
    });
}

$('.login_btn').click(function() {
    $(".login_btn").attr("disabled", true);
    let login_user = $('#login_user_id').val();let login_pass = $('#login_pass').val();
    if (login_user=="") {toastr.error('phew.. Username should not be empty');$(".login_btn").attr("disabled", false);return false;}
    if (login_pass=="") {toastr.error('phew... Private key should not be empty');$(".login_btn").attr("disabled", false);return false;}
    javalon.getAccount(login_user, function(error, account) {const pivkey = login_pass;
        if (!account || account.length === 0) {
            toastr.error('phew.. Username does not exist');$(".login_btn").attr("disabled", false);
            return
        }
        if (javalon.privToPub(pivkey) !== account.pub) {
            toastr.error('phew.. Private key does not match for account @'+login_user);$(".login_btn").attr("disabled", false);
            return
        }
        $.ajax({type: 'POST',data: JSON.stringify({ pivkey: pivkey,  username: login_user}),contentType: 'application/json',url: '/loginuser',            
            success: function(data) {
                if (data.error == true) {toastr['error']("Login Fail");$(".login_btn").attr("disabled", false);return false;
                } else {toastr['success']("Login Success");setTimeout(function(){window.location.href = '/';}, 300);}
            }
        });
    })

});

$('.signup_btn').click(function() {
    let input_username = $('#user_name').val();
    if (input_username=="") {toastr.error('phew.. Username should not be empty');return false;}
    $('.signup_txt').html('Creating...'); $('.signup_btn').attr("disabled", true); 
    javalon.getAccounts([input_username], function(error, accounts) {
        if (!accounts || accounts.length === 0) {
            var key=javalon.keypair(); var pub=key.pub;var priv=key.priv;
            $.ajax({type: 'POST',data: JSON.stringify({name: input_username,pub: pub,ref: 'dlike'}),contentType: 'application/json',url: '/signup',            
                success: function(data) {console.log(data)
                    if (data.error == true) {toastr['error'](data.message);$('.signup_btn').attr("disabled", false);return false;
                    } else {toastr['success']("Account cteared Successfully!");accountKeys();$('#acct_priv_key').val(priv);}
                }
            });
            
        } else {
            toastr.error('phew.. Username already exist');$('.signup_txt').html('Signup'); $('.signup_btn').attr("disabled", false); return false;
        }
    })
});   



$('.share_me').click(function() {
    if (dlike_username != null) {$('#share_plus').hide();$('.share_loader').show();
        let input_url = $("#url_field").val();
        if (input_url == ''){ $("#url_field").css("border-color", "RED");toastr.error('phew... You forgot to enter URL');$('#share_plus').show();$('.share_loader').hide();return false;}
        let verifyUrl = getDomain(input_url);
        var sites = ["dlike.io", "wikipedia.org","facebook.com","youtube.com", "pinterest.com","twitter.com","bloomberg.com","youtu.be","pornhub.com","imgur.com","amazon.com","imgbb.com","freepik.com"];
        if(sites.includes(verifyUrl)){toastr.error('Sharing from this URL is not allowed');return false;}
        if (isValidURL(input_url)) {
            $.ajax({url: '/share',type: 'POST',data: JSON.stringify({ url: input_url }),contentType: 'application/json',
                success: function(data)  {
                    let title=data.title;let image=data.image;let description=data.description;let url="input_url";
                    if(title !=''){
                        $('.share_link').hide();$('.edit_psot').show();
                        $('.data-title').html(title);$(".link_image").attr("src", image);$('#domain_name').html(verifyUrl);$('#post_desc').html(description);$('.url_link').val(input_url)}
                    else{toastr.error('Unable to share link'); return false; }
                }
            });
        } else {toastr.error('phew... URL is not Valid');}
    } else { toastr.error('hmm... You must be login!'); return false; }
});


$('.dlike_share_post').click(function(clickEvent) {
        let urlInput = $('.url_link').val();
        if($('.dlike_cat').val() == "0") {$('.dlike_cat').css("border-color", "RED");toastr.error('Please Select an appropriate Category');return false;}
        var tags = $('.dlike_tags').val();let newtags = $.trim(tags).split(' ');
        if (newtags.length < 2) {$('.tags').css("border-color", "RED");toastr.error('Please add at least two related tags');return false;}
        var allowed_tags_type = /^[a-z\d\s]+$/i;
        if (!allowed_tags_type.test(tags)) {$('.tags').css("border-color", "RED");toastr.error('Only alphanumeric tags, no Characters.');return false;}
        var description = $('textarea#post_desc').val();
        var post_description = $.trim(description).split(' ');console.log(post_description.length)
        if (post_description.length < 10) {$('.data-desc').css("border-color", "RED");toastr.error('Please add description of minimum 30 words');return false;}
        if (post_description.length > 82) {$('.data-desc').css("border-color", "RED");toastr.error('Please add description not more than 80 words');return false;}
        var title = $('.data-title').html();
        if (title=="") {toastr.error('Some error in this link!');return false;}
        var tags = $('.dlike_tags').val();console.log(tags)
        var post_tags = $.trim(tags).replace(/\s+/g, ' ');console.log(post_tags)
        var post_body = description.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
        var urlImage =  $('.post_img img').attr('src');
        var post_category = $( ".dlike_cat option:selected" ).text();
        $(".dlike_share_post").attr("disabled", true);$('.dlike_share_post').html('Publishing...');
        $.ajax({type: "POST",url: "/post",data: {title: title,tags:post_tags,description:post_body,category: post_category,image:urlImage,exturl:urlInput},
            success: function(data) {console.log(data)
                if (data.error == false) {toastr['success']("Link Shared Successfully!");setTimeout(function(){window.location.href = '/';}, 400);
                } else {toastr['error']("Unable to share link");return false}
            },
        });
})

function isValidURL(url) {
    var RegExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if (RegExp.test(url)) {return true;} else {toastr.error('phew... Enter a valid url');return false;}
}
function getDomain(url) {let hostName = getHostName(url);let domain = hostName;
    if (hostName != null) {
        let parts = hostName.split('.').reverse();
        if (parts != null && parts.length > 1) {
            domain = parts[1] + '.' + parts[0];
            if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) { domain = parts[2] + '.' + domain;}
        }
    }
    return domain;
}
function getHostName(url) {var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
    } else {return false;}
}