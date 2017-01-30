import main from '../lib/main';
import printCtrl from './printable/printctrl';

document.addEventListener('applicationReady', function(/*event*/) {
    printCtrl.applicationReady();
});

main();

