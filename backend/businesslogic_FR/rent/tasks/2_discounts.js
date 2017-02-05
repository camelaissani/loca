export default function(contract, beginDate, includedEndDate, payments, previousRent, rent) {
    rent.discounts.descriptions.push('Remise exceptionnelle');
    rent.discounts.amounts.push(contract.discount);

    if (payments && payments.discounts) {
        payments.discounts.forEach(discount => {
            rent.discounts.descriptions(discount.description);
            rent.discounts.descriptions(discount.amount);
        });
    }
    return rent;
}
