import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MovimientoService } from '../../services/movimiento.service';
import { Movimiento } from '../../models/movimiento.model';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './movimiento-form.component.html',
  styleUrls: ['./movimiento-form.component.css']
})
export class MovimientoFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  filteredOptions!: Observable<string[]>;

  @ViewChild('debitoInput') debitoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('creditoInput') creditoInput!: ElementRef<HTMLInputElement>;

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

    if (this.data) {
      this.form.patchValue({
        fecha: this.data.fecha,
        descripcion: this.data.descripcion,
        debito: this.data.debito,
        credito: this.data.credito
      });
    }

    this.setupMutualExclusivity();
  }

  ngOnInit() {
    this.filteredOptions = this.form.get('descripcion')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.descripcionOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedValue = event.option.value;
    const creditOptions = [
      'Abono de otro banco QR',
      'Depósito Efectivo ATM Bisa',
      'Pago de Interes'
    ];

    // Note: TRF:GASTOS DE VIVIENDA is usually a debit, but the user mentioned it in the list for Credit focus.
    // I will follow the user's specific list.
    const focusOnCredit = creditOptions.includes(selectedValue) || selectedValue === 'TRF:GASTOS DE VIVIENDA';

    if (selectedValue === 'TRF:GASTOS DE VIVIENDA') {
      this.form.get('credito')?.setValue(200);
    }

    setTimeout(() => {
      if (focusOnCredit) {
        this.creditoInput.nativeElement.focus();
      } else {
        this.debitoInput.nativeElement.focus();
      }
    }, 0);
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

      if (this.data && this.data._id) {
        this.movimientoService.updateMovimiento(this.data._id, movimiento).subscribe({
          next: (updatedMovimiento) => {
            this.loading = false;
            this.dialogRef.close(updatedMovimiento);
          },
          error: (err) => {
            console.error('Error updating movimiento:', err);
            this.loading = false;
          }
        });
      } else {
        this.movimientoService.createMovimiento(movimiento).subscribe({
          next: (newMovimiento) => {
            this.loading = false;
            this.dialogRef.close(newMovimiento);
          },
          error: (err) => {
            console.error('Error creating movimiento:', err);
            this.loading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
