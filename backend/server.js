const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/db'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de autenticación y roles
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ mensaje: "Token requerido" });
  try {
    const verificado = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || 'FirmaSecretaFuerzaAncestral2026');
    req.usuario = verificado;
    next();
  } catch (err) {
    res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

// ==========================================
// R3 & R7. AUTENTICACIÓN (REGISTRO Y LOGIN)
// ==========================================
app.post('/api/auth/registro', async (req, res) => {
  const { nombre, direccion, ciudad, celular, correo, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);
    
    await db.query(
      'INSERT INTO usuario (nombre, direccion, ciudad, celular, correo, password, rol) VALUES (?, ?, ?, ?, ?, ?, "cliente")',
      [nombre, direccion, ciudad, celular, correo, passwordHashed]
    );
    res.status(201).json({ mensaje: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM usuario WHERE correo = ?', [correo]);
    if (rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const usuario = rows[0];
    
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, usuario.password);
    } catch (e) {
      validPassword = false;
    }

    if (!validPassword) {
      validPassword = (password === usuario.password);
    }

    if (!validPassword) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol }, 
      process.env.JWT_SECRET || 'FirmaSecretaFuerzaAncestral2026', 
      { expiresIn: '8h' }
    );
    
    res.json({ 
      token, 
      usuario: { 
        id_usuario: usuario.id_usuario, 
        nombre: usuario.nombre, 
        rol: usuario.rol,
        direccion: usuario.direccion,
        ciudad: usuario.ciudad
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// R2 & R5. LISTAR PRODUCTOS CON CALIFICACIÓN Y BÚSQUEDA
// ==========================================
app.get('/api/productos', async (req, res) => {
  const { buscar } = req.query;
  try {
    let query = `
      SELECT p.*, 
             COALESCE(AVG(c.puntuacion), 5) as estrellas,
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id_variante', v.id_variante,
                 'sku', v.sku,
                 'talla', v.talla,
                 'color', v.color,
                 'stock', v.stock,
                 'precio_especifico', COALESCE(v.precio_especifico, p.precio_base),
                 'activo', v.activo
               )
             ) as variantes
      FROM producto p
      LEFT JOIN variante_producto v ON p.id_producto = v.id_producto
      LEFT JOIN calificacion c ON p.id_producto = c.id_producto
      WHERE p.activo = 1
    `;
    
    let params = [];
    if (buscar) {
      query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)';
      params = [`%${buscar}%`, `%${buscar}%`];
    }
    
    query += ' GROUP BY p.id_producto';
    const [productos] = await db.query(query, params);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// VALIDACIÓN DE CUPONES (Para CarritoSidebar)
// ==========================================
app.get('/api/cupones/validar', async (req, res) => {
  const { codigo } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT porcentaje_descuento FROM cupon WHERE BINARY codigo = ? AND activo = 1', 
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Cupón inválido o vencido" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// INTEGRACIÓN MERCADO PAGO (RF 10)
// ==========================================
app.post('/api/crear-preferencia', verificarToken, async (req, res) => {
  const { items, descuento } = req.body;

  try {
    const itemsPreferencia = items.map(item => ({
      id: item.id_producto.toString(),
      title: item.nombre,
      quantity: parseInt(item.cantidad),
      currency_id: 'COP',
      unit_price: parseFloat(item.precio_base)
    }));

    if (descuento && descuento > 0) {
      itemsPreferencia.push({
        id: "CUPON-DESC",
        title: "Descuento por Cupón Aplicado",
        quantity: 1,
        currency_id: 'COP',
        unit_price: -parseFloat(descuento)
      });
    }

    const mpResponse = await fetch('https://api.mercadopago.com/v1/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN || 'APP_USR-TU-TOKEN'}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: itemsPreferencia,
        back_urls: {
          success: "http://localhost:5173/pago-exitoso",
          failure: "http://localhost:5173/pago-fallido",
          pending: "http://localhost:5173/pago-pendiente"
        },
        auto_return: "approved"
      })
    });

    const mpData = await mpResponse.json();

    if (mpData.init_point) {
      res.json({ init_point: mpData.init_point });
    } else {
      res.status(400).json({ mensaje: "No se pudo generar el init_point de Mercado Pago" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// R4 & R12. ADMIN: CREAR/EDITAR PRODUCTOS Y VARIANTES
// ==========================================
app.post('/api/productos', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ mensaje: "Acceso denegado" });
  const { id_categoria, referencia, foto_url, nombre, descripcion, precio_base } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO producto (id_categoria, referencia, foto_url, nombre, descripcion, precio_base) VALUES (?, ?, ?, ?, ?, ?)',
      [id_categoria, referencia, foto_url, nombre, descripcion, precio_base]
    );
    res.status(201).json({ mensaje: "Producto creado", id_producto: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. EDITAR INFORMACIÓN BASE DEL PRODUCTO
app.put('/api/productos/:id_producto', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ mensaje: "Acceso denegado" });
  const { id_categoria, referencia, foto_url, nombre, descripcion, precio_base, activo } = req.body;
  const { id_producto } = req.params;
  try {
    await db.query(
      `UPDATE producto 
       SET id_categoria = ?, referencia = ?, foto_url = ?, nombre = ?, descripcion = ?, precio_base = ?, activo = ? 
       WHERE id_producto = ?`,
      [id_categoria, referencia, foto_url, nombre, descripcion, precio_base, activo, id_producto]
    );
    res.json({ mensaje: "Información base del producto actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. EDITAR VARIANTE ESPECÍFICA (STOCK Y PRECIO ESPECÍFICO)
app.put('/api/variantes/:id_variante', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ mensaje: "Acceso denegado" });
  const { stock, precio_especifico, activo } = req.body;
  try {
    await db.query(
      'UPDATE variante_producto SET stock = ?, precio_especifico = ?, activo = ? WHERE id_variante = ?',
      [stock, precio_especifico, activo, req.params.id_variante]
    );
    res.json({ mensaje: "Variante y stock actualizados correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CREACIÓN DE PEDIDOS CON CONTROL DE STOCK SEGURO (TRANSACCIONES DB)
// ==========================================
app.post('/api/pedidos', verificarToken, async (req, res) => {
  const { items, direccion_envio, ciudad_envio, cliente_desea_factura } = req.body;
  
  // Obtenemos una conexión individual y exclusiva del pool para manejar la transacción
  const connection = await db.getConnection();

  try {
    // 1. INICIAMOS LA TRANSACCIÓN ACORDADA
    await connection.beginTransaction();

    // Consultamos datos de dirección del usuario de forma interna y segura
    const [userRow] = await connection.query('SELECT direccion, ciudad FROM usuario WHERE id_usuario = ?', [req.usuario.id_usuario]);
    const usuarioInfo = userRow[0];
    const mismaDireccion = usuarioInfo ? (usuarioInfo.direccion === direccion_envio && usuarioInfo.ciudad === ciudad_envio) : false;

    let totalPedido = 0;
    const itemsVerificados = [];

    // 2. PRIMERA FASE: VERIFICAR Y BLOQUEAR FILAS PARA EVITAR SOBREVENTAS CONCURRENTES
    for (let item of items) {
      const [varRow] = await connection.query(
        `SELECT v.id_variante, v.stock, COALESCE(v.precio_especifico, p.precio_base) as precio, p.nombre 
         FROM variante_producto v 
         JOIN producto p ON v.id_producto = p.id_producto 
         WHERE v.id_variante = ? FOR UPDATE`, // El 'FOR UPDATE' congela el registro para que nadie más lo altere en este milisegundo
        [item.id_variante]
      );

      if (varRow.length === 0) {
        throw new Error("Una variante elegida de los productos ya no se encuentra en existencia.");
      }
      
      const variante = varRow[0];
      
      // Control estricto de Stock en Bodega
      if (variante.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para el producto: ${variante.nombre}. Unidades en inventario: ${variante.stock}`);
      }
      
      const subtotalItem = variante.precio * item.cantidad;
      totalPedido += subtotalItem;
      
      // Guardamos la información limpia para usarla en la fase de inserción
      itemsVerificados.push({
        id_variante: variante.id_variante,
        cantidad: item.cantidad,
        precio_historico: variante.precio
      });
    }

    // 3. SEGUNDA FASE: INSERTAR EN LA TABLA PEDIDO (CABECERA)
    const [nuevoPedido] = await connection.query(
      `INSERT INTO pedido (id_usuario, estado, total, direccion_envio, ciudad_envio, cliente_desea_factura) 
       VALUES (?, 'PENDIENTE_PAGO', ?, ?, ?, ?)`,
      [req.usuario.id_usuario, totalPedido, direccion_envio, ciudad_envio, cliente_desea_factura ? 1 : 0]
    );
    const id_pedido = nuevoPedido.insertId;

    // 4. TERCERA FASE: INSERTAR DETALLES Y DESCONTAR STOCK REAL
    for (let item of itemsVerificados) {
      // Guardar el historial de compra
      await connection.query(
        'INSERT INTO detalle_pedido (id_pedido, id_variante, cantidad, precio_historico) VALUES (?, ?, ?, ?)',
        [id_pedido, item.id_variante, item.cantidad, item.precio_historico]
      );

      // Descontamos las unidades adquiridas de forma segura
      await connection.query(
        'UPDATE variante_producto SET stock = stock - ? WHERE id_variante = ?',
        [item.cantidad, item.id_variante]
      );
    }

    // 5. CUARTA FASE: REGISTRAR GUÍA DE ENVÍO ASOCIADA
    await connection.query(
      'INSERT INTO envio (id_pedido, direccion_envio, ciudad, estado_envio) VALUES (?, ?, ?, "PENDIENTE")',
      [id_pedido, direccion_envio, ciudad_envio]
    );

    // 🔥 SI TODO SALIÓ BIEN: Confirmamos y asentamos los cambios en la Base de Datos permanentemente
    await connection.commit();

    res.status(201).json({
      mensaje: "Pedido generado exitosamente y stock actualizado en bodega.",
      id_pedido,
      total: totalPedido,
      mismaDireccion,
      factura_solicitada: cliente_desea_factura
    });

  } catch (error) {
    // 🛑 CONTROL DE ERRORES: Si algo falló, hacemos Rollback absoluto (nada se guarda, el stock no se toca)
    await connection.rollback();
    console.error("❌ Error detectado. Transacción revertida de inmediato:", error.message);
    
    // Si es un error controlado por nosotros (como falta de stock) enviamos un 400, si no un 500
    const statusCode = error.message.includes("Stock insuficiente") || error.message.includes("ya no se encuentra") ? 400 : 500;
    res.status(statusCode).json({ mensaje: error.message });
  } finally {
    // Soltamos la conexión para que vuelva libre al pool
    connection.release();
  }
});

// ==========================================
// R13. ADMIN: VISUALIZAR TABLA DE PEDIDOS SIMPLIFICADA
// ==========================================
app.get('/api/admin/pedidos', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ mensaje: "Acceso denegado" });
  try {
    const [pedidos] = await db.query(
      `SELECT 
        p.id_pedido, 
        u.nombre AS nombre_usuario, 
        p.fecha, 
        p.estado, 
        p.total
       FROM pedido p 
       JOIN usuario u ON p.id_usuario = u.id_usuario 
       ORDER BY p.fecha DESC`
    );
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 FUERZA ANCESTRAL API corriendo en puerto ${PORT}`));