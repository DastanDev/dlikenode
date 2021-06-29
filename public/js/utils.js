function getCookie(name) {var cookieArr = document.cookie.split(";");for(var i = 0; i < cookieArr.length; i++) {var cookiePair = cookieArr[i].split("="); if(name == cookiePair[0].trim()) {return decodeURIComponent(cookiePair[1]);} }
    return null;
}
var dlike_username=getCookie("dlike_username");console.log(dlike_username);

if(dlike_username) {
    breej.getAccount(dlike_username, (err, account) => {
        if(account && account.json.profile.cover_image){var prof_cov_img=account.json.profile.cover_image;}else{ var prof_cov_img=""}
        if(account && account.json.profile.avatar){var dlike_user_img=account.json.profile.avatar;}else{var dlike_user_img="https://i.postimg.cc/rwbTkssy/dlike-user-profile.png"}
        if(account && account.json.profile.location){var user_location=account.json.profile.location;}else{var user_location=""}
        if(account && account.json.profile.website){var user_website=account.json.profile.website;}else{var user_website=""}
        if(account && account.json.profile.about){var user_about=account.json.profile.about;}else{var user_about=""}
        $('#profile_img').val(dlike_user_img);$('#cover_img').val(prof_cov_img);$('#profile_location').val(user_location);$('#profile_website').val(user_website);$('#profile_about').val(user_about);
    })
}

$('.btn_follow_user').click(function() {
    if (dlike_username) {var followName = $(this).attr("data-username");$(".btn_follow_user").html('Following...'); $('.btn_follow_user').attr("disabled", true);
        $.ajax({url: '/follow',type: 'POST',data: JSON.stringify({ followName: followName }),contentType: 'application/json',success: function(data)  {if (data.error == false) {toastr['success']("Followed Successfully!");setTimeout(function(){window.location.reload();}, 300); } else {toastr['error'](data.message);$(".btn_txt_follow").html('Follow');$('.btn_follow_user').attr("disabled", false);return false} } });
    } else { toastr.error('hmm... You must be login!'); return false; }
});

$('.btn_unfollow_user').click(function() {
    if (dlike_username) {var unfollowName = $(this).attr("data-username");$(".btn_unfollow_user").html('UNFollowing...'); $('.btn_unfollow_user').attr("disabled", true);
        $.ajax({url: '/unfollow',type: 'POST',data: JSON.stringify({ unfollowName: unfollowName }),contentType: 'application/json',success: function(data)  {if (data.error == false) {toastr['success']("UNFollowed Successfully!");setTimeout(function(){window.location.reload();}, 300); } else {toastr['error'](data.message);$(".btn_txt_unfollow").html('Following');$('.btn_unfollow_user').attr("disabled", false);return false} } });
    } else { toastr.error('hmm... You must be login!'); return false; }
});

$(".back_btn").click(function (){window.history.back();});