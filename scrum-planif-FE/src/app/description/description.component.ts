import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { faCopy } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss']
})
export class DescriptionComponent {
  public urlLink = environment.linkUrl;
  public faCopy = faCopy;

  @Input() planif_ref: string;

  constructor( ) { }

  public copyElement(idElement) {
    let range = document.createRange();
    let selection = window.getSelection();
    range.selectNode(document.getElementById(idElement));
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        if (document.execCommand('copy')) {
          console.log('The copy succeed');
        }
    }
    catch(err) {
        console.error(err);
    }
  }

}
