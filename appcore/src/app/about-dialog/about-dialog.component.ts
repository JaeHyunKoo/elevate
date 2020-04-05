import { Component, Inject, OnInit, VERSION as angularCoreVersion } from "@angular/core";
import { VERSION as angularMaterialVersion } from "@angular/material/core";
import * as d3 from "d3";
import { AppUsageDetails } from "../shared/models/app-usage-details.model";
import { DataStore } from "../shared/data-store/data-store";
import { VERSIONS_PROVIDER, VersionsProvider } from "../shared/services/versions/versions-provider.interface";
import { environment } from "../../environments/environment";
import { EnvTarget } from "@elevate/shared/models";


@Component({
    selector: "app-about-dialog",
    templateUrl: "./about-dialog.component.html",
    styleUrls: ["./about-dialog.component.scss"]
})
export class AboutDialogComponent implements OnInit {

    public static readonly MAX_WIDTH: string = "40%";
    public static readonly MIN_WIDTH: string = "40%";

    public envTarget: EnvTarget = environment.target;
    public EnvTarget = EnvTarget;

    public angularCoreVersion: string;
    public angularMaterialVersion: string;
    public d3Version: string;
    public installedVersion: string;
    public appUsageDetails: AppUsageDetails;
    public remoteVersion: string;
    public buildMetadata: { commit: string, date: string };
    public wrapperVersion: string;

    constructor(public dataStore: DataStore<void>,
                @Inject(VERSIONS_PROVIDER) public versionsProvider: VersionsProvider) {
    }

    public ngOnInit(): void {

        this.dataStore.getAppUsageDetails().then((appUsageDetails: AppUsageDetails) => {
            this.appUsageDetails = appUsageDetails;
        });

        this.versionsProvider.getPackageVersion().then(version => {
            this.installedVersion = version;
        });

        this.versionsProvider.getRemoteVersion().then(version => {
            this.remoteVersion = version;
        });

        this.versionsProvider.getBuildMetadata().then((buildMetadata: { commit: string, date: string }) => {
            this.buildMetadata = buildMetadata;
            this.buildMetadata.date = this.buildMetadata.date.slice(0, 10).replace(/-/g, "");
        });

        this.angularCoreVersion = angularCoreVersion.full;
        this.angularMaterialVersion = angularMaterialVersion.full;
        this.d3Version = d3.version;
        this.wrapperVersion = this.versionsProvider.getWrapperVersion();

    }
}
