/* Function to search names in the playerlist */
(function($) {
    $.fn.extend({
        filterFor: function(listSelector) {
            var self = this,
                $titles = $(listSelector),
                // The list with keys to skip (esc, arrows, return, etc)
                // 8 is backspace, you might want to remove that for better usability
                keys = [13, 27, 32, 37, 38, 39, 40 /*,8*/ ],
                val;

            if ($titles.length !== 0) {
                if (!$titles.is('ul,ol')){
                    $titles = $titles.find('ul,ol');
                }

                $(this).keyup(function(e) {
                    val = $(self).val().toLowerCase();
                    if (keys.indexOf(e.keyCode) === -1) {
                        $titles.find('li').each(function() {
                            var $node = $(this);

                            if ($node.html().toLowerCase().indexOf(val) === -1) {
                                $node.hide();
                            } else {
                                $node.show();
                            }
                        });
                    }
                });
            }

            return this;
        }
    });
}(jQuery));
