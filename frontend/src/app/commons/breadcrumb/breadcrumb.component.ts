import { Component, OnInit } from '@angular/core';
import { Subscription, filter, map } from 'rxjs';
import { Router, ActivationEnd, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

  public titulo: string = '';
  public breadcrumbs: any[] = [];
  private subs$: Subscription;
  public uidMenu: string = '';

  constructor(private router: Router,
              private route: ActivatedRoute) {
    this.subs$ = this.cargarBreadcrumbs()
                  .subscribe( (data: any) => {
                   this.titulo = data.titulo;
                   this.breadcrumbs = data.breadcrumbs;
                });
  }

  ngOnInit(): void {
    this.uidMenu = this.route.snapshot.params['uidm'];
  }

  cargarBreadcrumbs() {
    return this.router.events.pipe(
      filter( (event: any) => event instanceof ActivationEnd ),
      filter( (event: ActivationEnd) => event.snapshot.firstChild === null),
      map( (event: ActivationEnd) => event.snapshot.data)
    )
  }

}
