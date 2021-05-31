
function openNav(){document.getElementById("mySidenav").style.width="250px"}function closeNav(){document.getElementById("mySidenav").style.width="0"}function popup(e){var n=(screen.width-700)/2,t="width=700, height=400";return t+=", top="+(screen.height-400)/2+", left="+n,t+=", directories=no",t+=", location=no",t+=", menubar=no",t+=", resizable=no",t+=", scrollbars=no",t+=", status=no",t+=", toolbar=no",newwin=window.open(e,"windowname5",t),window.focus&&newwin.focus(),!1}


$('#logout_btn').click(function(){
	$.ajax({
        type: 'POST',
        data: JSON.stringify({}),
        contentType: 'application/json',
        url: '/logout',            
        success: function(data) {if (data.error == false);toastr['success']("Logout Success");setTimeout(function(){window.location.href = '/';}, 300);}
    });
})


function getCookie(name) {
    // Split cookie string and get all individual name=value pairs in an array
    var cookieArr = document.cookie.split(";");
    
    // Loop through the array elements
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        
        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if(name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    
    // Return null if not found
    return null;
}
var dlike_user_img = 'https://i.postimg.cc/rwbTkssy/dlike-user-profile.png';
console.log(getCookie("dlike_username"))
var Username = getCookie("dlike_username");
if(Username != "") {console.log(Username); 
	var dlike_username  = Username;$("#user_img").attr("src", dlike_user_img).show();$("#logout_btn").show();
} else {console.log('not a user')}

