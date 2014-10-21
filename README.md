= Hashtag js finder

== Usage

    <script src="//code.jquery.com/jquery-1.10.2.js"></script>

    <script type="text/javascript">
      var __ht = {};
      __ht.api_key = "some_api_key";

      (function() {
        var lc = document.createElement('script'); lc.type = 'text/javascript'; lc.async = true;
        lc.src = 'hashtag.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
      })();
    </script>