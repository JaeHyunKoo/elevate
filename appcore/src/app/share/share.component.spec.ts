import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ShareComponent } from "./share.component";
import { SharedModule } from "../shared/shared.module";
import { CoreModule } from "../core/core.module";

describe("ShareComponent", () => {
  let component: ShareComponent;
  let fixture: ComponentFixture<ShareComponent>;

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [CoreModule, SharedModule],
    }).compileComponents();

    done();
  });

  beforeEach(done => {
    fixture = TestBed.createComponent(ShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    done();
  });

  it("should create", done => {
    expect(component).toBeTruthy();
    done();
  });
});
