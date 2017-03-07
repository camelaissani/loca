export default function(contract, rentDate, previousRent, settlements, rent) {
    rent.discounts.push({
        description: 'Remise exceptionnelle',
        amount: contract.discount
    });

    if (settlements && settlements.discounts) {
        settlements.discounts.forEach(discount => {
            rent.discounts.push({
                description: discount.description,
                amount: discount.amount
            });
        });
    }
    return rent;
}
