import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OptionHelperDialogComponent } from "./option-helper-dialog.component";
import { CoreModule } from "../../core/core.module";
import { SharedModule } from "../../shared/shared.module";
import { OptionHelperDataModel } from "./option-helper-data.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";


describe("OptionHelperDialogComponent", () => {
	let component: OptionHelperDialogComponent;
	let fixture: ComponentFixture<OptionHelperDialogComponent>;

	beforeEach((done: Function) => {
		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				SharedModule,
			],
			declarations: [],
			providers: [
				{
					provide: MAT_DIALOG_DATA, useValue: new OptionHelperDataModel("title", "data"),
				},
				{
					provide: MatDialogRef, useValue: {},
				},
			]
		}).compileComponents();

		done();
	});

	beforeEach((done: Function) => {
		fixture = TestBed.createComponent(OptionHelperDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		done();
	});

	it("should create", (done: Function) => {
		expect(component).toBeTruthy();
		done();
	});
});
