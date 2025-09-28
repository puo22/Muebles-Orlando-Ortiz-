

CREATE DATABASE IF NOT EXISTS muebles;
USE muebles;
CREATE TABLE Categoria_Producto (
    Id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    Nombre_categoria VARCHAR(100) NOT NULL,
    Descripcion LONGTEXT
);


CREATE TABLE Cliente (
    cliente_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    Usuario VARCHAR(50) NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    Cedula VARCHAR(20) NOT NULL,
    Contraseña VARCHAR(255) NOT NULL,
    CONSTRAINT uk_cliente_usuario UNIQUE (Usuario),
    CONSTRAINT uk_cliente_email UNIQUE (email),
    CONSTRAINT uk_cliente_cedula UNIQUE (Cedula)
);

-- =============================================
-- 3. TABLA PRODUCTO
-- =============================================
CREATE TABLE Producto (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    Nombre_producto VARCHAR(200) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL CHECK (Precio >= 0),
    Descripcion LONGTEXT NOT NULL,
    Dimension VARCHAR(100),
    Material VARCHAR(100),
    Color VARCHAR(50),
    Peso DECIMAL(10,2),
    categoria_id BIGINT,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES Categoria_Producto(Id_categoria)
);

-- =============================================
-- 4. TABLA INVENTARIO
-- =============================================
CREATE TABLE Inventario (
    producto_id BIGINT,
    Cantidad_Disponible INT DEFAULT 0 NOT NULL CHECK (Cantidad_Disponible >= 0),
    Cantidad_Reservada INT DEFAULT 0 NOT NULL CHECK (Cantidad_Reservada >= 0),
    PRIMARY KEY (producto_id),
    CONSTRAINT fk_inventario_producto FOREIGN KEY (producto_id) REFERENCES Producto(id)
);

-- =============================================
-- 5. TABLA IMAGEN
-- =============================================
CREATE TABLE Imagen (
    Id BIGINT AUTO_INCREMENT PRIMARY KEY,
    Url LONGTEXT NOT NULL,
    Orden INT DEFAULT 0,
    Es_principal TINYINT DEFAULT 0 CHECK (Es_principal IN (0, 1)),
    Producto_id BIGINT NOT NULL,
    CONSTRAINT fk_imagen_producto FOREIGN KEY (Producto_id) REFERENCES Producto(id)
);

-- =============================================
-- 6. TABLA PEDIDO
-- =============================================
CREATE TABLE Pedido (
    Id BIGINT AUTO_INCREMENT PRIMARY KEY,
    Fecha_de_pedido DATETIME(6) DEFAULT NOW(6),
    Estado VARCHAR(20) NOT NULL CHECK (Estado IN ('PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO')),
    Precio_total DECIMAL(10,2) DEFAULT 0 CHECK (Precio_total >= 0),
    cliente_id BIGINT NOT NULL,
    Fecha_estimada_entrega DATETIME,
    Observacion LONGTEXT,
    Tipo_de_pedido VARCHAR(15) NOT NULL CHECK (Tipo_de_pedido IN ('VENTA', 'CREACION', 'REPARACION')),
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES Cliente(cliente_id)
);

-- =============================================
-- 7. TABLA VENTA
-- =============================================
CREATE TABLE Venta (
    pedido_id BIGINT PRIMARY KEY,
    CONSTRAINT fk_venta_pedido FOREIGN KEY (pedido_id) REFERENCES Pedido(Id)
);

-- =============================================
-- 8. TABLA CREACION
-- =============================================
CREATE TABLE Creacion (
    pedido_id BIGINT PRIMARY KEY,
    Descripcion LONGTEXT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Imagen_referencia LONGTEXT,
    CONSTRAINT fk_creacion_pedido FOREIGN KEY (pedido_id) REFERENCES Pedido(Id)
);

-- =============================================
-- 9. TABLA REPARACION
-- =============================================
CREATE TABLE Reparacion (
    pedido_id BIGINT PRIMARY KEY,
    Descripcion_de_daño LONGTEXT NOT NULL,
    Diagnostico LONGTEXT,
    Imagen_referencia LONGTEXT,
    Garantia TINYINT DEFAULT 0 CHECK (Garantia IN (0, 1)),
    CONSTRAINT fk_reparacion_pedido FOREIGN KEY (pedido_id) REFERENCES Pedido(Id)
);

-- =============================================
-- 10. TABLA DETALLE_PEDIDO
-- =============================================
CREATE TABLE Detalle_pedido (
    Id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    Cantidad INT NOT NULL CHECK (Cantidad > 0),
    Precio_unidad DECIMAL(10,2) NOT NULL CHECK (Precio_unidad >= 0),
    Descripcion LONGTEXT,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (Cantidad * Precio_unidad) VIRTUAL,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id) REFERENCES Pedido(Id),
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES Producto(id)
);

-- =============================================
-- 11. TABLA ENVIO
-- =============================================
CREATE TABLE Envio (
    envio_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    Pedido_Id BIGINT NOT NULL UNIQUE,
    Direccion LONGTEXT NOT NULL,
    Costo_Envio DECIMAL(10,2) DEFAULT 0 CHECK (Costo_Envio >= 0),
    Estado VARCHAR(20) NOT NULL CHECK (Estado IN ('PENDIENTE', 'EN_TRANSITO', 'ENTREGADO')),
    Ciudad VARCHAR(100) NOT NULL,
    Numero_guia VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT fk_envio_pedido FOREIGN KEY (Pedido_Id) REFERENCES Pedido(Id)
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX idx_cliente_nombre ON Cliente(Nombre);
CREATE INDEX idx_cliente_apellido ON Cliente(Apellido);
CREATE INDEX idx_cliente_email ON Cliente(email);
CREATE INDEX idx_cliente_usuario ON Cliente(Usuario);

CREATE INDEX idx_producto_nombre ON Producto(Nombre_producto);
CREATE INDEX idx_producto_precio ON Producto(Precio);
CREATE INDEX idx_producto_categoria ON Producto(categoria_id);

CREATE INDEX idx_pedido_cliente ON Pedido(cliente_id);
CREATE INDEX idx_pedido_fecha ON Pedido(Fecha_de_pedido);
CREATE INDEX idx_pedido_estado ON Pedido(Estado);
CREATE INDEX idx_pedido_tipo ON Pedido(Tipo_de_pedido);
CREATE INDEX idx_pedido_fecha_estado ON Pedido(Fecha_de_pedido, Estado);

CREATE INDEX idx_detalle_pedido_id ON Detalle_pedido(pedido_id);
CREATE INDEX idx_detalle_producto_id ON Detalle_pedido(producto_id);
CREATE INDEX idx_detalle_pedido_producto ON Detalle_pedido(pedido_id, producto_id);

CREATE INDEX idx_envio_pedido ON Envio(Pedido_Id);
CREATE INDEX idx_envio_estado ON Envio(Estado);
CREATE INDEX idx_envio_ciudad ON Envio(Ciudad);

CREATE INDEX idx_imagen_producto ON Imagen(Producto_id);
CREATE INDEX idx_imagen_principal ON Imagen(Es_principal);

CREATE INDEX idx_inventario_disponible ON Inventario(Cantidad_Disponible);
CREATE INDEX idx_inventario_reservada ON Inventario(Cantidad_Reservada);

-- =============================================
-- TRIGGERS
-- =============================================

DELIMITER //

CREATE TRIGGER trg_chk_venta_tipo
BEFORE INSERT OR UPDATE ON Venta
FOR EACH ROW
BEGIN
    DECLARE v_tipo VARCHAR(20);
    SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
    IF v_tipo <> 'VENTA' THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'El pedido no es de tipo VENTA';
    END IF;
END;
//

CREATE TRIGGER trg_chk_creacion_tipo
BEFORE INSERT OR UPDATE ON Creacion
FOR EACH ROW
BEGIN
    DECLARE v_tipo VARCHAR(20);
    SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
    IF v_tipo <> 'CREACION' THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'El pedido no es de tipo CREACION';
    END IF;
END;
//

CREATE TRIGGER trg_chk_reparacion_tipo
BEFORE INSERT OR UPDATE ON Reparacion
FOR EACH ROW
BEGIN
    DECLARE v_tipo VARCHAR(20);
    SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
    IF v_tipo <> 'REPARACION' THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'El pedido no es de tipo REPARACION';
    END IF;
END;
//

DELIMITER ;

DROP TRIGGER IF EXISTS trg_chk_venta_insert;
DROP TRIGGER IF EXISTS trg_chk_venta_update;
DROP TRIGGER IF EXISTS trg_chk_creacion_insert;
DROP TRIGGER IF EXISTS trg_chk_creacion_update;
DROP TRIGGER IF EXISTS trg_chk_reparacion_insert;
DROP TRIGGER IF EXISTS trg_chk_reparacion_update;

DELIMITER $$

/* VENTA */
CREATE TRIGGER trg_chk_venta_insert
BEFORE INSERT ON Venta
FOR EACH ROW
BEGIN
  DECLARE v_tipo VARCHAR(20) DEFAULT NULL;
  SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
  IF v_tipo IS NULL THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'Pedido no existe';
  ELSEIF v_tipo <> 'VENTA' THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'El pedido no es de tipo VENTA';
  END IF;
END$$

CREATE TRIGGER trg_chk_venta_update
BEFORE UPDATE ON Venta
FOR EACH ROW
BEGIN
  DECLARE v_tipo VARCHAR(20) DEFAULT NULL;
  SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
  IF v_tipo IS NULL THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'Pedido no existe';
  ELSEIF v_tipo <> 'VENTA' THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'El pedido no es de tipo VENTA';
  END IF;
END$$

/* CREACION */
CREATE TRIGGER trg_chk_creacion_insert
BEFORE INSERT ON Creacion
FOR EACH ROW
BEGIN
  DECLARE v_tipo VARCHAR(20) DEFAULT NULL;
  SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
  IF v_tipo IS NULL THEN
    SIGNAL SQLSTATE '45005' SET MESSAGE_TEXT = 'Pedido no existe';
  ELSEIF v_tipo <> 'CREACION' THEN
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'El pedido no es de tipo CREACION';
  END IF;
END$$

CREATE TRIGGER trg_chk_creacion_update
BEFORE UPDATE ON Creacion
FOR EACH ROW
BEGIN
  DECLARE v_tipo VARCHAR(20) DEFAULT NULL;
  SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
  IF v_tipo IS NULL THEN
    SIGNAL SQLSTATE '45005' SET MESSAGE_TEXT = 'Pedido no existe';
  ELSEIF v_tipo <> 'CREACION' THEN
    SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'El pedido no es de tipo CREACION';
  END IF;
END$$


CREATE TRIGGER trg_chk_reparacion_insert
BEFORE INSERT ON Reparacion
FOR EACH ROW
BEGIN
  DECLARE v_tipo VARCHAR(20) DEFAULT NULL;
  SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
  IF v_tipo IS NULL THEN
    SIGNAL SQLSTATE '45006' SET MESSAGE_TEXT = 'Pedido no existe';
  ELSEIF v_tipo <> 'REPARACION' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'El pedido no es de tipo REPARACION';
  END IF;
END$$

CREATE TRIGGER trg_chk_reparacion_update
BEFORE UPDATE ON Reparacion
FOR EACH ROW
BEGIN
  DECLARE v_tipo VARCHAR(20) DEFAULT NULL;
  SELECT Tipo_de_pedido INTO v_tipo FROM Pedido WHERE Id = NEW.pedido_id;
  IF v_tipo IS NULL THEN
    SIGNAL SQLSTATE '45006' SET MESSAGE_TEXT = 'Pedido no existe';
  ELSEIF v_tipo <> 'REPARACION' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'El pedido no es de tipo REPARACION';
  END IF;
END$$

DELIMITER ;