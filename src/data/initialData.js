/**
 * Initial state derived from provided files, updated for multi-line support
 */
export const INITIAL_DATA = {
    issuer: {
        nombre: "PEDRO ANTONIO BENITO ROJANO",
        direccion: "AV. JENOFONTE 3 10 2",
        cp: "29010",
        ciudad: "MALAGA",
        provincia: "MALAGA",
        nif: "77186809M",
        accounts: [
            { id: 'impacthub', name: 'Impact Hub', iban: 'ES86 0049 4394 2722 1006 5106' },
            { id: 'autonomo', name: 'Autónomo', iban: 'ES94 0049 4596 9123 1004 8347' },
            { id: '6grados', name: '6 Grados', iban: 'ES31 0049 4596 9022 1007 9196' }
        ]
    },
    recipients: [
        {
            id: 'hub-malaga',
            name: 'HUB DE IMPACTO MÁLAGA, S.L.',
            cif: 'B86905502',
            address: 'Callejones del Perchel 8, 29002, Málaga',
            city: 'Málaga',
            cp: '29002',
            province: 'Málaga',
            isFavorite: true
        },
        {
            id: 'flexwork',
            name: 'FLEXWORK SPACES SL.',
            cif: 'B93612844',
            address: 'Calle Piamonte 23, 28004, Madrid, España',
            city: 'Madrid',
            cp: '28004',
            province: 'Madrid',
            addressText: 'Calle Piamonte 23; Málaga; 28004; Madrid, España',
            isFavorite: true
        }
    ],
    templates: [
        {
            id: 'template-hub-redes',
            name: 'Impact Hub Redes',
            recipientId: 'hub-malaga',
            items: [
                { id: '1', concept: 'Prestacion servicios marketing digital impact hub [MES]', quantity: 1, price: 300, taxType: 'IVA', taxValue: 21 }
            ],
            accountId: 'impacthub'
        },
        {
            id: 'template-one-next-hours',
            name: 'One Next Horas Pedro',
            recipientId: 'flexwork',
            items: [
                { id: '1', concept: 'Horas Freelance para cubrir espacios - Hilera', quantity: 1, price: 15, taxType: 'IVA_INCLUDED', taxValue: 0 }
            ],
            accountId: 'autonomo'
        },
        {
            id: 'template-one-next-santi',
            name: 'One Next Horas Santi',
            recipientId: 'flexwork',
            items: [
                { id: '1', concept: 'Horas', quantity: 1, price: 583, taxType: 'IVA', taxValue: 21 }
            ],
            accountId: 'autonomo'
        }
    ]
}
