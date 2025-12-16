import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento } from '../../models/movimiento.model';

@Component({
  selector: 'app-movimiento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.css']
})
export class MovimientoFormComponent {
  form: FormGroup;
  loading = false;

  descripcionOptions: string[] = [
    'Abono de otro banco QR',
    'Depósito Efectivo ATM Bisa',
    'Impuesto Retenido',
    'Pago de Interes',
    'Transferencia de Terceros QR',
    'TRF:GASTOS DE VIVIENDA'
  ];

  constructor(
    private fb: FormBuilder,
    private movimientoService: MovimientoService,
    public dialogRef: MatDialogRef<MovimientoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      fecha: [new Date(), Validators.required],
      descripcion: ['', Validators.required],
      debito: [null, [Validators.min(0)]],
      credito: [null, [Validators.min(0)]]
    }, { validators: this.atLeastOneAmountValidator });

    this.setupMutualExclusivity();
  }

  private setupMutualExclusivity(): void {
    const debitoControl = this.form.get('debito');
    const creditoControl = this.form.get('credito');

    if (debitoControl && creditoControl) {
      debitoControl.valueChanges.subscribe(value => {
        if (value !== null && value !== 0) {
          creditoControl.setValue(null, { emitEvent: false });
        }
      });

      creditoControl.valueChanges.subscribe(value => {
        if (value !== null && value !== 0) {
          debitoControl.setValue(null, { emitEvent: false });
        }
      });
    }
  }

  private atLeastOneAmountValidator(group: FormGroup): { [key: string]: any } | null {
    const debito = group.get('debito')?.value;
    const credito = group.get('credito')?.value;

    if ((!debito && !credito) || (debito === 0 && credito === 0)) {
      return { atLeastOneRequired: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      const movimiento: Movimiento = this.form.value;

      this.movimientoService.createMovimiento(movimiento).subscribe({
        next: (newMovimiento) => {
          this.loading = false;
          this.dialogRef.close(newMovimiento);
        },
        error: (err) => {
          console.error('Error creating movimiento:', err);
          this.loading = false;
          // Handle error (e.g., show a snackbar)
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
