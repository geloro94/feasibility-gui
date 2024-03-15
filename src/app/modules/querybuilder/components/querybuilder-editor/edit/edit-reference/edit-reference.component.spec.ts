import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReferenceComponent } from './edit-reference.component';

describe('EditReferenceComponent', () => {
  let component: EditReferenceComponent;
  let fixture: ComponentFixture<EditReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditReferenceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
