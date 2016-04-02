LOCA.layoutManager = (function($){
    // -----------------------------------------------------------------------
    // PRIVATE ATTRIBUTES
    // -----------------------------------------------------------------------
    var self;
    var TRANSITION_DURATION_MENU = 200;


    // -----------------------------------------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------------------------------------
    function Layout() {
        this.mainMenuCardVisible = false;
        this.mainMenuCardWidth = $('.main-menu-card').css('width');

        $(document).on('click', '.main-menu-button', function() {
            var actionId = $(this).data('id');

            if (actionId === 'show-main-card') {
                if (self.mainMenuCardVisible) {
                    self.showHideMainMenuCard(false);
                }
                else {
                    self.showHideMainMenuCard(true);
                }
            }

            return false;
        });

        $(document).mouseup(function (e) {
            var $mainMenuCard,
                $mainMenuButton;

            if (self.mainMenuCardVisible) {
                $mainMenuCard = $('.main-menu-card');
                $mainMenuButton = $('.main-menu-button');
                if (!$mainMenuButton.is(e.target) &&
                    $mainMenuButton.has(e.target).length === 0 &&
                    !$mainMenuCard.is(e.target) ){
                    self.showHideMainMenuCard(false);
                }
            }
        });
    }

    // -----------------------------------------------------------------------
    // PUBLIC METHODS
    // -----------------------------------------------------------------------
    Layout.prototype.showHideMainMenuCard = function(show) {
        if (!show && this.mainMenuCardVisible) {
            $('.main-menu-button').velocity('reverse');
            $('.main-menu-card').velocity('reverse');
            this.mainMenuCardVisible = false;
        }
        else if (show) {
            $('.main-menu-button').velocity({
                translateX: '-13px'
            });
            $('.main-menu-card').velocity({
                translateX: this.mainMenuCardWidth
            });
            this.mainMenuCardVisible = true;
        }
    };

    Layout.prototype.isMenuVisible = function (dataId) {
        dataId = dataId.startsWith('#')?dataId.slice(1, dataId.length):dataId;
        return $('.menu-card[data-id="' + dataId + '"]').hasClass('active');
    };

    Layout.prototype.showMenu = function (dataId, callback) {
        var $cardToSelect;

        dataId = dataId.startsWith('#')?dataId.slice(1, dataId.length):dataId;
        $cardToSelect = $('.menu-card[data-id="' + dataId + '"]:hidden');

        if ($cardToSelect.length > 0) {
            this.hideMenu(function () {
                $cardToSelect.addClass('active').velocity('transition.bounceRightIn', {duration: TRANSITION_DURATION_MENU, complete: function () {
                    if (callback) {
                        callback();
                    }
                }});
            });
        } else {
            if (callback) {
                callback();
            }
        }
    };

    Layout.prototype.hideMenu = function(callback) {
        var $activeCard = $('.menu-card.active').not(':hidden');

        if ($activeCard.length > 0) {
            $activeCard.removeClass('active');
            $activeCard.velocity('transition.bounceRightOut', {duration: TRANSITION_DURATION_MENU, complete: function() {
                if (callback) {
                    callback();
                }
            }});
        } else {
            if (callback) {
                callback();
            }
        }
    };

    Layout.prototype.showSheet = function(dataId) {
        dataId = dataId.startsWith('#')?dataId.slice(1, dataId.length):dataId;
        this.hideSheet();
        $('.sheet[data-id="'+dataId+'"]').addClass('active').show();
    };

    Layout.prototype.hideSheet = function() {
        $('.sheet.active').removeClass('active').hide();
    };
    self = new Layout();
    return self;
})(window.$);
