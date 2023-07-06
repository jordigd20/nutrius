import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  public enlaceWebCorporativa: string = '';
  public enlaceBlog: string = '';
  public enlaceContacto: string = '';

  constructor() { }

  ngOnInit(): void {
    this.enlaceWebCorporativa = `https://${location.host}/areka`;
    this.enlaceBlog = `https://${location.host}/areka/blog/`;
    this.enlaceContacto = `https://${location.host}/areka/contacto/`;
  }

}
