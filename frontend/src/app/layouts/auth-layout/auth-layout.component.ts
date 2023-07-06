import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent implements OnInit {

  public enlaceWebCorporativa: string = '';

  constructor() { }

  ngOnInit(): void {
    this.enlaceWebCorporativa = `https://${location.host}/areka`;
  }

}
