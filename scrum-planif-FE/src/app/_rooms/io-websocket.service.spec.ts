import { TestBed, inject } from '@angular/core/testing';
import { AuthServiceMock } from '../auth.service/auth.mock.service';
import { AuthService } from '../auth.service/auth.service';

import { IoWebsocketService } from './io-websocket.service';

describe('IoWebsocketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IoWebsocketService,
        {provide: AuthService, useValue: new AuthServiceMock({ref: "ref", name: "Toto"})}
      ]
    });
  });

  it('should be created', inject([IoWebsocketService], (service: IoWebsocketService) => {
    expect(service).toBeTruthy();
  }));
});
