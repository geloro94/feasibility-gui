import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultantQueryComponent } from './resultant-query.component';

describe('ResultantQueryComponent', () => {
  let component: ResultantQueryComponent;
  let fixture: ComponentFixture<ResultantQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResultantQueryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultantQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
