
$(function () {

    var node = $('<input id="movielens_refresh" type="button" value="Refresh" style="position: absolute;z-index: 10000;right: 10px;top: 10px;"/>  ').click(refresh);
    $("body").prepend(node);

    var credentials = {
        password: "vertica",
        userName: "cth@vertica.dk"
    }
    $.ajax({
        type: "POST",
        url: "https://movielens.org/api/sessions",
        data: JSON.stringify(credentials),
        contentType: "application/json;charset=UTF-8"
    })
        .done(function (a, b, c) {


            refresh();


        });


    $(window).scroll(function () {
        refresh();

    });

});


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
                //prediction = parseFloat(result.movieUserData.prediction).toFixed(1),
                prediction = result.movieUserData.prediction,
                rating = result.movieUserData.rating ? result.movieUserData.rating : '-';

            //msg+= " SearchHit:" + result.movie.title + ": " +  prediction + " Rating:" +rating ;

            insertInDom($element, prediction, result.movieUserData.rating, result.movieId);


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

function insertInDom($element, prediction, rating, movieId) {
    var anchor = $element.closest('.labels > div:first-child');
    var starsElement = anchor.find(".movielens_stars");
    if (!starsElement.length) {
        anchor.append("<div class=\"movielens_box\"><div class=\"movielens_stars\"></div></div> ");
        starsElement = anchor.find(".movielens_stars");
    }

    var halfStarCount = Math.round(prediction * 2);

    var isRated = Math.round(rating * 2);

    for (var i = 0; i < 10; i++) {

        var cls;
        if (isRated) 
            cls = i < isRated ? 'rating' : 'empty';
        else 
            cls = i < halfStarCount ? 'prediction' : 'empty';
        

        var half = i % 2 == 1 ? ' right-half' : '';
        //var starsHtml = '<span class="movielens_star ' + cls + half + ' "></span>';
        var node = $('<span data-movie-id="' + movieId + '" data-predicted-rating="' + prediction + '" data-number="' + (i + 1) + '" class="movielens_star ' + cls + half + ' "></span>').click(starClick);
        starsElement.append(node);
    }

    //starsElement.html(starsHtml);
}

function refresh() {
    var titles = findTitles();
    for (var i = 0; i < titles.length; i++) {

        var t = titles[i].title;
        var $element = titles[i].element;

        var req = findRating(t, $element);
    }
}

function clearCache() {
    titlesProcessed = {};
}

function starClick(event) {
    var starNumber = $(this).data('number');
    var movieId = $(this).data('movie-id'),
        predictedRating = $(this).data('predicted-rating'),
        rating = starNumber / 2;

    console.log('click', movieId, rating);

    var data = {
        movieId: movieId,
        predictedRating: predictedRating,
        rating: rating
    }

    $.ajax({
        type: "POST",
        url: "https://movielens.org/api/users/me/ratings",
        data: JSON.stringify(data),
        contentType: "application/json;charset=UTF-8"
    })
    .done(function (a, b, c) {

        clearCache();
        refresh();


    });
}
