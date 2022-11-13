//---BILLETERA VIRTUAL TGARK---//


//-FUNCIONES-//

//1)Login ( hay una cuenta por defecto cargada mail:admin@admin.com pass:1234)

//2)Registrar usuarios (Nombre,mail,contraseña)

//3)Las cuentas inician con AR$3000 y U$D100. Se puede Agregar Dinero, Retirar Dinero,
//  , enviar dinero a otras cuentas registradas a traves del mail y comprar Dolares.

//4)Las operaciones se pueden efectuar con la cuenta de pesos o la de dolares, segun cual seleccione.

//5) Tiene un visor del saldo actual que se actualiza segun los movimientos que se hagan. El visor cambia
//  segun el tipo de cuenta seleccionado(dolar o peso).
//6) Tiene un pequeño historial de movimientos.




//---DECLARACION DE LAS CLASES--//
class Usuario {
    constructor(id, mail, nombre, pass) {
        this.id = id;
        this.mail = mail;
        this.nombre = nombre
        this.pass = pass;
        this.pesos = 3000;
        this.dolares = 100;
        this.movimientos = []

    }
}
class Cajero {
    constructor() {
        this.usuarios = [];
        this.usuarioEnLinea = -1;
        this.usuarioActual = this.usuarios[this.usuarioEnLinea];
    }

    //Metodo Ingreso
    ingresar(mail, password) {
        let bandera = false;
        let indice = this.usuarios.findIndex((us3r) => us3r.mail == mail && us3r.pass == password);
        if (indice !== -1) {
            this.usuarioEnLinea = indice;
            this.actualizarMovimientos();
            bandera = true;
        }
        return bandera;
    }

    //Metodo de Registro
    registrarUsuario(mail, nombre, contrasenia) {
        let id = this.usuarios.length;
        const usuario = new Usuario(id, mail, nombre, contrasenia);
        this.usuarios.push(usuario);
        this.guardarUsuarios();
    }

    //Metodo getter del dinero en la cuenta
    dineroEnCuenta() {
        return this.usuarios[this.usuarioEnLinea].dinero;
    }

    //Metodo para ingresar dinero
    ingresarDinero(monto, cuenta) {
        let movimiento = this.crearMovimiento();

        if (cuenta === 1) {
            this.usuarios[this.usuarioEnLinea].pesos += monto;
            movimiento.conceptoDineroDepositado(monto, "AR$");
        } else {
            this.usuarios[this.usuarioEnLinea].dolares += monto;
            movimiento.conceptoDineroDepositado(monto, "U$D");
        }
        Swal.fire({
            icon: 'success',
            title: `Deposito Exitoso`,
            text: `Dinero Ingresado en su Cuenta`,
            showConfirmButton: false,
            timer: 3800
        })
        this.usuarios[this.usuarioEnLinea].movimientos.push(movimiento);
        this.guardarUsuarios();
        this.actualizarDinero();
        this.actualizarMovimientos();
    }

    //Metodo para retirar dinero de la cuenta
    retirarDinero(monto, cuenta) {
        let montoDolarSuficiente = this.usuarios[this.usuarioEnLinea].dolares >= monto;
        let montoPesosSuficiente = this.usuarios[this.usuarioEnLinea].pesos >= monto;
        let movimiento = this.crearMovimiento();
        if (cuenta === 1 && montoPesosSuficiente) {
            this.usuarios[this.usuarioEnLinea].pesos -= monto;
            movimiento.conceptoDineroRetirado(monto, "AR$");
            this.usuarios[this.usuarioEnLinea].movimientos.push(movimiento)
            Swal.fire({
                icon: 'success',
                title: `Retiro Exitoso`,
                text: `Dinero retirado AR$ ${monto}`,
                showConfirmButton: false,
                timer: 3800
            })

        } else if (montoDolarSuficiente) {
            this.usuarios[this.usuarioEnLinea].dolares -= monto;
            movimiento.conceptoDineroRetirado(monto, "U$D");
            this.usuarios[this.usuarioEnLinea].movimientos.push(movimiento)
            Swal.fire({
                icon: 'success',
                title: `Retiro Exitoso`,
                text: `Dinero retirado U$D ${monto}`,
                showConfirmButton: false,
                timer: 3800
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Dinero en cuenta insuficiente, Digite un monto adecuado.',
                footer: '<a href="">Why do I have this issue?</a>'
            });
        }
        this.actualizarDinero();
        this.guardarUsuarios();
        this.actualizarMovimientos();
    }

    //Metodo para enviar dinero a otra cuenta
    enviarDinero(monto, mail, cuenta) {
        let index = this.encontrarIndexUsuario("mail", mail);
        let movimiento = this.crearMovimiento();
        let movimientoEnvio = this.crearMovimiento();
        if (index !== -1) {
            if (cuenta === 1 && monto <= this.usuarios[this.usuarioEnLinea].pesos) {
                this.usuarios[this.usuarioEnLinea].pesos -= monto;
                this.usuarios[index].pesos += monto;
                movimiento.conceptoDineroEnviado(monto, mail, "AR$");
                movimientoEnvio.conceptoDineroRecibido(monto, this.usuarios[this.usuarioEnLinea].mail, "AR$");
                this.usuarios[this.usuarioEnLinea].movimientos.push(movimiento)
                this.usuarios[index].movimientos.push(movimientoEnvio);
                Swal.fire({
                    icon: 'success',
                    title: `Transaccion Exitosa`,
                    text: `Dinero Enviado con éxito al mail ${mail}`,
                    showConfirmButton: false,
                    timer: 3800
                })
            } else if (monto <= this.usuarios[this.usuarioEnLinea].dolares) {
                this.usuarios[this.usuarioEnLinea].dolares -= monto;
                this.usuarios[index].dolares += monto;
                movimiento.conceptoDineroEnviado(monto, mail, "U$D");
                movimientoEnvio.conceptoDineroRecibido(monto, this.usuarios[this.usuarioEnLinea].mail, "U$D");
                this.usuarios[this.usuarioEnLinea].movimientos.push(movimiento)
                this.usuarios[index].movimientos.push(movimientoEnvio);
                Swal.fire({
                    icon: 'success',
                    title: `Transaccion Exitosa`,
                    text: `Dinero Enviado con éxito al mail ${mail}`,
                    showConfirmButton: false,
                    timer: 3800
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Dinero en cuenta Insuficiente'
                });
            }
        } else
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Mail No registrado en nuestro banco',
                footer: '<a href="">Why do I have this issue?</a>'
            });
        this.actualizarDinero();
        this.guardarUsuarios();
        this.actualizarMovimientos();
    }

    comprarDolares(precioDolar, montoAComprar) {
        console.log(precioDolar);
        console.log(montoAComprar);
        let movimientoCompra = this.crearMovimiento();
        let movimientoCompraDescontar = this.crearMovimiento();
        let montoEnPesos = precioDolar * montoAComprar;
        if (montoEnPesos <= this.usuarios[this.usuarioEnLinea].pesos) {
            this.usuarios[this.usuarioEnLinea].pesos -= montoEnPesos;
            this.usuarios[this.usuarioEnLinea].dolares += montoAComprar;
            movimientoCompra.conceptoCompraDolares(montoAComprar);
            movimientoCompraDescontar.conceptoCompraDolaresDescontar(montoEnPesos);
            this.usuarios[this.usuarioEnLinea].movimientos.push(movimientoCompra);
            this.usuarios[this.usuarioEnLinea].movimientos.push(movimientoCompraDescontar);
            Swal.fire({
                icon: 'success',
                title: `Compra Exitosa`,
                text: `Dolares Agregados a su cuenta ${montoAComprar}`,
                showConfirmButton: false,
                timer: 3800
            })
            this.actualizarDinero();
            this.guardarUsuarios();
            this.actualizarMovimientos();

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Pesos Insuficientes',
                footer: '<a href="">Why do I have this issue?</a>'
            });
        }
    }

    //Metodo para guardar los datos de los usuarios en el localStorage
    guardarUsuarios() {
        localStorage.setItem("listaUsuarios", JSON.stringify(this.usuarios));
    }

    //Metodo para actualizar el visor del dinero
    actualizarDinero() {
        const saldoPesos = document.getElementById("saldoCuentaPesos");
        const saldoDolares = document.getElementById("saldoCuentaDolares");
        saldoPesos.innerText = `AR$ ${this.usuarios[this.usuarioEnLinea].pesos}`;
        saldoDolares.innerText = `U$D ${this.usuarios[this.usuarioEnLinea].dolares}`;
    }

    //Metodo para crear un movimiento
    crearMovimiento() {
        let num = this.usuarios[this.usuarioEnLinea].movimientos.length;
        const movimiento = new Movimiento(num);
        return movimiento;
    }

    //Metodo para actualizar el historial de los movimientos de dinero.
    actualizarMovimientos() {
        const contenedorMovimientos = document.getElementById("movimientos");
        contenedorMovimientos.innerHTML = ``;
        for (let i = this.usuarios[this.usuarioEnLinea].movimientos.length - 1; i >= 0; i--) {
            let dinero = this.usuarios[this.usuarioEnLinea].movimientos[i].monto;
            let movimiento = document.createElement("div");
            dinero[0] === "+" ? movimiento.className = "movimientoPositivo" : movimiento.className = "movimientoNegativo";

            /* if (dinero[0] === "+")
                    movimiento.className = "movimientoPositivo";
                else
                    movimiento.className = "movimientoNegativo";*/
            movimiento.innerHTML = `
                <p>Movimiento N°: ${this.usuarios[this.usuarioEnLinea].movimientos[i].numeroMovimiento}</p> 
                <p class="concepto">Concepto: ${this.usuarios[this.usuarioEnLinea].movimientos[i].concepto}</p>
                <h4>${this.usuarios[this.usuarioEnLinea].movimientos[i].monto}</h4>
            `;
            contenedorMovimientos.append(movimiento);
        }

    }
    encontrarIndexUsuario(propiedad, buscar) {
        return this.usuarios.findIndex((us3r) => us3r[propiedad] == buscar);
    }
}

// Los metodos de la clase movimiento setean los atributos concepto y monto (Segun si es 
//  deposito  a la misma cuenta, retiro, envio o recibo de dinero hacia o desde otra cuenta)
class Movimiento {
    constructor(num) {
        this.numeroMovimiento = num;
        this.concepto = ``;
        this.monto = 0;
    }
    conceptoDineroDepositado(monto, tipo) {
        this.monto = `+${tipo} ${monto}`;
        this.concepto = `Deposito de dinero en cuenta propia`;
    }
    conceptoDineroRetirado(monto, tipo) {
        this.monto = `-${tipo} ${monto}`;
        this.concepto = "Retiro de dinero"
    }
    conceptoDineroEnviado(monto, mail, tipo) {
        this.monto = `-${tipo} ${monto}`;
        this.concepto = `Envío de dinero a la cuenta: ${mail}`;

    }
    conceptoDineroRecibido(monto, mail, tipo) {
        this.monto = `+${tipo} ${monto}`;
        this.concepto = `Dinero recibido de la cuenta: ${mail}`;
    }

    conceptoCompraDolares(montoDolar) {
        this.monto = `+U$D ${montoDolar}`;
        this.concepto = `Compra de Dolares`
    }
    conceptoCompraDolaresDescontar(monto) {
        this.monto = `-AR$ ${monto}`;
        this.concepto = `Compra de Dolares`
    }


}
//inicializo el Cajero/Billetera
let opcionInicio = -1;
let cajeroTGark = new Cajero();
let usuarioLocalStorage = JSON.parse(localStorage.getItem("listaUsuarios"));
const contenedorWallet = document.getElementById("contenedorWallet");
const contenedorInicioRegistro = document.getElementById("contenedorInicioRegistro")
const contenedorInicioSesion = document.getElementById("contenedorSesionInicio");
const contenedorRegistroSesion = document.getElementById("contenedorSesionRegistro");
const contenedorSesionIniciada = document.getElementById("contenedorSesionIniciada");
usuarioLocalStorage ? cajeroTGark.usuarios = usuarioLocalStorage : cajeroTGark.registrarUsuario("admin@admin", "admin", "1234")

//---LOGIN Y REGISTRO---//

//Evento para cambiar a formulario de registro
const botonRegistro = document.getElementById("botonRegistro");
const botonIngreso = document.getElementById("botonIngreso");
const contenedorTieneCuenta = document.getElementById("tieneCuenta");
const contenedorNoTieneCuenta = document.getElementById("noTieneCuenta");
const cerrarSesion = document.getElementById("cerrarSesion");
botonRegistro.addEventListener("click", (e) => {
    contenedorInicioSesion.className = "contenedorInactivo";
    contenedorRegistroSesion.className = "contenedorFormulario animate__animated animate__fadeInDownBig ";
    contenedorTieneCuenta.className = "";
    contenedorNoTieneCuenta.className = "contenedorInactivo"
});
//Evento para cambiar a formulario de Ingreso
botonIngreso.addEventListener("click", (e) => {
    contenedorRegistroSesion.className = "contenedorInactivo";
    contenedorInicioSesion.className = "contenedorFormulario animate__animated animate__fadeInDownBig ";
    contenedorTieneCuenta.className = "contenedorInactivo";
    contenedorNoTieneCuenta.className = "";
});

//Evento si se Inicia Sesion
let usuarioActual = "";
const botonInicio = document.getElementById("iniciar");
botonInicio.addEventListener("click", (e) => {
    e.preventDefault();
    const mail = document.getElementById("mail").value;
    const pass = document.getElementById("pass").value;
    if (cajeroTGark.ingresar(mail, pass)) {
        Swal.fire('Se Ingreso Correctamente');
        const nombreUsuario = document.getElementById("nombreUsuario");
        const mailUsuario = document.getElementById("mailUsuario");
        usuarioActual = cajeroTGark.usuarios[cajeroTGark.usuarioEnLinea];
        nombreUsuario.innerText = usuarioActual.nombre;
        mailUsuario.innerText = usuarioActual.mail;
        const saldoPesos = document.getElementById("saldoCuentaPesos");
        const saldoDolares = document.getElementById("saldoCuentaDolares")
        saldoPesos.innerText = `AR$ ${usuarioActual.pesos}`;
        saldoDolares.innerText = `U$D ${usuarioActual.dolares}`
        contenedorInicioRegistro.className = "contenedorInactivo"
        contenedorWallet.className = "contenedorWallet animate__animated animate__fadeInLeftBig"
        tipoCuenta.innerText = "(AR$)"
        cerrarSesion.className = "dropdown-item"


    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Contraseña o mail Incorrectos'
        });
    }

});

//Evento Si se Registra Usuario
const botonRegistrarse = document.getElementById("registrarse");
botonRegistrarse.addEventListener("click", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const mail = document.getElementById("mailRegister").value;
    const pass = document.getElementById("passRegister").value;
    const mailExistente = cajeroTGark.encontrarIndexUsuario("mail", mail);
    if (mailExistente != -1)
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Mail Existente'
        });
    else {
        cajeroTGark.registrarUsuario(mail, name, pass);
        Swal.fire({
            icon: 'success',
            title: 'Felicitaciones!',
            text: 'Usuario Registrado con Exito'
        });
        contenedorRegistroSesion.className = "contenedorInactivo";
        contenedorInicioSesion.className = "contenedorFormulario animate__animated animate__fadeInDownBig ";
    }

});


//---ACCIONES DE LA BILLETERA---//
const saldoPesos = document.getElementById("saldoCuentaPesos");
const saldoDolares = document.getElementById("saldoCuentaDolares");
const botonDolar = document.getElementById("dolar");
const botonPesos = document.getElementById("pesos");
const botonAgregarFondos = document.getElementById("agregarFondos");
const botonRetirarFondos = document.getElementById("retirarFondos");
const botonEnviarFondos = document.getElementById("enviarFondos");
const botonComprarDolares = document.getElementById("comprarDolares");
const acciones = document.getElementById("acciones")
const nombreAccion = document.getElementById("tipoAccion");
const tipoCuenta = document.getElementById("tipoCuenta");
const contenedorBotonesDolaresPesos = document.getElementById("botonesPesoDolar");


//Cambiar de Pesos a Dolares y viceversa
botonPesos.addEventListener("click", () => {
    botonPesos.className = "botonSeleccionado";
    botonDolar.className = "";
    saldoPesos.className = "animate__animated animate__flipInX";
    saldoPesos.addEventListener("animationend", () => {
        saldoPesos.className = "";;
    })
    saldoDolares.className = " contenedorInactivo";
    tipoCuenta.innerText = "(AR$)"

})
botonDolar.addEventListener("click", () => {
    botonDolar.className = "botonSeleccionado";
    botonPesos.className = "";
    saldoDolares.className = "animate__animated animate__flipInX";
    saldoDolares.addEventListener("animationend", () => {
        saldoDolares.className = "";;
    })
    saldoPesos.className = "contenedorInactivo";
    tipoCuenta.innerText = "(U$D)"
})
//Agregar Fondos
botonAgregarFondos.addEventListener("click", () => {
    contenedorBotonesDolaresPesos.className = "pesosDolares"
    acciones.innerHTML = `<label for="dineroAIngresar">Ingrese el Monto a depositar:</label>
    <input type="number" placeholder="0" id="dineroAIngresar">
    <button id="botonDepositar">Depositar</button>`;
    acciones.className = "acciones animate__animated animate__bounceInLeft "
    acciones.addEventListener("animationend", () => {
        acciones.className = "acciones"
    })
    const botonDepositar = document.getElementById("botonDepositar");
    botonDepositar.addEventListener("click", () => {
        const dineroIngresado = parseFloat(document.getElementById("dineroAIngresar").value);
        if (botonPesos.className === "botonSeleccionado") //Si el segundo parametro es 1, la operacion es en pesos, si es 2, sera en dolares
            cajeroTGark.ingresarDinero(dineroIngresado, 1);
        else
            cajeroTGark.ingresarDinero(dineroIngresado, 2);
    });
    nombreAccion.innerText = "Agregar Dinero";
});
//Retirar Fondos
botonRetirarFondos.addEventListener("click", () => {
    contenedorBotonesDolaresPesos.className = "pesosDolares"
    acciones.innerHTML = `<label for="dineroARetirar">Ingrese el Monto a Retirar:</label>
    <input type="number" placeholder="0" id="dineroARetirar">
    <button id="botonRetirar">Retirar</button>`;
    acciones.className = "acciones animate__animated animate__bounceInLeft "
    acciones.addEventListener("animationend", () => {
        acciones.className = "acciones"
    })
    const botonRetirar = document.getElementById("botonRetirar");
    botonRetirar.addEventListener("click", () => {
        const dineroIngresado = parseInt(document.getElementById("dineroARetirar").value);
        if (botonPesos.className === "botonSeleccionado")
            cajeroTGark.retirarDinero(dineroIngresado, 1);
        else
            cajeroTGark.retirarDinero(dineroIngresado, 2);
    });
    nombreAccion.innerText = "Retirar Dinero";
});

//Enviar Fondos A otras Cuentas
botonEnviarFondos.addEventListener("click", () => {
    contenedorBotonesDolaresPesos.className = "pesosDolares"
    acciones.innerHTML = `
    <label for="mailAEnviar">Ingrese el mail de la cuenta a Enviar Dinero:</label>
    <input type="mail" placeholder="aaa@aaaa.com" id="mailAEnviar">
    <label for="dineroAEnviar">Ingrese el Monto a Enviar:</label>
    <input type="number" placeholder="0" id="dineroAEnviar">
    <button id="botonEnviar">Envíar</button>`;
    acciones.className = "acciones animate__animated animate__bounceInLeft "
    acciones.addEventListener("animationend", () => {
        acciones.className = "acciones"
    })
    const botonEnviar = document.getElementById("botonEnviar");
    botonEnviar.addEventListener("click", () => {
        const mailAEnviar = document.getElementById("mailAEnviar").value;
        const dineroAEnviar = parseInt(document.getElementById("dineroAEnviar").value);
        if (botonPesos.className === "botonSeleccionado")
            cajeroTGark.enviarDinero(dineroAEnviar, mailAEnviar, 1);
        else
            cajeroTGark.enviarDinero(dineroAEnviar, mailAEnviar, 2);

    });
    nombreAccion.innerText = "Envíar Dinero ";

});

//Comprar Dolares
botonComprarDolares.addEventListener("click", () => {
    const criptoYa = "https://criptoya.com/api/dolar"
    saldoPesos.className = "";
    saldoDolares.className = "contenedorInactivo";
    contenedorBotonesDolaresPesos.className = "contenedorInactivo";
    acciones.innerHTML = `
    <div class="valorDolar">
        <p>Valor Dolar: <span id="valorDolarActual"></span> </p>
        
    </div>
    <label for="comprarDolar">Ingrese la cantidad comprar:</label>
    <input type="number" placeholder="0" value="0" id="comprarDolar">
    <p>Subtotal: <span id="subtotal" ></span></p>
    <button id="botonComprar">Comprar Dolares</button>`;
    acciones.className = "acciones animate__animated animate__bounceInLeft "
    acciones.addEventListener("animationend", () => {
        acciones.className = "acciones"
    })
    const botonComprar = document.getElementById("botonComprar")
    let valorDolarActual = document.getElementById("valorDolarActual");
    let subtotal = document.getElementById("subtotal");
    let dolar;
    setInterval(() => {
        fetch(criptoYa)
            .then(response => response.json())
            .then(({
                blue
            }) => {
                valorDolarActual.innerText = `AR$ ${blue}`;
                dolar = parseFloat(blue);
            })
            .catch(error => console.error(error))
    }, 200)
    let montoAComprar = document.getElementById("comprarDolar");
    montoAComprar.addEventListener("input", () => {
        subtotal.innerText = `AR$ ${parseFloat(montoAComprar.value)*dolar}`;
    })

    botonComprar.addEventListener("click", () => {
        cajeroTGark.comprarDolares(dolar, parseFloat(montoAComprar.value));
    })

    nombreAccion.innerText = "Compra de Dolares";
    tipoCuenta.innerText = ""
})

//---CERRAR CESION--//
cerrarSesion.addEventListener("click", () => {
    Swal.fire({
        title: 'Estás seguro que quieres salir?',
        text: "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Cerrar Sesion'
    }).then((result) => {
        if (result.isConfirmed) {
            cajeroTGark.usuarioEnLinea = -1;
            contenedorWallet.className = "contenedorInactivo"
            contenedorInicioRegistro.className = "contenedorInicioRegistro"
            contenedorRegistroSesion.className = "contenedorInactivo";
            contenedorInicioSesion.className = "contenedorFormulario animate__animated animate__fadeInDownBig ";
            contenedorTieneCuenta.className = "contenedorInactivo";
            contenedorNoTieneCuenta.className = "";
            document.getElementById("mail").value = "";
            document.getElementById("pass").value = "";
            Swal.fire(
                'Hecho!',
                'Nos Vemos Pronto!.',
            )
            cerrarSesion.className = "contenedorInactivo"
        }
    })

});