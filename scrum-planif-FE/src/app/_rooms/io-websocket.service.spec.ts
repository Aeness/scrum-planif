import { TestBed, inject } from '@angular/core/testing';

import { IowebsocketService } from './io-websocket.service';

describe('IowebsocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IowebsocketService]
    });
  });

  it('should be created', inject([IowebsocketService], (service: IowebsocketService) => {
    expect(service).toBeTruthy();
  }));
});
