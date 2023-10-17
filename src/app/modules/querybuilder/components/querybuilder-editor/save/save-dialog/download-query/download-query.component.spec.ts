import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadQueryComponent } from './download-query.component';

describe('DownloadQueryComponent', () => {
  let component: DownloadQueryComponent;
  let fixture: ComponentFixture<DownloadQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DownloadQueryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
