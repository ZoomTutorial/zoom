	$(".list-group-item").hover(function() {
            if (!$(this).hasClass('active')) {
            $(this).addClass('active');  
            } else {
            $(this).removeClass('active');
            $("#demo").collapse("hide");
            }
            console.log("ya");
        })
