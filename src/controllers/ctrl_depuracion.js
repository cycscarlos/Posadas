const { pool, query } = require("../database/db.js");

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

    const connection = await new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) {
                return reject(err);
            }
            resolve(conn);
        });
    });

    try {
        await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

        // Eliminar registros de pagos (primero, no tiene FK que apunten a ella)
        await query(`
            DELETE FROM pagos
            WHERE fecha_pago < ?
        `, [fechaLimiteStr]);

        // Eliminar metodos_pago que ya no tienen pagos asociados
        await query(`
            DELETE FROM metodos_pago
            WHERE id_metodo_pago NOT IN (
                SELECT id_metodo_pago FROM pagos
            )
        `);

        // Eliminar registros de reservas
        await query(`
            DELETE FROM reservas
            WHERE fecha_salida < ?
        `, [fechaLimiteStr]);

        await new Promise((resolve, reject) => {
            connection.commit((err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    } catch (err) {
        await new Promise((resolve, reject) => {
            connection.rollback(() => {
                resolve();
            });
        });
        throw err;
    } finally {
        connection.release();
    }
};

module.exports = {
    eliminarRegistros
};
