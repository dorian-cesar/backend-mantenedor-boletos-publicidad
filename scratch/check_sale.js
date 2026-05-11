const { VentaBoleto } = require('../src/models');
const { Op } = require('sequelize');

async function checkSale() {
    const tkt = 'TS260506124031100IFUQ';
    const pnr = '2EEE34EDB8';
    
    console.log(`Checking for TKT: ${tkt} or PNR: ${pnr}`);
    
    try {
        const venta = await VentaBoleto.findOne({
            where: {
                [Op.or]: [
                    { ticket_numbers: { [Op.like]: `%${tkt}%` } },
                    { payload_response: { [Op.like]: `%${pnr}%` } },
                    { payload_request: { [Op.like]: `%${pnr}%` } }
                ]
            }
        });
        
        if (venta) {
            console.log('Found sale in VentaBoleto table:', JSON.stringify(venta, null, 2));
        } else {
            console.log('No sale found in VentaBoleto table for this TKT/PNR');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSale();
