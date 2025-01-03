import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { PlanifRoom } from '../planif.room/planif.room';
import { HandComponent } from './hand.component';
import { IoWebsocketMockService } from '../_rooms/io-websocket.mock.service';
import { IoWebsocketService } from '../_rooms/io-websocket.service';
import { CardComponent } from '../card/card.component';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


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
    imports: [RouterTestingModule, ReactiveFormsModule, FormsModule, ToastrModule.forRoot()],
    providers: [
        UntypedFormBuilder,
        ToastrService, // for PlanifRoom
        { provide: IoWebsocketService, useClass: IoWebsocketMockService } // for PlanifRoom
        ,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach((done) => {
    fixture = TestBed.createComponent(HandComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(IoWebsocketService);
    service.initMe({ref: "ref", name: "Admin", role: {isAdmin: true, isPlaying: false}});

    // Update the input planifRoom
    let pr : PlanifRoom = new PlanifRoom(service, TestBed.inject(ToastrService));
    component.planifRoom = pr;

    pr.init("init", false, () => {
      fixture.detectChanges();
      done();
    })
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should have cards', () => {
    // Change values by PlanifRoom : enough ?
    component.planifRoom.currentCardsList$.next(
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

  it('should select visible cards', () => {
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

  it('change should change cards game', () => {
    // Change values by PlanifRoom : enough ?
    component.planifRoom.currentCardsList$.next(
      [
        {value:"XS", active: true},{value:"S", active: true},{value:"M", active: true},
        {value:"L", active: true},{value:"XL", active: true},{value:"&#xf128", active: true},
        {value:"&#xf534;", active: true},{value:"&#xf0f4;", active: true}
      ]
    );
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(8, 'all card');
  });


  it('should change cards game with one inactive', () => {
    // Change values by PlanifRoom : enough ?
    component.planifRoom.currentCardsList$.next(
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

  it('new game should change cards game', () => {
    let pr : any = (component as any).planifRoom;
    let mySpy = spyOn(pr, 'sendNewGame').and.callFake(function(cardsGame : Array<any>) {
      // this <=> PlanifRoom
      this.ioWebsocketService.subjects.get("game_added_and_selected").next({cardsGameName : "name", cardsGame : cardsGame});
    })
    pr.sendNewGame([
      {value:"XXL", active: true},
      {value:"&#xf128", active: false},
      {value:"&#xf534;", active: false},
      {value:"&#xf0f4;", active: false}
    ]);
    fixture.detectChanges();

    // <=> expect(pr.sendTypeGame.calls.count()).toEqual(1);
    expect(mySpy).toHaveBeenCalledTimes(1);

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(1, 'all card');
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
      this.ioWebsocketService.subjects.get("player_join_planif").next({player: {ref: "ref", name: "Admin", vote: null}});
    })
    fixture.detectChanges();

    component.iVoteTop.setValue(true);
    component.iVoteChangeTop();
    fixture.detectChanges();

    expect(mySpy).toHaveBeenCalledTimes(1);

    // TODO see what is changing
  });

  it('admin should quit', () => {
    component.isAdmin = true;
    service.subjects.get("player_join_planif").next({player: {ref: "ref", name: "Admin", vote: null}});
    fixture.detectChanges();
    component.iVoteTop.setValue(true);
    component.iVoteChangeTop();
    fixture.detectChanges();

    let mySpy = spyOn((component as any).planifRoom, 'askToNotPlay').and.callFake(function() {
      // this <=> PlanifRoom
      // TODO check that the player is added
      this.ioWebsocketService.subjects.get("player_leave_planif").next({ player_ref: "ref"});
    })
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card')).length).toEqual(14);
  });

  it('admin with selected card should quit', () => {
    component.isAdmin = true;
    service.subjects.get("player_join_planif").next({player: {ref: "ref", name: "Admin", vote: null}});
    fixture.detectChanges();
    component.iVoteTop.setValue(true);
    component.iVoteChangeTop();
    fixture.detectChanges();

    let allCards = fixture.debugElement.queryAll(By.css('app-card>div'));
    allCards[1].nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('app-card div.selected')).length).toEqual(1);

    spyOn((component as any).planifRoom, 'askToNotPlay').and.callFake(function() {
      // this <=> PlanifRoom
      // TODO check that the player is added
      this.ioWebsocketService.subjects.get("player_leave_planif").next({ player_ref: "ref"});
    })
    component.iVoteTop.setValue(false);
    component.iVoteChangeTop();
    fixture.detectChanges();
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-card div.selected')).length).toEqual(0);

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
