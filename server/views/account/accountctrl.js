import ViewController from '../application/_viewcontroller';

class AccountCtrl extends ViewController {

    constructor() {
        super({
            domViewId: '#view-account'
        });
    }
}

export default new AccountCtrl();
