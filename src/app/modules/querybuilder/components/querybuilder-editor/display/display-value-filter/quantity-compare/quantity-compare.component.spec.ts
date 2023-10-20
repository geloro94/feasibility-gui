import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityCompareComponent } from './quantity-compare.component';

describe('QuantityCompareComponent', () => {
  let component: QuantityCompareComponent;
  let fixture: ComponentFixture<QuantityCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuantityCompareComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuantityCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
