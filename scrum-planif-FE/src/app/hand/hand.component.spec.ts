import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { PlanifRoom } from '../planif.room/planif.room';
import { HandComponent } from './hand.component';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { CardComponent } from '../card/card.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';


describe('HandComponent', () => {
  let component: HandComponent;
  let fixture: ComponentFixture<HandComponent>;
  let service;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      declarations: [
        HandComponent,
        CardComponent
      ],
      imports: [RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        {provide: IoWebsocketService, useClass: IoWebsocketMockService} // for PlanifRoom
      ]
    })
    .compileComponents();
  });

  beforeEach((done) => {
    fixture = TestBed.createComponent(HandComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(IoWebsocketService);

    // Update the input planifRoom
    let pr : PlanifRoom = new PlanifRoom(service);
    component.planifRoom = pr;

    pr.init("init", () => {
      fixture.detectChanges();
      done();
    })
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should have cards', () => {
    // Change values by PlanifRoom : enough ?
    component.planifRoom.cardsList$.next(
      [
        {value:"0", active: true},{value:"1/2", active: true},{value:"1", active: true},
        {value:"2", active: true},{value:"3", active: true},{value:"5", active: true},
        {value:"8", active: true},{value:"13", active: true},{value:"20", active: true},
        {value:"40", active: true},{value:"100", active: true},{value:"&#xf128", active: true},
        {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
      ]
    );
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(14, 'all card');
    expect(fixture.debugElement.queryAll(By.css('#iVote')).length).toEqual(0);
  });

  it('should change cards', () => {
    // Change values by IoWebsocketMockService
    service.subjects.get("card_visibility_changed").next({cardIndex : 1, choosenVisibility : false});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(14-1, 'one card less');

    service.subjects.get("card_visibility_changed").next({cardIndex : 2, choosenVisibility : false});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(14-2, 'two card less');

    service.subjects.get("card_visibility_changed").next({cardIndex : 1, choosenVisibility : true});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(14-1);
  });

  it('should restart cards', () => {
    // Change values by PlanifRoom : enough ?
    component.planifRoom.cardsList$.next(
      [
        {value:"XS", active: true},{value:"S", active: true},{value:"M", active: true},
        {value:"L", active: true},{value:"XL", active: true},{value:"&#xf128", active: true},
        {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
      ]
    );
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(8, 'all card');
  });


  it('should restart cards with inactive', () => {
    // Change values by PlanifRoom : enough ?
    component.planifRoom.cardsList$.next(
      [
        {value:"XS", active: true},{value:"S", active: false},{value:"M", active: true},
        {value:"L", active: true},{value:"XL", active: true},{value:"&#xf128", active: true},
        {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
      ]
    );
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(7, 'all card');

    service.subjects.get("card_visibility_changed").next({cardIndex : 1, choosenVisibility : true});
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(8, 'one more');
  });

  it('admin could join', () => {
    component.isAdmin = true;
    fixture.detectChanges();

    let nbIVote = fixture.debugElement.queryAll(By.css('#iVoteTop')).length;
    nbIVote += fixture.debugElement.queryAll(By.css('#iVoteBottom')).length;
    expect(nbIVote).toEqual(2);
  });

  it('admin should join', () => {
    component.isAdmin = true;
    fixture.detectChanges();

    let mySpy = spyOn((component as any).planifRoom, 'askToPlay').and.callFake(function() {
      // this <=> PlanifRoom
      // TODO check that the player is added
      this.ioWebsocketService.subjects.get("player_join_planif").next({player: {ref: "ref2", name: "Admin"}});
    })
    fixture.detectChanges();

    component.iVoteTop.setValue(true);
    component.iVoteChangeTop();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(1);

    // TODO see what is changing
  });

  it('top form change bottom form', () => {
    component.isAdmin = true;
    fixture.detectChanges();

    component.iVoteTop.setValue(true);
    component.iVoteChangeTop();
    fixture.detectChanges();

    expect(component.iVoteBottom.value).toEqual(true);


    component.iVoteTop.setValue(false);
    component.iVoteChangeTop();
    fixture.detectChanges();

    expect(component.iVoteBottom.value).toEqual(false);
  });

  it('bottom form change top form', () => {
    component.isAdmin = true;
    fixture.detectChanges();

    component.iVoteBottom.setValue(true);
    component.iVoteChangeBottom();
    fixture.detectChanges();

    expect(component.iVoteTop.value).toEqual(true);


    component.iVoteBottom.setValue(false);
    component.iVoteChangeBottom();
    fixture.detectChanges();

    expect(component.iVoteTop.value).toEqual(false);
  });
});
