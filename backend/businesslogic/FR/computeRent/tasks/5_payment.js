export default function(contract, rentDate, previousRent, settlements, rent) {
    if (settlements && settlements.discounts) {
        settlements.payments.forEach(payment => {
            rent.payments.push(payment);
        });
    }
    return rent;
}
