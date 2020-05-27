# Arquitectura de Software
## Clase 9 - Exception handling
### Objetivos

* Exception handling en Node.js
* Revisión de diferencias entre sync/async

### Error handling en Node.js

Cuando detectamos una *exception* el sistema tiene que gestionarlo de alguna manera, lo mas sencillo que podemos realizar es simplemente un *crash* del sistema aunque desde el punto de vista de la disponibilidad, usabilidad y sentido común es una muy mala decisión.
Existen otras posibilidades para gestionar errores, Javascript como muchos otros lenguajes ya contempla esta problemática de manera nativa.
Para gestionar nuestros errores de manera efectiva antes tenemos que entender los conceptos de:

* Objeto [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
* [Try...catch...finally](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
* [Throw](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw)
* [Call stack](https://developer.mozilla.org/en-US/docs/Glossary/Call_stack)
* Nombres de funciones
* Mundo asíncrono como [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) y [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)/[await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)

### Ejemplos

#### Creando y lanzando errores

Existen tipos de errores predefinidos como por ejemplo:

* EvalError
* RangeError
* SyntaxError
* TypeError
* URIError

Para crear un nuevo error simplemente hacemos:

``` javascript
new Error('Uups, error occurred');
```

Si queremos lanzar un error entonces utilizamos la palabra reservada *throw*

``` javascript
throw new Error('This error will be thrown');
```

En caso de querer implementar un error propio simplemente extendemos *Error*

``` javascript
class CustomError extends Error {
    constructor(args){
        super(args);
        this.name = 'CustomError';
    }
}
throw new CustomError('This error will be thrown');
```

Cada vez que detectemos una exception en nuestro codigo podemos lanzar un nuevo error, pero también tenemos que estar preparados para gestionar ese error.

#### Capturando errores lanzados

``` javascript
function divide(a, b) {
    if (b == 0) {
        throw new Error('Cannot divide by zero!');
    }
    return a / b;
}
function init() {
    try {
        console.log(divide(10, 2));
        console.log(divide(10, 0));
    } catch(e) {
        console.log(e);
    }
}
init();
```

Importancia sobre los nombres de las funciones

``` javascript
(function first() {
 (function second() {
   (function third() {
     throw new Error('See stacktrace!');
    })();
  })();
})();

(function() {
 (function() {
   (function() {
     throw new Error('See stacktrace!');
    })();
  })();
})();
```

Que sucede con el manejo de errores en el mundo asíncrono:

```javascript
try {
    throw new Error('Here is an error');
} catch(e) {
    console.log(e);
}

try {
    setTimeout(() => {
        throw new Error('Here is an error');
    }, 0);
} catch(e) {
    console.log(e);
}
```
1. Callbacks
    ```javascript
    function asyncFunction(input, cb) {
        setTimeout(() => {
            if (input <= 10) {
                cb(null, `Input is ${input}`);
            } else {
                cb(new Error('Input should be less than or equals to 10'));
            }
        }, 1000);
    }

    asyncFunction(20, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    });

    asyncFunction(5, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    });
    ```

2. Promises
    ```javascript
    function asyncFunction(input, cb) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (input <= 10) {
                    resolve(`Input is ${input}`);
                } else {
                    reject(new Error('Input should be less than or equals to 10'));
                }
            }, 1000);
        });
    }

    asyncFunction(20)
        .then((result) => console.log(result))
        .catch((err) => console.log(err));

    asyncFunction(5)
        .then((result) => console.log(result))
        .catch((err) => console.log(err));
    ```

3. Async/Await
    ``` javascript
    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function asyncFunction(input) {
        await timeout(1000);
        if (input <= 10) {
            return `Input is ${input}`;
        } else {
            throw new Error('Input should be less than or equals to 10');
        }
    }

    (async () => {
        try {
            let result = await asyncFunction(20);
            console.log(result);
        } catch (err) {
            console.log(err)
        }
    })();

    (async () => {
        try {
            let result = await asyncFunction(5);
            console.log(result);
        } catch (err) {
            console.log(err)
        }
    })();
    ```

### Ejercicio

Las APIs que proveemos, tambien necesitan ser capaces de responder ante errores que puedan suceder durante el manejo de una request. Esto implica que dichos errores sean expresivos, como tambien consistentes para que puedan ser manejados correctamente por los clientes.

Para desarrollar estos conceptos, vamos a extender los endpoints de la API desarrollada durante la clase anterior de manera tal, que ante eventos de error durante el procesamiento de una request, podamos obtener la siguiente respuesta:

#### Ejemplo de respuesta de error

```json
{
    "errors": [
        {
            "code": 123,
            "message": "Este es un mensaje de error descriptivo"
        }
    ]
}

```

Las respuestas de errore estaran compuesta por un `Array` de objetos de error. Cada objeto de error debe tener un código único que lo represente, como también un mensaje que agrege información sobre el mismo.

Los errores, también deben ser devueltos haciendo uso del código HTTP correspondiente. Por ejemplo, si un usuario no está autorizado para acceder a determinado endpoint, se deberá retornar un código HTTP `403`.

#### Nuevas validaciones

1. **POST** */orders*

    **1a.** Se debe validar que el cliente que desea crear una orden tenga los permisos correspondientes.

    **1b.** Se debe validar que la orden posea al menos 1 item.

    **1c.** Se debe validar que todos los items de la orden posean tanto una `id` como `description`.

    En el caso de que las validaciones no se cumplan, se debera devolver los errores que se detectaron en la respuesta (discutir errores de autorizacion y errores de validación).


2. **GET** */orders*, **GET** */orders/:id*

    **2a.** Se debe validar que el cliente que desea crear una orden tenga los permisos correspondientes.

Los códigos elegidos para los errores quedan a elección, en la medida que ante mismo error se devuelva siempre el mismo.
