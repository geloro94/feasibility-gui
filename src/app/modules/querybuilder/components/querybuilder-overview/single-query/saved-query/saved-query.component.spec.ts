import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedQueryComponent } from './saved-query.component';

describe('SavedQueryComponent', () => {
  let component: SavedQueryComponent;
  let fixture: ComponentFixture<SavedQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavedQueryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
