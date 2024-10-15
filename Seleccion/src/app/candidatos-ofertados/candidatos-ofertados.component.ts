import { CommonModule, provideCloudinaryLoader } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OfertasService } from '../services/serviceOfertas/ofertas.service';
import { HttpClientModule } from '@angular/common/http';
import { Ofertas } from '../models/modelOfertas/ofertas.model';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UbicacionService } from '../services/serviceUbicacion/ubicacion.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PuestoService } from '../services/servicePuesto/puesto.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { from, map, Observable, startWith } from 'rxjs';
import { EstadoService } from '../services/serviceEstado/estado.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CandidatosService } from '../services/serviceCandidatos/candidatos.service';
import { RecruitingService } from '../services/serviceRecruiting/recruiting.service';
import { EmpresaService } from '../services/serviceEmpresa/empresa.service';
import * as Papa from 'papaparse';
import { LoadingComponent } from '../loading/loading.component'; // Asegúrate de importar el componente
interface CsvRow {
  [key: string]: string | null; // Index signature para claves dinámicas
}

@Component({
  selector: 'app-candidatos-ofertados',
  templateUrl: './candidatos-ofertados.component.html',
  styleUrls: ['./candidatos-ofertados.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    HttpClientModule, 
    MatButtonModule, 
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatToolbarModule, 
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatMenuModule,
    LoadingComponent,
  ],
  providers: [OfertasService, UbicacionService, PuestoService, EstadoService, CandidatosService, RecruitingService, EmpresaService]
})

export class CandidatosOfertadosComponent implements OnInit {
  faHome = faHome;
  formVisible: boolean = false;
  isReadonlyProyecto: boolean = false;
  loading: boolean = false;
  insertado: boolean = false;
  mensajeInsertado: string = "";
  candidatoForm: FormGroup;
  ofertaLista = new MatTableDataSource<Ofertas>([]);
  provinciaLista: string[];
  perfilesLista: string[];
  estadoLista: string[];
  tecnologiaLista: string[];
  candidatoLista: string[];
  empresaLista: string[];
  recruitingLista: number[];
  proyectoLista: string[];
  proyecto: string = '';
  empresa: string = '';
  codope: string = 'IACA';
  filtroProvincias!: Observable<string[]>;  // Observable para el autocompletado
  filtroPerfiles!: Observable<string[]>;  // Observable para el autocompletado
  filtroTecnologias!: Observable<string[]>; 
  filtroCandidatos!: Observable<string[]>;
  filtroRecruitings!: Observable<number[]>;
  filtroEstados!: Observable<string[]>;
  filtroEmpresas!: Observable<string[]>;
  filtroProyectos!: Observable<string[]>;
  fecha: Date = new Date();  
  mostrarCampoOtro = false;
  displayedColumns: string[] = [
    'candidato', 
    'telefono',
    'codope', 
    'idPeticion', 
    'proyecto', 
    'cliente', 
    'ubicacion', 
    'perfil', 
    'tecnologia', 
    'estado', 
    'fechaActualizacion', 
    'resumen',
    'actu'
  ];

  constructor(
    private fb: FormBuilder, 
    private ofertaService: OfertasService, 
    private ubicacionService: UbicacionService,
    private puestoService: PuestoService,
    private estadoService: EstadoService,
    private candidatoService: CandidatosService,
    private recruitingService: RecruitingService,
    private empresaService: EmpresaService,
    private dialog: MatDialog
  ) {
    const mensajeGuardado = localStorage.getItem('mensajeInsertado');
    if (mensajeGuardado) {
      this.mensajeInsertado = mensajeGuardado;
      this.insertado = true;
    }
    this.candidatoForm = this.fb.group({
      candidato: ['', Validators.required],
      codope: [''],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{9}')]],
      idPeticion: ['', [Validators.required, Validators.min(0)]],
      url:['', [Validators.required, Validators.min(0)]],
      proyecto: ['', Validators.required],
      cliente: ['', Validators.required],
      ubicacion: ['', Validators.required],
      perfil: ['', Validators.required],
      tecnologia: [''],
      experiencia: ['', [Validators.min(0)]],
      salario: ['', [Validators.min(0)]],
      tarifa: ['', [Validators.min(0)]],
      rentabilidadCliente: ['', [Validators.min(0)]],
      rentabilidadPropuesta: ['', [Validators.min(0)]],
      estado: [new Date(), Validators.required],
      fechaActualizacion: ['', Validators.required],
      resumen: ['']
    });
  }

  ngOnInit() {
    this.cargarOfertas();
    this.cargarProvincias();
    this.cargarPerfiles();   
    this.cargarEstados(); 
    this.cargarCandidato();
    this.cargarRecruiting();
    this.cargarEmpresas();
  }

  

  // -------------------------------------------------------------------------------------------------------------

  //      Carga de datos

  // -------------------------------------------------------------------------------------------------------------

  cargarOfertas() {
    this.ofertaService.getOfertas().subscribe(
      data => {
        this.ofertaLista.data = data

        this.tecnologiaLista = data.flatMap(oferta => oferta.tecnologias.split(',').map(t => t.trim()));
        this.tecnologiaLista = Array.from(new Set(this.tecnologiaLista)); // Elimina duplicados
      },
      error => {
        console.error('Error al cargar las ofertas:', error);
      }
    );
  }



  cargarProvincias() {
    this.ubicacionService.getUbicaciones().subscribe(
      data => {
        this.provinciaLista = data.map(provincia => provincia.nombreProvincia);
        // Llama a filtrado aquí luego de cargar provincias
        this.filtradoProvincias();
      },
      error => {
        console.error('Error al cargar las provincias:', error);
      }
    );
  }

  cargarPerfiles() {
    this.puestoService.getPuestos().subscribe(
      data => {
        this.perfilesLista = data.map(puesto => puesto.nombrePuesto);
        // Llama a filtrado aquí después de cargar perfiles
        this.filtradoPerfiles();
      },
      error => {
        console.error('Error al cargar los perfiles:', error);
      }
    );
  }

  cargarEstados() {
    this.estadoService.getEstados().subscribe(
      data => {
        this.estadoLista = data.map(estado => estado.estado);
        // Llama a filtrado aquí después de cargar estados
        this.filtradoEstados();
      },
      error => {
        console.error('Error al cargar los estados:', error);
      }
    );
  }

  cargarCandidato() {
    this.candidatoService.getCandidatos().subscribe(
      data => {
        this.candidatoLista = data.map(candidato => candidato.nombreCandidato);
        // Llama a filtrado aquí después de cargar estados
        this.filtradoCandidato();
      },
      error => {
        console.error('Error al cargar los estados:', error);
      }
    );
  }

  cargarRecruiting() {
    this.recruitingService.getRecruitings().subscribe(
      data => {
        this.recruitingLista = data.map(recruiting => recruiting.idRecruiting);
        this.proyectoLista = data.map(proyecto => proyecto.nombreProyecto);
        // Llama a filtrado aquí después de cargar estados
        this.filtradoRecruiting();
        this.filtradoProyectos();
      },
      error => {
        console.error('Error al cargar los estados:', error);
      }
    );
  }

  cargarProyectoPorID(id: number) {
    this.recruitingService.getRecruitingIdrecruiting(id).subscribe(
      data => {
        if (data) {
          this.candidatoForm.patchValue({
            proyecto: data.nombreProyecto,
            cliente: data.empresa.nombreEmpresa,
          });
          this.isReadonlyProyecto = true; // Hacer que el campo sea solo lectura si existe proyecto
        } else {
          this.candidatoForm.patchValue({
            proyecto: '',
            cliente: '',
          });
          this.isReadonlyProyecto = false; // Permitir edición si no hay proyecto
        }
      },
      error => {
        console.error('Error al cargar el proyecto:', error);
        this.candidatoForm.patchValue({
          proyecto: '',
          cliente: '',
        });
        this.isReadonlyProyecto = false; // Permitir edición si hay error
      }
    );
  }
  

  cargarEmpresas() {
    this.empresaService.getEmpresas().subscribe(
      data => {
        this.empresaLista = data.map(empresa => empresa.nombreEmpresa);
        this.filtradoEmpresas();
      }
    )
  }




  // -------------------------------------------------------------------------------------------------------------

  //      Filtro Selects

  // -------------------------------------------------------------------------------------------------------------

  filtroCandidato(value: string): string[] {
    const filtroCandidato = value.toLowerCase();
    return this.candidatoLista.filter(option => option.toLowerCase().includes(filtroCandidato));
  }

  filtradoCandidato() {
    this.filtroCandidatos = this.candidatoForm.get('candidato')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtroCandidato(value || ''))
    );
  }

  filtroRecruiting(value: number): number[] {
    return this.recruitingLista.filter(option => option === value);
  }
  
  filtradoRecruiting() {
    this.filtroRecruitings = this.candidatoForm.get('idPeticion')!.valueChanges.pipe(
      startWith(null), 
      map(value => {
        const recruitingValue = Number(value);
        // Llama al método para verificar si el proyecto existe
        if (!isNaN(recruitingValue)) {
          this.cargarProyectoPorID(recruitingValue);
        }
        return this.filtroRecruiting(recruitingValue);
      })
    );
  }
  filtroEmpresa(value: string): string[] {
    const filtroEmpresa = value.toLowerCase();
    return this.empresaLista.filter(option => option.toLowerCase().includes(filtroEmpresa));
  }

  filtradoEmpresas() {
    this.filtroEmpresas = this.candidatoForm.get('cliente')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtroEmpresa(value || ''))
    );
  }
  
  filtroProyecto(value: string): string[] {
    const filtroProyecto = value.toLowerCase();
    // Usamos Set para eliminar duplicados
    return Array.from(new Set(this.proyectoLista))
      .filter(option => option.toLowerCase().includes(filtroProyecto));
  }

  filtradoProyectos() {
    this.filtroProyectos = this.candidatoForm.get('proyecto')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtroProyecto(value || ''))
    );
  }

  filtroProvincia(value: string): string[] {
    const filtroProvincia = value.toLowerCase();
    return this.provinciaLista.filter(option => option.toLowerCase().includes(filtroProvincia));
  }

  filtradoProvincias() {
    this.filtroProvincias = this.candidatoForm.get('ubicacion')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtroProvincia(value || ''))
    );
  }

  filtroPerfil(value: string): string[] {
    const filtroPerfil = value.toLowerCase();
    return this.perfilesLista.filter(option => option.toLowerCase().includes(filtroPerfil));
  }

  filtradoPerfiles() {
    this.filtroPerfiles = this.candidatoForm.get('perfil')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtroPerfil(value || ''))
    );
  }

  filtroEstado(value: string): string[] {
    const filtroEstado = value.toLowerCase();
    return this.estadoLista.filter(option => option.toLowerCase().includes(filtroEstado));
  }

  filtradoEstados() {
    this.filtroEstados = this.candidatoForm.get('estado')!.valueChanges.pipe(
      startWith(''),
      map(value => this.filtroEstado(value || ''))
    );
  }

  onSubmit() {
    if (this.candidatoForm.valid) {
      const formValues = this.candidatoForm.value;
  
      // Construir el objeto en el formato deseado
      const nuevoCandidato = {
        usuario: {
          codope: "BAC",
          contraseña: "contraseña_default", // Ajusta según sea necesario
          activo: true
        },
        recruiting: {
          empresa: {
            nombreEmpresa: formValues.cliente, // Asumiendo que 'cliente' corresponde a 'nombreEmpresa'
            activo: true,
            idEmpresa: 0 // Autocompletado o manejado en el backend
          },
          nombreProyecto: formValues.proyecto,
          activo: true,
          url: formValues.url,
          idRecruiting: formValues.idPeticion // Autocompletado o manejado en el backend
        },
        ubicacion: {
          nombreProvincia: formValues.ubicacion,
          activo: true,
          idUbicacion: 0 // Autocompletado o manejado en el backend
        },
        puesto: {
          nombrePuesto: formValues.perfil,
          activo: true,
          idPuesto: 0 // Autocompletado o manejado en el backend
        },
        tecnologias: formValues.tecnologia,
        experiencia: formValues.experiencia,
        salario: formValues.salario,
        tarifa: formValues.tarifa, // Ajusta según sea necesario
        rentabilidadCliente: formValues.rentabilidadCliente, // Ajusta según sea necesario
        rentabilidadClienteIncorpor: formValues.rentabilidadPropuesta, // Ajusta según sea necesario
        estado: {
          estado: formValues.estado,
          activo: true,
          idEstado: 0 // Autocompletado o manejado en el backend
        },
        fechaActualizacion: new Date().toISOString(), // Establecer la fecha actual
        observaciones: formValues.resumen, // Ajusta según sea necesario
        historicoCambioEstados: "", // Ajusta según sea necesario
        candidato: {
          nombreCandidato: formValues.candidato,
          telefono: formValues.telefono,
          activo: true,
          idCandidato: 0 // Autocompletado o manejado en el backend
        },
        activo: true,
        idOferta: 0 // Autocompletado o manejado en el backend
      };
      // Aquí puedes enviar 'nuevoCandidato' al servidor
      this.ofertaService.postOferta(nuevoCandidato).subscribe(
        response => {
          console.log('Oferta enviada con éxito:', response);
          this.mensajeInsertado = `Se ha añadido la oferta de: <br> ${formValues.candidato} <br> con ID de petición: <br> ${formValues.idPeticion}`;
          localStorage.setItem('mensajeInsertado', this.mensajeInsertado);
          location.reload();
        },
        error => {
          console.error('Error al enviar la oferta:', error);
          if (error.error) {
            console.error('Detalles del error:', error.error); // Detalles adicionales del error
          }
        }
      );
      // Resetear el formulario
      this.candidatoForm.reset();
    } else {
      console.log('Formulario no válido');
    }
  }


  async importCSV(event: Event) {
    const fileInput = event.target as HTMLInputElement | null;
    if (!fileInput || !fileInput.files) {
        console.error('El archivo no ha sido seleccionado.');
        return;
    }

    const file = fileInput.files[0]; // Obtener el archivo seleccionado
    this.loading = true;
    Papa.parse<CsvRow>(file, {
        header: true, // Convertir las líneas en objetos usando los encabezados
        skipEmptyLines: true, // Ignorar líneas vacías en el CSV
        complete: async (results) => {
            const totalRegistros = results.data.length; // Contar el total de registros
            console.log(totalRegistros);
            let registrosEnviados = 0; // Contador de registros enviados

            for (const row of results.data) {
                // Construir el objeto en el formato deseado
                const nuevoCandidato = {
                    usuario: {
                        codope: row['CODOPE'], // Mapear codope desde el CSV
                        contraseña: "contraseña_default", // Ajusta según sea necesario
                        activo: true
                    },
                    recruiting: {
                        empresa: {
                            nombreEmpresa: row['CLIENTE'], // Asumiendo que 'CLIENTE' corresponde a 'nombreEmpresa'
                            activo: true,
                            idEmpresa: 0 // Autocompletado o manejado en el backend
                        },
                        nombreProyecto: row['PROYECTO'],
                        activo: true,
                        url: null,
                        idRecruiting: row['ID PETICIÓN'] // Autocompletado o manejado en el backend
                    },
                    ubicacion: {
                        nombreProvincia: row['UBICACIÓN'],
                        activo: true,
                        idUbicacion: 0 // Autocompletado o manejado en el backend
                    },
                    puesto: {
                        nombrePuesto: row['PERFIL'],
                        activo: true,
                        idPuesto: 0 // Autocompletado o manejado en el backend
                    },
                    tecnologias: row['TECNOLOGÍA'], // Asumiendo que esto es una lista o un string
                    experiencia: row['AÑOS EXPERIENCIA'], // Ajusta según sea necesario
                    salario: parseFloat(row['SALARIO (SB)']?.replace(',', '.') || '0'), // Convertir a número
                    tarifa: parseFloat(row['TARIFA  DE INCORPORACIÓN']?.replace(',', '.') || '0'), // Convertir a número
                    rentabilidadCliente: parseFloat(row['RENTABILIDAD QUE CORRESPONDE AL CLIENTE']?.replace(',', '.') || '0'), // Convertir a número
                    rentabilidadClienteIncorpor: parseFloat(row['RENTABILIDAD APLICADA AL CLIENTE EN LA INCORPORACIÓN']?.replace(',', '.') || '0'), // Convertir a número
                    estado: {
                        estado: row['ESTADO'],
                        activo: true,
                        idEstado: 0 // Autocompletado o manejado en el backend
                    },
                    fechaActualizacion: new Date().toISOString(), // Establecer la fecha actual
                    observaciones: row['RESUMEN'], // Ajusta según sea necesario
                    historicoCambioEstados: "", // Ajusta según sea necesario
                    candidato: {
                        nombreCandidato: row['CANDIDATO'],
                        telefono: row['TELEFONO'] || null, // Asegúrate de que existe este campo en tu CSV
                        activo: true,
                        idCandidato: 0 // Autocompletado o manejado en el backend
                    },
                    activo: true,
                    idOferta: 0 // Autocompletado o manejado en el backend
                };

                try {
                    const response = await this.ofertaService.postOferta(nuevoCandidato).toPromise();
                    console.log('Oferta enviada con éxito:', response);
                    registrosEnviados++;
                } catch (error) {
                    console.error('Error al enviar la oferta:', error);
                    if (typeof error === 'object' && error !== null && 'error' in error) {
                        console.error('Detalles del error:', (error as { error?: any }).error); // Acceder a error de forma segura
                    }
                }
            }
            this.mensajeInsertado = `Todos los registros han sido procesados. Registros añadidos: ${registrosEnviados}/${totalRegistros}`;
            localStorage.setItem('mensajeInsertado', this.mensajeInsertado);
            // Recargar la página una vez que se han procesado todos los registros
            location.reload();
        }
    });
}




    
  // -------------------------------------------------------------------------------------------------------------

  //     PopUP observaciones Y Botones visibilidaes

  // -------------------------------------------------------------------------------------------------------------

  verFormAnadir(): void {
    this.formVisible = !this.formVisible; // Cambiar el estado de la variable
  }

  openPopup(oferta: Ofertas): void {
    const dialogRef = this.dialog.open(DialogContent, {
      width: '600px',
      data: {
        observaciones: oferta.observaciones,
        salario: oferta.salario,
        tarifa: oferta.tarifa,
        experiencia: oferta.experiencia,
        historico: oferta.historicoCambioEstados,
        rentabilidadCliente: oferta.rentabilidadCliente,
        rentabilidadClienteIncorpor: oferta.rentabilidadClienteIncorpor,
      }
    });
  }
}

// Componente del diálogo
@Component({
  selector: 'dialog-content',
  template: `
<h1 mat-dialog-title class="dialog-title" style="text-align: center; color: #007bff; font-size: 24px; margin-bottom: 20px;">
  Resumen
</h1>
<div mat-dialog-content class="dialog-content" style="padding: 20px; line-height: 1.6; font-size: 16px; color: #333;">
  <p style=" margin-bottom: 10px;">
    <strong>Observaciones:</strong> {{ data.observaciones }}
  </p>
  <p style="margin-bottom: 10px;">
    <strong>Salario:</strong> {{ data.salario}} €
  </p>
  <p style="margin-bottom: 10px;">
    <strong>Tarifa:</strong> {{ data.tarifa}} €
  </p>
  <p style="margin-bottom: 10px;">
    <strong>Rentabilidad pedida por el Cliente:</strong> {{ data.rentabilidadCliente}} %
  </p>
  <p style="margin-bottom: 10px;">
    <strong>Rentabilidad aplicada al cliente en la incorporacion:</strong> {{ data.rentabilidadClienteIncorpor}} %
  </p>
  <p style="margin-bottom: 10px;">
    <strong>Experiencia:</strong> {{ data.experiencia }} año/s
  </p>
  <p style="margin-bottom: 20px;">
    <strong>Histórico:</strong> <span [innerHTML]="data.historico"></span>
  </p>
</div>
<div mat-dialog-actions class="dialog-actions" style="display: flex; justify-content: center; padding: 10px;">
  <button mat-stroked-button color="warn" (click)="onClose()" style="padding: 10px 20px; font-weight: bold;">
    Cerrar
  </button>
</div>
  `,
})
export class DialogContent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<DialogContent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
