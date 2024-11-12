# Proyecto Selección

Indice



## Front

### 1. Métodos principales de carga (Cargar datos)

#### 1.1 Carga de ofertas (cargarOfertas())

  - **Propósito**: Recuperar las ofertas desde el backend y procesarlas.
  - **Características importantes**:
      Crea una lista de tecnologías (tecnologiaLista), eliminando duplicados.
      Asigna los datos de las ofertas a ofertaLista.

---------------

>📝 [!NOTE]
>(la parte de tecnologia lista era una idea que tenia para hacer, ahora mismo solo almacena las tecnologias)
>
>Lo que hace es separar todas las entradas que esten separadas por ","
>
>Si tenia (Java, Angular, React) guarda cada una de las entradas en un array, en caso de que haya 2 Java no coge el segundo y asi solo >se mantienen valores unicos, la idea era que en el apartado de tecnologias pudieses autocompletar >cada vez que pusieses una ","
>
>Que pusieses J (te salgan todas las tecnologias por J) pusieses "," (Java, ) y luego A (te salgan todas las tecnologias por A) y asi >hasta poner todas las tecnolgias que quieras (Java, Angular, ....)

------------------

#### 1.2 Carga de una oferta por ID de candidato y ID de recruiting (cargarOfertas())

  - **Propósito**: Cargar una oferta específica, asociada a un candidato y su ID de recruiting, y rellenar un formulario con los datos obtenidos. Además cambia el boton de "Añadir" por la version de "Actualizar".
  - **Detalles adicionales**:
Si el ID (recruiting) existe, se llama a [cargarRecruitingPorID()](#19-carga-recruiting-por-id-cargarproyectoporid) el **1.9**.

#### 1.3 Carga de provincias (cargarProvincias())

  - **Propósito**: Carga la lista de nombres de provincias desde el backend, luego llama al [filtradoProvincias()](#filtrado) para autocompletar

#### 1.4 Carga de perfiles (cargarPerfiles())

  - **Propósito**: Carga la lista de nombres de perfiles desde el backend, luego llama al [filtradoPerfiles()](#filtrado) para autocompletar

#### 1.5 Carga de estados (cargarEstados())

  - **Propósito**: Carga la lista de nombres de estados desde el backend, luego llama al [filtradoEstados()](#filtrado) para autocompletar

#### 1.6 Carga de candidatos (cargarCandidatos())

  - **Propósito**: Carga la lista de nombres de candidatos y la lista de telefonos de candidatos desde el backend, luego llama al [filtradoCandidato()](#filtrado) para autocompletar

#### 1.7 Carga de candidato por nombre (cargarCandidatoPorNombre(nombre: string))

  - Es llamado por [filtradoCandidato()](#filtrado)

  - **Propósito**: En caso de encontrar un candidato que ya está en la base de datos este autocompletará el campo Teléfono que este relacionado a ese candidato y lo hará "OnlyReadeable" para que no se pueda tocar (En caso de querer actualizarlo habrá que actualizar cualquier oferta en la que esté el candiadto y ahí cambiar su teléfono)  

#### 1.8 Carga de recruiting (cargarRecruiting())

  - **Propósito**: Carga la lista de ID de recruiting y la lista de nombres de proyectos relacionados a los ID de recruiting desde el backend, luego llama al [filtadoRecruiting()](#filtrado) y [filtadoProyectos()](#filtrado) para autocompletar

#### 1.9 Carga recruiting por ID (cargarProyectoPorID())

  - **Propósito**: En caso de encontrar un ID que ya está en la base de datos este autocompletará el campo proyecto y la empresa que este relacionado a ese ID  y lo hará "OnlyReadeable" para que no se pueda tocar (En caso de querer actualizarlo habrá que actualizar cualquier oferta en la que esté ese ID y ahí cambiar el proyecto o la empresa)  

#### 1.10 Carga de empresas (cargarEmrpesas())

- **Propósito**: Carga la lista de nombres de empresas desde el backend, luego llama al [filtadoEmpresas()](#filtrad) para autocompletar

### 2 FILTRADO

- **Propósito**