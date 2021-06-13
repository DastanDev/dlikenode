$(document).ready(function(){
javalon.getVotesByAccount(profileName, 0, (err, votes) => {	
votes.forEach(($vote, i) => {let authit=$vote.author;let linkit=$vote.link;
	javalon.getContent(authit, linkit, function (err, res){
			let link = res.link;
			let activeDate = moment.utc(res.ts).fromNow();
			let title =res.json['title'];let permlink =res.json['permlink'];
			let category = res.json['category']; let postCategory= category.charAt(0).toUpperCase() + category.slice(1);

			let img = res.json['image'];
			let thumbnail = '<img src="' + img + '" alt="' + title + '" class="card-img-top">';
			let ptags=res.json['tags'];let metatags = ptags.map(function (meta) { if (meta) return '<a href="/tags/' + meta + '">#' + meta + '</a>'});
			let likes = res.likes;var reward = '0.1';var income=likes*reward;
			let tags=metatags.toString().replace(/,/g, "");
			$('#likesContent').append('<div class="col-lg-4 col-md-6 postsMainDiv">\n' +
				'\n' +
				'<article class="post-style-two"><div class="post-contnet-wrap-top">\n' +
				'\n' +
				'<div class="post-footer">\n' +
				'\n' +
				'<div class="post-author-block">\n' +
				'\n' +
				'<div><a href="/profile/' + res.author + '" target="_blank"><img src="https://steemitimages.com/u/' + res.author + '/avatar" alt="img" class="img-fluid my_img"></a></div>\n' +
				'\n' +
				'<div class="author-info">\n' +
				'\n' +
				'<h5><a href="/profile/' + res.author + '" target="_blank">' + res.author  +'</a><div class="time">' + activeDate + '</div></h5>\n' +
				'\n' +    
				'</div></div>\n' +
				'\n' +
				'<div class="post-comments post-catg"><span class="post-meta"><b><a href="/category/' + category + '">' + postCategory + '</a></b></span></div>\n' +
				'\n' +
				'</div></div>\n' +
				'\n' +
				'<div class="post-thumb img-fluid"><a href="/post/' + res.author + '/' + link + '">' + thumbnail + '</a></div>\n' + 
				'\n' +
				'<div class="post-contnet-wrap">\n' +
				'\n' +
				'<h4 class="post-title single_title"><a href="/post/' + res.author + '/' + link + '">' + title + '</a></h4>\n' +
				'\n' +
				'<p class="post-entry post-tags">' + tags + '</p>\n' +
				'\n' +
				'<div class="post-comments bottom_block">\n' +
				'<div><img src="/images/dlike-hover.png" alt="DLIKE" class="hov_vote" data-permlink="' + res.link + '" data-author="' + res.author + '"> | <span id="post_likes" class="post_likes">' + likes +'</span>LIKES</div>\n' +
				'<div><span class="dlike_tokens">'+income+'</span> <b>DLIKE</b>\n' +
				'</div></div>\n' +
			'</article></div>');
		//});
	})
 
}) })
})