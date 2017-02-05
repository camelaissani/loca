export default function(contract, beginDate, includedEndDate, payments, previousRent, rent) {
    rent.balance = 0;
    if (previousRent) {
        rent.balance = previousRent.total.grandTotal - previousRent.total.paymentAmount;
    }
    return rent;
}
