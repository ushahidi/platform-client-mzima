import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SessionService } from '@services';
import { PostsService, GeoJsonFilter, PostResult } from '@mzima-client/sdk';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['body', 'author', 'source', 'status'];
  dataSource: MatTableDataSource<PostResult>;
  length = 0;
  pageSize = 20;
  pageIndex = 0;
  showFirstLastButtons = false;
  isLoading = false;
  params: GeoJsonFilter = {
    has_location: 'all',
    limit: 20,
    offset: 0,
    order: 'desc',
    order_unlocked_on_top: true,
    orderby: 'created',
    'source[]': ['sms', 'twitter', 'web', 'email'],
    'status[]': [],
  };

  constructor(public sessionService: SessionService, private postsService: PostsService) {}

  ngOnInit() {
    this.getPosts();
  }

  ngAfterViewInit() {
    if (this.dataSource) this.dataSource.paginator = this.paginator;
  }

  getPosts() {
    this.isLoading = true;
    this.postsService.getPosts('', this.params).subscribe({
      next: (response) => {
        this.length = response.total_count;
        this.dataSource = new MatTableDataSource<PostResult>(response.results);
        this.isLoading = false;
      },
    });
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize;
    if (this.params.offset && event.pageIndex > this.pageIndex) {
      this.params.offset = this.pageSize + this.params.offset;
    }
    if (this.params.offset && event.pageIndex < this.pageIndex) {
      this.params.offset = this.params.offset - this.pageSize;
    }
    this.pageIndex = event.pageIndex;
    this.getPosts();
  }

  open(event: any) {
    console.log(event);
  }
}
