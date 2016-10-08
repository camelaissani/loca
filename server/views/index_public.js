import main from './application/main';
import websiteCtrl from './website/websitectrl';

document.addEventListener('applicationReady', function(/*event*/) {
    websiteCtrl.applicationReady();
});

main();
