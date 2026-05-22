const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/db'); // Recuerda cambiar en db.js el nombre a: database: 'fuerza_ancestral'
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de autenticación y roles
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ mensaje: "Token requerido" });
  try {
    const verificado = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
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
    
    // Si tus inserts de prueba no están encriptados, puedes usar (password === usuario.password) 
    // pero para producción usa bcrypt:
    const validPassword = await bcrypt.compare(password, usuario.password).catch(() => password === usuario.password);
    if (!validPassword) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    res.json({ 
      token, 
      usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol } 
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
    // Esta consulta junta el producto con sus variantes y calcula el promedio de estrellas real
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
                 'precio_especifico', COALESCE(v.precio_especifico, p.precio_base)
               )
             ) as variantes
      FROM producto p
      LEFT JOIN variante_producto v ON p.id_producto = v.id_producto AND v.activo = 1
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
// R4 & R12. ADMIN: CREAR/EDITAR PRODUCTOS Y VARIANTES (STOCK)
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

// Editar variante específica (Modificar stock de tallas/colores de forma exacta R12)
app.put('/api/variantes/:id_variante', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ mensaje: "Acceso denegado" });
  const { stock, precio_especifico, activo } = req.body;
  try {
    await db.query(
      'UPDATE variante_producto SET stock = ?, precio_especifico = ?, activo = ? WHERE id_variante = ?',
      [stock, precio_especifico, activo, req.params.id_variante]
    );
    res.json({ mensaje: "Stock/Variante actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// R8, R9, R10 & R11. CREACIÓN DE PEDIDOS, CONTROL DE STOCK Y ENVÍO
// ==========================================
app.post('/api/pedidos', verificarToken, async (req, res) => {
  const { items, direccion_envio, ciudad_envio, cliente_desea_factura } = req.body;
  // items = [{ id_variante: 1, cantidad: 2 }, { id_variante: 3, cantidad: 1 }]

  try {
    // R9. Confirmar si la dirección ingresada coincide con la de registro
    const [userRow] = await db.query('SELECT direccion, ciudad FROM usuario WHERE id_usuario = ?', [req.usuario.id_usuario]);
    const usuarioInfo = userRow[0];
    const mismaDireccion = (usuarioInfo.direccion === direccion_envio && usuarioInfo.ciudad === ciudad_envio);

    let totalPedido = 0;

    // R8. Verificar stocks antes de efectuar cualquier registro
    for (let item of items) {
      const [varRow] = await db.query(
        `SELECT v.stock, COALESCE(v.precio_especifico, p.precio_base) as precio, p.nombre 
         FROM variante_producto v 
         JOIN producto p ON v.id_producto = p.id_producto 
         WHERE v.id_variante = ?`, [item.id_variante]
      );

      if (varRow.length === 0) return res.status(404).json({ mensaje: "Una variante del producto no existe" });
      
      const variante = varRow[0];
      if (variante.stock < item.cantidad) {
        return res.status(400).json({ 
          mensaje: `Stock insuficiente para ${variante.nombre}. Disponibles: ${variante.stock}` 
        });
      }
      totalPedido += variante.precio * item.cantidad;
    }

    // Insertar en tabla `pedido`
    const [nuevoPedido] = await db.query(
      `INSERT INTO pedido (id_usuario, estado, total, direccion_envio, ciudad_envio, cliente_desea_factura) 
       VALUES (?, 'PENDIENTE_PAGO', ?, ?, ?, ?)`,
      [req.usuario.id_usuario, totalPedido, direccion_envio, ciudad_envio, cliente_desea_factura ? 1 : 0]
    );
    const id_pedido = nuevoPedido.insertId;

    // Registrar detalles del pedido y descontar stock dinámicamente (R12)
    for (let item of items) {
      const [varRow] = await db.query(
        `SELECT COALESCE(v.precio_especifico, p.precio_base) as precio 
         FROM variante_producto v JOIN producto p ON v.id_producto = p.id_producto WHERE v.id_variante = ?`, 
        [item.id_variante]
      );
      
      // Detalle del pedido con precio histórico
      await db.query(
        'INSERT INTO detalle_pedido (id_pedido, id_variante, cantidad, precio_historico) VALUES (?, ?, ?, ?)',
        [id_pedido, item.id_variante, item.cantidad, varRow[0].precio]
      );

      // Restar stock de la variante
      await db.query(
        'UPDATE variante_producto SET stock = stock - ? WHERE id_variante = ?',
        [item.cantidad, item.id_variante]
      );
    }

    // Inicializar el registro de Envío asociado
    await db.query(
      'INSERT INTO envio (id_pedido, direccion_envio, ciudad, estado_envio) VALUES (?, ?, ?, "PENDIENTE")',
      [id_pedido, direccion_envio, ciudad_envio]
    );

    // R10. Redirección simulada o integración con MercadoPago
    res.status(201).json({
      mensaje: "Pedido generado exitosamente.",
      id_pedido,
      total: totalPedido,
      url_pasarela: `https://api.mercadopago.com/checkout/preferences/... (Simulada)`,
      mismaDireccion,
      factura_solicitada: cliente_desea_factura
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// R13. ADMIN: VISUALIZAR TABLA DE PEDIDOS Y CAMBIAR ESTADOS
// ==========================================
app.get('/api/admin/pedidos', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ mensaje: "Acceso denegado" });
  try {
    const [pedidos] = await db.query(
      `SELECT p.id_pedido, u.nombre as cliente, p.fecha, p.estado, p.total, p.ciudad_envio, p.cliente_desea_factura, p.factura_enviada
       FROM pedido p 
       JOIN usuario u ON p.id_usuario = u.id_usuario 
       ORDER BY p.fecha DESC`
    );
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/pedidos/:id_pedido', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ mensaje: "Acceso denegado" });
  const { estado, factura_enviada } = req.body; // 'PAGADO', 'ENVIADO', 'CANCELADO', etc.
  try {
    let fields = [];
    let params = [];
    if (estado) { fields.push('estado = ?'); params.push(estado); }
    if (factura_enviada !== undefined) { fields.push('factura_enviada = ?'); params.push(factura_enviada); }
    
    params.push(req.params.id_pedido);
    
    await db.query(`UPDATE pedido SET ${fields.join(', ')} WHERE id_pedido = ?`, params);
    res.json({ mensaje: "Pedido actualizado por el administrador" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicialización
const PORT = process.env.PORT || 3306;
app.listen(PORT, () => console.log(`🚀 FUERZA2 API corriendo en puerto ${PORT}`));