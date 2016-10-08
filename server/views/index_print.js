import main from './application/main';
import printCtrl from './printable/printctrl';

document.addEventListener('applicationReady', function(/*event*/) {
    printCtrl.applicationReady();
});

main();

