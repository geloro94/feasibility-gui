import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportQueryComponent } from './import-query.component';

describe('ImportQueryComponent', () => {
  let component: ImportQueryComponent;
  let fixture: ComponentFixture<ImportQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportQueryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
