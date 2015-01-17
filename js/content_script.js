function findTitles() {
    return $(".item .line-clamp").map(function() {
        return {
            title: $(this).text(),
            element: $(this)
        };
    }).get();

}

//TODO: gem i localstorage eller ligende
var titlesProcessed = {};


function findRating(titleString, $element) {
    var title = $.trim(titleString);
    if (!title)
        return;

    if (titlesProcessed[title]) {
        //console.log('cache hit: ' + title)
        return;
    } else {
        //console.log('cache miss: ' + title)
        titlesProcessed[title] = 1;

    }

    var req = $.ajax({
        type: "GET",
        // url: "https://movielens.org/explore?q="+ title, //  &minYear=2001&maxYear=2001",
        url: "https://movielens.org/api/movies/explore?q=" + title,

        contentType: "application/json;charset=UTF-8"
    });


    req.done(function(response, b, c) {
        //console.log('findRatings() response: ',response);
        //var msg="<b>" + title + "</b>";
        if (response && response.data && response.data.searchResults && response.data.searchResults.length > 0) {

            //TODO: check at titel er det samme som [0]

            var result = response.data.searchResults[0],
                prediction = parseFloat(result.movieUserData.prediction).toFixed(1),
                rating = result.movieUserData.rating ? result.movieUserData.rating : '-';

            //msg+= " SearchHit:" + result.movie.title + ": " +  prediction + " Rating:" +rating ;

            var item = $element.parent().find(".movielens_item");
            if (!item.length) {
                $element.parent().prepend("<span class=\"movielens_item\">init</span> ");
                item = $element.parent().find(".movielens_item");
            }

            item.text(prediction + "/" + rating);


            console.log(title, prediction, rating)
        } else {
            // no hit
            console.log('! title not found', title);

            //$element.before('n/a ');
        }
        //$( "body" ).prepend( msg + "<br>");

    });

    return req;
}

function refresh() {
    var titles = findTitles();
    var maxToGet = 10000;

    for (var i = 0; i < titles.length; i++) {

        var t = titles[i].title;
        var $element = titles[i].element;

        var req = findRating(t, $element);

        // req.done(function( response,b,c) {
        // if(response && response.data && response.data.searchResults && response.data.searchResults.length>0){
        // var result = response.data.searchResults[0];
        // if(result){
        // $element.append("<hr> " + result.movieUserData.prediction + "/" + result.movieUserData.rating);
        // }
        // }
        // });			


        if (i == maxToGet)
            return;
    }
}

$(function() {

    //console.log('init')
    //$( "body" ).prepend( "<input id="movielens_refresh" type=\"button\" value=\"Refresh\" onclick=\"refresh()\" style=\"position: absolute;z-index: 10000;right: 10px;top: 10px;\" />  ");
    var node = $('<input id="movielens_refresh" type="button" value="Refresh" onclick="refresh()" style="position: absolute;z-index: 10000;right: 10px;top: 10px;"/>  ').click(refresh);
    $("body").prepend(node);

    var o = {
        password: "vertica",
        userName: "cth@vertica.dk"
    }
    $.ajax({
            type: "POST",
            url: "https://movielens.org/api/sessions",
            data: JSON.stringify(o),
            contentType: "application/json;charset=UTF-8"
        })
        .done(function(a, b, c) {


            refresh();


        });


    localStorage.setItem("acceptCookies", "yes")

    $(window).scroll(function() {
        refresh();

    });
    // document.getElementById('clickMe').addEventListener('click', function() {
    // // do stuff
    // });




});