import { CommonModule } from '@angular/common';
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
import { Ubicacion } from '../models/modelUbicacion/ubicacion.model';
import { UbicacionService } from '../services/serviceUbicacion/ubicacion.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

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
    MatSelectModule
  ],
  providers: [OfertasService, UbicacionService]
})
export class CandidatosOfertadosComponent implements OnInit {
  candidatoForm: FormGroup;
  ofertaLista = new MatTableDataSource<Ofertas>([]);
  provinciaLista: Ubicacion[];

  displayedColumns: string[] = [
    'candidato', 
    'codope', 
    'idPeticion', 
    'proyecto', 
    'cliente', 
    'ubicacion', 
    'perfil', 
    'tecnologia', 
    'estado', 
    'fechaActualizacion', 
    'resumen'
  ];

  constructor(
    private fb: FormBuilder, 
    private ofertaService: OfertasService, 
    private ubicacionService: UbicacionService,
    private dialog: MatDialog
  ) {
    this.candidatoForm = this.fb.group({
      candidato: ['', Validators.required],
      codope: ['', Validators.required],
      proyecto: ['', Validators.required],
      cliente: ['', Validators.required],
      ubicacion: ['', Validators.required],
      perfil: ['', Validators.required],
      tecnologia: ['', Validators.required],
      experiencia: ['', [Validators.required, Validators.min(0)]],
      salario: ['', [Validators.required, Validators.min(0)]],
      estado: ['', Validators.required],
      fechaActualizacion: ['', Validators.required],
      resumen: ['']
    });
  }

  ngOnInit() {
    this.cargarOfertas();
    this.cargarProvincias();
  }

  cargarOfertas() {
    this.ofertaService.getOfertas().subscribe(
      data => {
        this.ofertaLista.data = data;
      },
      error => {
        console.error('Error al cargar las ofertas:', error);
      }
    );
  }

  cargarProvincias() {
    this.ubicacionService.getUbicaciones().subscribe(
      data => {
        this.provinciaLista = data;
      },
      error => {
        console.error('Error al cargar las provincias:', error);
      }
    );
  }

  onSubmit() {
    if (this.candidatoForm.valid) {
      const nuevoCandidato = this.candidatoForm.value;
      this.ofertaLista.data = [...this.ofertaLista.data, nuevoCandidato];
      this.candidatoForm.reset();
    } else {
      console.log('Formulario no válido');
    }
  }

  openPopup(prueba: Ofertas): void {
    const dialogRef = this.dialog.open(DialogContent, {
      width: '400px',
      data: {
        observaciones: prueba.observaciones,
        salario: prueba.salario,
        experiencia: prueba.experiencia,
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
  <p style="margin-bottom: 20px;">
    <strong>Experiencia:</strong> {{ data.experiencia }}
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