
import { Component, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../shared/shared/http.service';
import { ChemserviceService } from '../shared/shared/chemservice.service';
import { error } from 'highcharts';
import { MatSnackBar } from '@angular/material/snack-bar';
interface ImageData {
  base64ImageData: string;
  zincId: string;
  action:string;
  normalizedValue:string;
  propertyType:string;
}
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  safeUrl: SafeResourceUrl;

  // user_id: string;
  searchFilter = {
    filter: '',
  };
  suggestions: string[] = [];
  formData: FormData = new FormData();
  imageData: any;
  inchivale: any;
  imageList: ImageData[] = [];
  isExactSearch: any;
  structureErrormsg: boolean = false;
  message:any;
  generatedData:any;


  constructor(
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private router: Router,
    private http: HttpService,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private url: ChemserviceService,
    private viewContainerRef: ViewContainerRef,
    private https: HttpClient,private route: ActivatedRoute,
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      '..src/assets/remote/index1.html'
    );
  }

  ngOnInit(): void {
    console.log('search', this.searchFilter);

    const token = localStorage.getItem('token');
    if (token) {
    } else {
      console.log('Error', this.searchFilter);
    }
  }

  onSearch() {
    const searchValue = this.searchFilter.filter.trim();
    const formData = new FormData();
    formData.append('compound', searchValue);

    this.https
      .post(this.url.CHEM_SEARCH_POST, formData, { responseType: 'blob' })
      .subscribe((data: Blob) => {
        if (data) {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Convert image data to base64
            this.imageData = reader.result;
            console.log("this.imageData",this.imageData);
          };
          reader.readAsDataURL(data);
        } else {
          // Handle error or set a default image
          this.imageData = null;
        }
      });
  }

  onFocusEvent(filterValue: any) {
    filterValue = (filterValue.target as HTMLInputElement).value;
    filterValue = filterValue.trim().toLowerCase();
    console.log('getLength.length', filterValue.length);
    if (filterValue.length === 0) {
    }
  }

  generate() {
    const frm: any = document.getElementById('frmKetcher');
    const ketcher = frm.contentWindow.ketcher;
    const display: any = document.getElementById('output');
    display.innerHTML = '';
    this.generateInChI(ketcher, display, this.isExactSearch);
    this.generateInChIKey(ketcher, display);
  }

  generateInChI(ketcher: any, display: any, isExactSearch: boolean) {
    const formData = new FormData();

    const promise = ketcher.getSmiles();

    promise.then((value: any) => {
      formData.append('compound', value);
      formData.append('inchi', value);

      // Append the boolean value to FormData based on isExactSearch
      formData.append('exactMatch', isExactSearch ? 'true' : 'false');

      // Update display with InChI value
      display.innerHTML = display.innerHTML + '\nInChI:\n' + value + '\n';

      // Send POST request with FormData
      this.https
        .post<any>(this.url.SEARCH_ANY_DATA_FROM_STRUCTURE, formData)
        .subscribe(
          (response: any[]) => {
            if (isExactSearch) {
              this.router.navigate(['/categories/main'], { queryParams: { data: JSON.stringify(response) } });
            } else {
              this.router.navigate(['/categories/sub'], { queryParams: { data: JSON.stringify(response) } });
            }
            
          },
          (error) => {
            if (error) {
              this.structureErrormsg = true;
              this.message = "No such structure found!";
            } else {
              this.structureErrormsg = false;
            }
            // this.structureErrormsg = true;
            // this.message = "No such structure found!";
            // this.snackBar.open(this.message, 'Close', {
            //   duration: 3000,
            //   verticalPosition:'bottom'
            // });
          }
        );
    });
  }

  onSearchTypeChange(isExact: boolean) {
    this.isExactSearch = isExact;
    // Optionally, you can call generateInChI method or any other action you want to take based on the radio button change here
  }

  generateInChIKey(ketcher: any, display: any) {
    const promise = ketcher.getInchi();
    promise.then(
      function (value: any) {
        display.innerHTML = display.innerHTML + '\nInChIKey:\n' + value + '\n';
      },
      function (error: any) {
        display.innerHTML =
          display.innerHTML + '\nInChIKey:\n' + error.toString() + '\n';
      }
    );
  }

  // onSearch() {
  //   const searchValue = this.searchFilter.filter.trim();
  //   const apiUrl = 'http://13.201.216.250:8080/depict/cow/png/';
  //   const formData = new FormData();
  //   formData.append('smi', searchValue); // Add 'smi' value to FormData

  //   this.https.post(apiUrl, formData, { responseType: 'blob' }).subscribe(
  //     (response: Blob) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const base64data = reader.result as string;

  //         console.log('Image base64:', base64data);
  //       };
  //       reader.readAsDataURL(response);
  //     },
  //         (error: any) => {
  //       // Error callback
  //       console.error('Error fetching image:', error);
  //       // Handle error, show error message, etc.
  //     }
  //   );
  // }

  goToCategories(){
    this.router.navigate(["/categories"]);
  }
  goToStructure(){
    this.router.navigate(["/structure"]);
  }
}
