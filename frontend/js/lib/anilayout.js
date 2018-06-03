import $ from 'jquery';

const TRANSITION_DURATION_MENU = 200;

class Anilayout {
    isMenuVisible(dataId) {
        dataId = dataId.startsWith('#')?dataId.slice(1, dataId.length):dataId;
        return $('.js-side-menu[data-id="' + dataId + '"]').hasClass('active');
    }

    showMenu(dataId, callback) {
        var $cardToSelect;

        function callbackEx() {
            if (callback) {
                callback();
            }
        }

        dataId = dataId.startsWith('#')?dataId.slice(1, dataId.length):dataId;
        $cardToSelect = $('.js-side-menu[data-id="' + dataId + '"]:hidden');

        if ($cardToSelect.length > 0) {
            this.hideMenu(function () {
                $cardToSelect.trigger('before-show-card');
                $cardToSelect.addClass('active').velocity('transition.bounceRightIn', {duration: TRANSITION_DURATION_MENU, complete: function () {
                    callbackEx();
                    $cardToSelect.trigger('after-show-card');
                }});
            });
        } else {
            callbackEx();
        }
    }

    hideMenu(callback) {
        var $activeCard = $('.js-side-menu.active').not(':hidden');

        function callbackEx() {
            if (callback) {
                callback();
            }
        }

        if ($activeCard.length > 0) {
            $activeCard.trigger('before-hide-card');
            $activeCard.removeClass('active');
            $activeCard.velocity('transition.bounceRightOut', {duration: TRANSITION_DURATION_MENU, complete: function() {
                callbackEx();
                $activeCard.trigger('after-hide-card');
            }});
        } else {
            callbackEx();
        }
    }

    showSheet(dataId) {
        dataId = dataId.startsWith('#')?dataId.slice(1, dataId.length):dataId;
        this.hideSheet();
        $('.js-sheet[data-id="'+dataId+'"]').addClass('active').show();
    }

    hideSheet() {
        $('.js-sheet.active').removeClass('active').hide();
    }
}

export default new Anilayout();
