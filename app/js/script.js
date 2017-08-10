
$(document).ready(function() {

  var Cookie = tough.Cookie;
  var cookie = Cookie.parse(header);
  cookie.value = 'somethingdifferent';
  header = cookie.toString();

  var cookiejar = new tough.CookieJar();
  cookiejar.setCookie(cookie, 'http://currentdomain.example.com/path', cb);
  cookiejar.getCookies('http://example.com/otherpath',function(err,cookies) {
    res.headers['cookie'] = cookies.join('; ');
  });

}



