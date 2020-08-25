import { TestBed, inject } from '@angular/core/testing';

import { IoWebsocketService } from './io-websocket.service';

describe('IowebsocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IoWebsocketService]
    });
  });

  it('should be created', inject([IoWebsocketService], (service: IoWebsocketService) => {
    expect(service).toBeTruthy();
  }));
});
