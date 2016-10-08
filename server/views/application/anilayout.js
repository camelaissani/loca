import $ from 'jquery';

let anilayout;

const TRANSITION_DURATION_MENU = 200;

class Anilayout {
    // -----------------------------------------------------------------------
    // PRIVATE ATTRIBUTES
    // -----------------------------------------------------------------------


    // -----------------------------------------------------------------------
    // CONSTRUCTOR
    // -----------------------------------------------------------------------
    constructor() {
        const self = this;

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
    showHideMainMenuCard(show) {
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
    }

    isMenuVisible(dataId) {
        dataId = dataId.startsWith('#')?dataId.slice(1, dataId.length):dataId;
        return $('.menu-card[data-id="' + dataId + '"]').hasClass('active');
    }

    showMenu(dataId, callback) {
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
    }

    hideMenu(callback) {
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
    }

    showSheet(dataId) {
        dataId = dataId.startsWith('#')?dataId.slice(1, dataId.length):dataId;
        this.hideSheet();
        $('.sheet[data-id="'+dataId+'"]').addClass('active').show();
    }

    hideSheet() {
        $('.sheet.active').removeClass('active').hide();
    }
}

if (!anilayout) {
    anilayout = new Anilayout();
}

export default anilayout;
