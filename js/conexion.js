let mysql = require("mysql2");

let conexion = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "admin",
    password: "admin",
    database: "muebles"
});

conexion.connect(function(error){
    if(error){
        console.log("Error de conexión: " + error.stack);
        return;
    }
    console.log("Conexión exitosa como ID " + conexion.threadId);
});
