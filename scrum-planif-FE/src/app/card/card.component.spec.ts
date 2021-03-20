import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [ CardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.value = "5";
    component.rank = "1";
    component.isDesactived = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('div')).classes["selected"]).toEqual(undefined);
    expect(fixture.debugElement.query(By.css('span')).nativeElement.textContent).toEqual("5");

  });

  it('should select on click', () => {
    let mySpy = spyOn(component.choosenEvent, 'emit').and.callThrough();
    component.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div')).classes["selected"]).toEqual(true);
    expect(mySpy).toHaveBeenCalledTimes(1);
  });

  it('should unselect on event - changeValue', () => {
    component.click();
    component.unselectedIfNot("5");
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div')).classes["selected"]).toEqual(true, 'not change');


    component.unselectedIfNot("7");
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div')).classes["selected"]).toEqual(undefined, 'change');
  });

  it('should unselect on event - admin leaves the game', () => {
    component.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div')).classes["selected"]).toEqual(true);

    //directly call ngOnChanges
    component.ngOnChanges({
      isDesactived: new SimpleChange(false, true, false)
    });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div')).classes["selected"]).toEqual(undefined);
  });

  it('should not select on click', () => {
    component.isDesactived = true;
    let mySpy = spyOn(component.choosenEvent, 'emit').and.callThrough();
    component.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('div')).classes["selected"]).toEqual(undefined);
    expect(mySpy).toHaveBeenCalledTimes(0);
  });
});
