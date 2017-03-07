export default function(contract, rentDate, previousRent, settlements, rent) {
    rent.balance = 0;
    if (previousRent) {
        rent.balance = previousRent.total.grandTotal - previousRent.total.payment;
    }
    return rent;
}
