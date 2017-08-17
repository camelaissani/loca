export default () => {
    return {
        id: 'print',
        params: '/:id/occupants/:ids/:year?/:month?',
        supportView: false,
        restricted: true
    };
};