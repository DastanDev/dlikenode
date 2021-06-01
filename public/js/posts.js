$(document).ready(function(){		
	javalon.getNewDiscussions(null, null, function (err, res){
		res.forEach(($post, i) => {
			let link = $post.link;console.log(link);let json = $post.json['title'];console.log(json)
			let activeDate = moment.utc($post.ts).fromNow();
			let title =$post.json['title'];let permlink =$post.json['permlink'];
			let category = $post.json['category']; let postCategory = category.toLowerCase();

			let img = $post.json['image'];
			let thumbnail = '<img src="' + img + '" alt="' + title + '" class="card-img-top">';
			let tags=$post.json['tags'];
			let likes = $post.likes;var reward = '0.1';var income=likes*reward;
			//let postTags = metatags.toLowerCase();
			$('#content').append('<div class="col-lg-4 col-md-6 postsMainDiv">\n' +
				'\n' +
				'<article class="post-style-two"><div class="post-contnet-wrap-top">\n' +
				'\n' +
				'<div class="post-footer">\n' +
				'\n' +
				'<div class="post-author-block">\n' +
				'\n' +
				'<div><a href="/profile/' + $post.author + '" target="_blank"><img src="https://steemitimages.com/u/' + $post.author + '/avatar" alt="img" class="img-fluid my_img"></a></div>\n' +
				'\n' +
				'<div class="author-info">\n' +
				'\n' +
				'<h5><a href="/profile/' + $post.author + '" target="_blank">' + $post.author  +'</a><div class="time">' + activeDate + '</div></h5>\n' +
				'\n' +    
				'</div></div>\n' +
				'\n' +
				'<div class="post-comments post-catg"><span class="post-meta"><b>' + category + '</b></span></div>\n' +
				'\n' +
				'</div></div>\n' +
				'\n' +
				'<div class="post-thumb img-fluid"><a href="/post/' + $post.author + '/' + permlink + '">' + thumbnail + '</a></div>\n' + 
				'\n' +
				'<div class="post-contnet-wrap">\n' +
				'\n' +
				'<h4 class="post-title single_title"><a href="/post/' + $post.author + '/' + permlink + '">' + title + '</a></h4>\n' +
				'\n' +
				'<p class="post-entry post-tags">' + tags + '</p>\n' +
				'\n' +
				'<div class="post-comments bottom_block">\n' +
				'<div><img src="./images/dlike-hover.png" alt="DLIKE" class="hov_vote" data-permlink="' + $post.link + '" data-author="' + $post.author + '"> | <span id="post_likes" class="post_likes">' + likes +'</span>LIKES</div>\n' +
				'<div><span class="dlike_tokens">'+income+'</span> <b>DLIKE</b>\n' +
				'</div></div>\n' +
			'</article></div>');
		});
	})


	$('.latest-post-section').on("click", ".hov_vote", function() {
	    var postLink = $(this).attr("data-permlink");var postAuthor = $(this).attr("data-author");
	    $(this).addClass('fas fa-spinner fa-spin like_loader');
	    console.log(postLink);console.log(postAuthor)
	    $.ajax({ type: "POST",url: "/upvote", data: {author: postAuthor, postLink: postLink},
	        success: function(data) {
	        	if (data.error == false) {$('.hov_vote').removeClass('fas fa-spinner fa-spin like_loader');toastr['success']("Upvoted Successfully!");setTimeout(function(){window.location.href = '/';}, 400);
	            } else {$('.hov_vote').removeClass('fas fa-spinner fa-spin like_loader');toastr['error'](data.message);return false}
	        }
	    });
	}); 

})