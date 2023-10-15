import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedTemplateComponent } from './saved-template.component';

describe('SavedTemplateComponent', () => {
  let component: SavedTemplateComponent;
  let fixture: ComponentFixture<SavedTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavedTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SavedTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
