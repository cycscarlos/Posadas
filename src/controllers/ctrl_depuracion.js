const { transaction } = require("../database/db.js");

const eliminarRegistros = async (periodo) => {
    const now = new Date();
    let fechaLimite;

    switch (periodo) {
        case 'mes_anterior':
            fechaLimite = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        case 'seis_meses_anteriores':
            fechaLimite = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
        case 'un_ano_anterior':
            fechaLimite = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        default:
            throw new Error('Período no válido');
    }

    const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];

    await transaction(async ({ query: q }) => {
        // Eliminar registros de pagos (primero, no tiene FK que apunten a ella)
        await q(`
            DELETE FROM pagos
            WHERE fecha_pago < ?
        `, [fechaLimiteStr]);

        // Eliminar metodos_pago que ya no tienen pagos asociados
        await q(`
            DELETE FROM metodos_pago
            WHERE id_metodo_pago NOT IN (
                SELECT id_metodo_pago FROM pagos
            )
        `);

        // Eliminar registros de reservas
        await q(`
            DELETE FROM reservas
            WHERE fecha_salida < ?
        `, [fechaLimiteStr]);
    });
};

module.exports = {
    eliminarRegistros
};
