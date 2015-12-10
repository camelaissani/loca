module.exports = {
    productive: true,
    demomode: process.env.SELFHOSTED_DEMOMODE,
    database: process.env.SELFHOSTED_DBNAME || 'demodb',
    website: {
        company: {name: '', website: ''},
        product: {
            name: 'Loca',
            slogan: 'Outil gratuit pour la gestion de vos biens immobiliers',
            website: 'http://localhost:8081/',
            imageUrl: 'http://localhost:8081/public/images/1.jpg'
        },
        contact: {
            phone: '01.99.99.99.99',
            email: 'camel.aissani@nuageprive.fr',
            address: {
                street1: '',
                street2: '',
                zipCode: '',
                city: ''
            }
        },
        metatags: {
            type: 'website',
            title: 'Logiciel gratuit de gestion immobilière',
            description: '',
            keywords: 'Logiciel gratuit, Gestion immobilière, gérer ses biens en ligne, gestion des loyers, quittances, avis d\'écheance',
            location: 'Ile de France',
            rating: 'General',
            author: {name: 'Camel Aissani', twitter: '@camelaissani'}
        },
        author: {
            name: 'Camel Aissani',
            website: 'http://www.nuageprive.fr',
            twitter: {url: 'https://twitter.com/camelaissani', id: '@camelaissani'},
            github: {url: 'https://github.com/camelaissani', id: 'camelaissani'}
        }
    }
};
