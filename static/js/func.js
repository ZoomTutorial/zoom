	// hovering over dividers n content.ejs
	$(".list-group-item").hover(function() {
            if (!$(this).hasClass('active')) {
            $(this).addClass('active');  
            } else {
            $(this).removeClass('active')
	    };
	})


	$(".navbar-collapse").hover(function() {
		if (!$(this).hasClass('active')) {
            $(this).addClass('active');  
            } else {
            $(this).removeClass('active');
        }
	})

